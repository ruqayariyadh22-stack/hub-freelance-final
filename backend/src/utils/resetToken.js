import { createHash, randomBytes } from 'crypto';

export const PASSWORD_RESET_TOKEN_TTL_MINUTES = 15;
export const PASSWORD_RESET_TOKEN_BYTES = 32;

export const generateResetToken = () => {
  return randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString('hex');
};

export const hashResetToken = (token) => {
  return createHash('sha256').update(token).digest('hex');
};

export const getResetTokenExpiresAt = (from = new Date()) => {
  return new Date(
    from.getTime() + PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000,
  );
};
