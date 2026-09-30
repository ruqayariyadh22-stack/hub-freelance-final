import { query } from '../../config/db.js';

const USAGE_COLUMNS = `
  id,
  user_id,
  action,
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
     WHERE user_id = $1
     ORDER BY id DESC`,
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

export const countUsageLogsForUserActionInCurrentMonth = async (
  userId,
  action,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `SELECT COUNT(*)::int AS usage_count
     FROM ai_usage_logs
     WHERE user_id = $1
       AND action = $2
       AND date_trunc('month', created_at) = date_trunc('month', CURRENT_TIMESTAMP)`,
    [userId, action],
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

export const insertUsageLog = async (
  { userId, action = null },
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `INSERT INTO ai_usage_logs (
       user_id,
       action
     )
     VALUES ($1, $2)
     RETURNING ${USAGE_COLUMNS}`,
    [userId, action],
  );

  return result.rows[0];
};
