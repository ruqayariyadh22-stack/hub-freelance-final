import { query } from '../../config/db.js';

const FREELANCER_PROFILE_COLUMNS = `
  id,
  user_id,
  specialty_id,
  bio,
  experience_years,
  rating_avg,
  completed_projects_count,
  subscription_status
`;

const UPDATABLE_COLUMNS = ['specialty_id', 'bio', 'experience_years'];

const runQuery = (executor, text, params) => {
  if (typeof executor === 'function') {
    return executor(text, params);
  }

  return executor.query(text, params);
};

export const insertFreelancerProfile = async ({ userId }, executor = query) => {
  const result = await runQuery(
    executor,
    `INSERT INTO freelancer_profiles (
       user_id,
       specialty_id,
       bio,
       experience_years,
       rating_avg,
       completed_projects_count,
       subscription_status
     )
     VALUES ($1, NULL, NULL, NULL, NULL, NULL, NULL)
     RETURNING ${FREELANCER_PROFILE_COLUMNS}`,
    [userId],
  );

  return result.rows[0];
};

export const listFreelancerProfiles = async () => {
  const result = await query(
    `SELECT ${FREELANCER_PROFILE_COLUMNS}
     FROM freelancer_profiles`,
  );

  return result.rows;
};

export const findFreelancerProfileById = async (freelancerId) => {
  const result = await query(
    `SELECT ${FREELANCER_PROFILE_COLUMNS}
     FROM freelancer_profiles
     WHERE id = $1`,
    [freelancerId],
  );

  return result.rows[0] || null;
};

export const updateFreelancerProfileById = async (freelancerId, payload) => {
  const assignments = [];
  const values = [];

  UPDATABLE_COLUMNS.forEach((column) => {
    if (Object.prototype.hasOwnProperty.call(payload, column)) {
      values.push(payload[column]);
      assignments.push(`${column} = $${values.length}`);
    }
  });

  if (assignments.length === 0) {
    return findFreelancerProfileById(freelancerId);
  }

  values.push(freelancerId);

  const result = await query(
    `UPDATE freelancer_profiles
     SET ${assignments.join(', ')}
     WHERE id = $${values.length}
     RETURNING ${FREELANCER_PROFILE_COLUMNS}`,
    values,
  );

  return result.rows[0] || null;
};
