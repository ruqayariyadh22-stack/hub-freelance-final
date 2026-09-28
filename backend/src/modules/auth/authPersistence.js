import { query } from '../../config/db.js';

const USER_COLUMNS = `
  id,
  name,
  email,
  password_hash,
  phone,
  role,
  profile_image,
  account_status,
  created_at
`;

const runQuery = (executor, text, params) => {
  if (typeof executor === 'function') {
    return executor(text, params);
  }

  return executor.query(text, params);
};

export const findUserByEmail = async (email) => {
  const result = await query(
    `SELECT ${USER_COLUMNS}
     FROM users
     WHERE email = $1`,
    [email],
  );

  return result.rows[0] || null;
};

export const insertUser = async (
  {
    name,
    email,
    passwordHash,
    phone,
    role,
    profileImage,
  },
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `INSERT INTO users (
       name,
       email,
       password_hash,
       phone,
       role,
       profile_image,
       account_status,
       created_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, 'active', CURRENT_TIMESTAMP)
     RETURNING id, name, email, phone, role, profile_image, account_status, created_at`,
    [name, email, passwordHash, phone, role, profileImage],
  );

  return result.rows[0];
};

const RESET_TOKEN_COLUMNS = `
  id,
  user_id,
  token_hash,
  expires_at,
  used_at,
  created_at
`;

export const insertPasswordResetToken = async (
  { userId, tokenHash, expiresAt },
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `INSERT INTO password_reset_tokens (
       user_id,
       token_hash,
       expires_at,
       used_at,
       created_at
     )
     VALUES ($1, $2, $3, NULL, CURRENT_TIMESTAMP)
     RETURNING ${RESET_TOKEN_COLUMNS}`,
    [userId, tokenHash, expiresAt],
  );

  return result.rows[0];
};

export const findPasswordResetTokenByHash = async (
  tokenHash,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `SELECT ${RESET_TOKEN_COLUMNS}
     FROM password_reset_tokens
     WHERE token_hash = $1`,
    [tokenHash],
  );

  return result.rows[0] || null;
};

export const markPasswordResetTokenUsedById = async (
  tokenId,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `UPDATE password_reset_tokens
     SET used_at = CURRENT_TIMESTAMP
     WHERE id = $1
       AND used_at IS NULL
     RETURNING ${RESET_TOKEN_COLUMNS}`,
    [tokenId],
  );

  return result.rows[0] || null;
};

export const invalidateUnusedPasswordResetTokensByUserId = async (
  userId,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `UPDATE password_reset_tokens
     SET used_at = CURRENT_TIMESTAMP
     WHERE user_id = $1
       AND used_at IS NULL
     RETURNING ${RESET_TOKEN_COLUMNS}`,
    [userId],
  );

  return result.rows;
};

export const updateUserPasswordHashById = async (
  userId,
  passwordHash,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `UPDATE users
     SET password_hash = $1
     WHERE id = $2
     RETURNING ${USER_COLUMNS}`,
    [passwordHash, userId],
  );

  return result.rows[0] || null;
};
