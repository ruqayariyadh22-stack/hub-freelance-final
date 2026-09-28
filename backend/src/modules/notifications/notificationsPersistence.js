import { query } from '../../config/db.js';

const NOTIFICATION_COLUMNS = `
  id,
  user_id,
  type,
  message,
  is_read,
  created_at
`;

const runQuery = (executor, text, params) => {
  if (typeof executor === 'function') {
    return executor(text, params);
  }

  return executor.query(text, params);
};

export const insertNotification = async (
  { userId, type, message },
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `INSERT INTO notifications (
       user_id,
       type,
       message,
       is_read,
       created_at
     )
     VALUES ($1, $2, $3, FALSE, CURRENT_TIMESTAMP)
     RETURNING ${NOTIFICATION_COLUMNS}`,
    [userId, type, message],
  );

  return result.rows[0];
};

export const findNotificationById = async (notificationId) => {
  const result = await query(
    `SELECT ${NOTIFICATION_COLUMNS}
     FROM notifications
     WHERE id = $1`,
    [notificationId],
  );

  return result.rows[0] || null;
};

export const listNotificationsByUserId = async (userId) => {
  const result = await query(
    `SELECT ${NOTIFICATION_COLUMNS}
     FROM notifications
     WHERE user_id = $1`,
    [userId],
  );

  return result.rows;
};

export const markNotificationReadForUser = async (notificationId, userId) => {
  const result = await query(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE id = $1
       AND user_id = $2
     RETURNING ${NOTIFICATION_COLUMNS}`,
    [notificationId, userId],
  );

  return result.rows[0] || null;
};
