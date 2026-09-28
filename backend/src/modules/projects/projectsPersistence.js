import { query } from '../../config/db.js';

const PROJECT_COLUMNS = `
  id,
  client_id,
  title,
  description,
  category,
  budget_min,
  budget_max,
  duration,
  required_skills,
  attachments,
  status,
  chosen_freelancer_id,
  published_at
`;

const UPDATABLE_COLUMNS = [
  'title',
  'description',
  'category',
  'budget_min',
  'budget_max',
  'duration',
  'required_skills',
  'attachments',
  'status',
];

const runQuery = (executor, text, params) => {
  if (typeof executor === 'function') {
    return executor(text, params);
  }

  return executor.query(text, params);
};

export const findClientProfileByUserId = async (userId) => {
  const result = await query(
    `SELECT id, user_id
     FROM client_profiles
     WHERE user_id = $1`,
    [userId],
  );

  return result.rows[0] || null;
};

export const listProjects = async () => {
  const result = await query(
    `SELECT ${PROJECT_COLUMNS}
     FROM projects
     WHERE status = 'open'`,
  );

  return result.rows;
};

export const listProjectsByClientId = async (clientId) => {
  const result = await query(
    `SELECT ${PROJECT_COLUMNS}
     FROM projects
     WHERE client_id = $1`,
    [clientId],
  );

  return result.rows;
};

export const findProjectById = async (projectId) => {
  const result = await query(
    `SELECT ${PROJECT_COLUMNS}
     FROM projects
     WHERE id = $1`,
    [projectId],
  );

  return result.rows[0] || null;
};

export const lockProjectById = async (projectId, executor = query) => {
  const result = await runQuery(
    executor,
    `SELECT ${PROJECT_COLUMNS}
     FROM projects
     WHERE id = $1
     FOR UPDATE`,
    [projectId],
  );

  return result.rows[0] || null;
};

export const markProjectPendingApproval = async (
  projectId,
  chosenFreelancerId,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `UPDATE projects
     SET chosen_freelancer_id = $2,
         status = 'pending_approval'
     WHERE id = $1
     RETURNING ${PROJECT_COLUMNS}`,
    [projectId, chosenFreelancerId],
  );

  return result.rows[0] || null;
};

export const markProjectInProgressIfPendingApproval = async (
  projectId,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `UPDATE projects
     SET status = 'in_progress'
     WHERE id = $1
       AND status = 'pending_approval'
     RETURNING ${PROJECT_COLUMNS}`,
    [projectId],
  );

  return result.rows[0] || null;
};

export const insertProject = async (clientId, payload) => {
  const result = await query(
    `INSERT INTO projects (
       client_id,
       title,
       description,
       category,
       budget_min,
       budget_max,
       duration,
       required_skills,
       attachments,
       status,
       chosen_freelancer_id,
       published_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NULL, NULL)
     RETURNING ${PROJECT_COLUMNS}`,
    [
      clientId,
      payload.title,
      payload.description,
      Object.prototype.hasOwnProperty.call(payload, 'category')
        ? payload.category
        : null,
      Object.prototype.hasOwnProperty.call(payload, 'budget_min')
        ? payload.budget_min
        : null,
      Object.prototype.hasOwnProperty.call(payload, 'budget_max')
        ? payload.budget_max
        : null,
      Object.prototype.hasOwnProperty.call(payload, 'duration')
        ? payload.duration
        : null,
      Object.prototype.hasOwnProperty.call(payload, 'required_skills')
        ? payload.required_skills
        : null,
      Object.prototype.hasOwnProperty.call(payload, 'attachments')
        ? payload.attachments
        : null,
      Object.prototype.hasOwnProperty.call(payload, 'status')
        ? payload.status
        : null,
    ],
  );

  return result.rows[0];
};

export const updateProjectById = async (projectId, payload) => {
  const assignments = [];
  const values = [];

  UPDATABLE_COLUMNS.forEach((column) => {
    if (Object.prototype.hasOwnProperty.call(payload, column)) {
      values.push(payload[column]);
      assignments.push(`${column} = $${values.length}`);
    }
  });

  if (assignments.length === 0) {
    return findProjectById(projectId);
  }

  values.push(projectId);

  const result = await query(
    `UPDATE projects
     SET ${assignments.join(', ')}
     WHERE id = $${values.length}
     RETURNING ${PROJECT_COLUMNS}`,
    values,
  );

  return result.rows[0] || null;
};

export const deleteProjectById = async (projectId) => {
  const result = await query(
    `DELETE FROM projects
     WHERE id = $1
     RETURNING ${PROJECT_COLUMNS}`,
    [projectId],
  );

  return result.rows[0] || null;
};
