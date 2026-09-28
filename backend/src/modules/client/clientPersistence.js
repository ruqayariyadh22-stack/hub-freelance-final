import { query } from '../../config/db.js';

const CLIENT_PROFILE_COLUMNS = `
  id,
  user_id,
  company_name,
  logo
`;

const UPDATABLE_COLUMNS = ['company_name', 'logo'];

const runQuery = (executor, text, params) => {
  if (typeof executor === 'function') {
    return executor(text, params);
  }

  return executor.query(text, params);
};

export const insertClientProfile = async ({ userId }, executor = query) => {
  const result = await runQuery(
    executor,
    `INSERT INTO client_profiles (user_id, company_name, logo)
     VALUES ($1, NULL, NULL)
     RETURNING ${CLIENT_PROFILE_COLUMNS}`,
    [userId],
  );

  return result.rows[0];
};

export const findClientProfileById = async (clientId) => {
  const result = await query(
    `SELECT ${CLIENT_PROFILE_COLUMNS}
     FROM client_profiles
     WHERE id = $1`,
    [clientId],
  );

  return result.rows[0] || null;
};

export const updateClientProfileById = async (clientId, payload) => {
  const assignments = [];
  const values = [];

  UPDATABLE_COLUMNS.forEach((column) => {
    if (Object.prototype.hasOwnProperty.call(payload, column)) {
      values.push(payload[column]);
      assignments.push(`${column} = $${values.length}`);
    }
  });

  if (assignments.length === 0) {
    return findClientProfileById(clientId);
  }

  values.push(clientId);

  const result = await query(
    `UPDATE client_profiles
     SET ${assignments.join(', ')}
     WHERE id = $${values.length}
     RETURNING ${CLIENT_PROFILE_COLUMNS}`,
    values,
  );

  return result.rows[0] || null;
};
