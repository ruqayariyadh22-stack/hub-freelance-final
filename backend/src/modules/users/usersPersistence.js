import { query } from '../../config/db.js';

const SELF_USER_COLUMNS = `
  id,
  name,
  email,
  phone,
  role,
  profile_image,
  account_status,
  created_at
`;

const PUBLIC_PROFILE_COLUMNS = `
  id,
  name,
  role,
  profile_image,
  created_at
`;

const UPDATABLE_COLUMNS = ['name', 'phone', 'profile_image'];

export const findUserById = async (userId) => {
  const result = await query(
    `SELECT ${SELF_USER_COLUMNS}
     FROM users
     WHERE id = $1`,
    [userId],
  );

  return result.rows[0] || null;
};

export const findPublicUserById = async (userId) => {
  const result = await query(
    `SELECT ${PUBLIC_PROFILE_COLUMNS}
     FROM users
     WHERE id = $1`,
    [userId],
  );

  return result.rows[0] || null;
};

export const updateUserById = async (userId, payload) => {
  const assignments = [];
  const values = [];

  UPDATABLE_COLUMNS.forEach((column) => {
    if (Object.prototype.hasOwnProperty.call(payload, column)) {
      values.push(payload[column]);
      assignments.push(`${column} = $${values.length}`);
    }
  });

  if (assignments.length === 0) {
    return findUserById(userId);
  }

  values.push(userId);

  const result = await query(
    `UPDATE users
     SET ${assignments.join(', ')}
     WHERE id = $${values.length}
     RETURNING ${SELF_USER_COLUMNS}`,
    values,
  );

  return result.rows[0] || null;
};

export const findNotificationPreferencesByUserId = async (userId) => {
  const result = await query(
    `SELECT notification_preferences
     FROM users
     WHERE id = $1`,
    [userId],
  );

  return result.rows[0] ? result.rows[0].notification_preferences : undefined;
};

export const mergeNotificationPreferencesByUserId = async (userId, preferences) => {
  const result = await query(
    `UPDATE users
     SET notification_preferences = COALESCE(notification_preferences, '{}'::jsonb) || $1::jsonb
     WHERE id = $2
     RETURNING notification_preferences`,
    [JSON.stringify(preferences), userId],
  );

  return result.rows[0] ? result.rows[0].notification_preferences : undefined;
};
