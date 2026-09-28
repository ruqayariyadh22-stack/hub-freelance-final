import { query } from '../../config/db.js';

const USAGE_COLUMNS = `
  id,
  user_id,
  created_at
`;

const runQuery = (executor, text, params) => {
  if (typeof executor === 'function') {
    return executor(text, params);
  }

  return executor.query(text, params);
};

export const listUsageLogsByUserId = async (userId, executor = query) => {
  const result = await runQuery(
    executor,
    `SELECT ${USAGE_COLUMNS}
     FROM ai_usage_logs
     WHERE user_id = $1`,
    [userId],
  );

  return result.rows;
};

export const countUsageLogsForUserOnCurrentDate = async (
  userId,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `SELECT COUNT(*)::int AS usage_count
     FROM ai_usage_logs
     WHERE user_id = $1
       AND created_at::date = CURRENT_DATE`,
    [userId],
  );

  return result.rows[0].usage_count;
};

export const lockUserForAiUsage = async (userId, executor) => {
  const result = await runQuery(
    executor,
    `SELECT id
     FROM users
     WHERE id = $1
     FOR UPDATE`,
    [userId],
  );

  return result.rows[0] || null;
};

export const insertUsageLog = async ({ userId }, executor = query) => {
  const result = await runQuery(
    executor,
    `INSERT INTO ai_usage_logs (
       user_id
     )
     VALUES ($1)
     RETURNING ${USAGE_COLUMNS}`,
    [userId],
  );

  return result.rows[0];
};
