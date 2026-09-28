import { AppError } from '../../utils/appError.js';
import { withTransaction } from '../../config/db.js';
import { signAccessToken } from '../../utils/jwt.js';
import { comparePassword, hashPassword } from '../../utils/password.js';
import {
  generateResetToken,
  getResetTokenExpiresAt,
  hashResetToken,
} from '../../utils/resetToken.js';
import { sendPasswordResetEmail } from '../../services/emailService.js';
import { insertClientProfile } from '../client/clientPersistence.js';
import { insertFreelancerProfile } from '../freelancer/freelancerPersistence.js';
import { findUserById } from '../users/usersPersistence.js';
import { insertWalletForUser } from '../wallet/walletPersistence.js';
import {
  NOTIFICATION_TYPES,
  notifyUser,
} from '../notifications/notificationMessages.js';
import {
  findPasswordResetTokenByHash,
  findUserByEmail,
  insertPasswordResetToken,
  insertUser,
  invalidateUnusedPasswordResetTokensByUserId,
  markPasswordResetTokenUsedById,
  updateUserPasswordHashById,
} from './authPersistence.js';

const FORGOT_PASSWORD_RESULT = {};
const RESET_PASSWORD_RESULT = {};
const RESET_TOKEN_ERROR = 'Invalid or expired reset token';

const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  profile_image: user.profile_image,
  account_status: user.account_status,
  created_at: user.created_at,
});

const createAccessToken = (user) => {
  return signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
};

export const registerUser = async ({
  name,
  email,
  password,
  phone,
  role,
  profile_image,
}) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError('Email is already registered', 409);
  }

  const passwordHash = await hashPassword(password);

  try {
    const user = await withTransaction(async (client) => {
      const createdUser = await insertUser(
        {
          name,
          email,
          passwordHash,
          phone,
          role,
          profileImage: profile_image,
        },
        client,
      );

      if (role === 'client') {
        await insertClientProfile({ userId: createdUser.id }, client);
        await insertWalletForUser(createdUser.id, client);
      }

      if (role === 'freelancer') {
        await insertFreelancerProfile({ userId: createdUser.id }, client);
        await insertWalletForUser(createdUser.id, client);
      }

      return createdUser;
    });

    return {
      user: toPublicUser(user),
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error.code === '23505') {
      throw new AppError('Email is already registered', 409);
    }

    throw error;
  }
};

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user || !user.password_hash) {
    throw new AppError('Invalid email or password', 401);
  }

  const passwordMatches = await comparePassword(password, user.password_hash);

  if (!passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.account_status === 'disabled') {
    throw new AppError('Account is disabled', 403);
  }

  const token = createAccessToken(user);

  await notifyUser({
    userId: user.id,
    type: NOTIFICATION_TYPES.LOGIN_SUCCESS,
  });

  return {
    user: toPublicUser(user),
    token,
  };
};

export const logoutUser = async () => {
  return {};
};

export const forgotPassword = async ({ email }) => {
  const user = await findUserByEmail(email);

  if (!user || user.account_status !== 'active') {
    return FORGOT_PASSWORD_RESULT;
  }

  const rawToken = generateResetToken();
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = getResetTokenExpiresAt();

  await withTransaction(async (client) => {
    await invalidateUnusedPasswordResetTokensByUserId(user.id, client);
    await insertPasswordResetToken(
      {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
      client,
    );
  });

  await sendPasswordResetEmail({
    to: user.email,
    resetToken: rawToken,
  });

  return FORGOT_PASSWORD_RESULT;
};

export const resetPassword = async ({ token, password }) => {
  const tokenHash = hashResetToken(token);
  const resetToken = await findPasswordResetTokenByHash(tokenHash);

  if (
    !resetToken ||
    resetToken.used_at ||
    new Date(resetToken.expires_at).getTime() <= Date.now()
  ) {
    throw new AppError(RESET_TOKEN_ERROR, 400);
  }

  const user = await findUserById(resetToken.user_id);

  if (!user) {
    throw new AppError(RESET_TOKEN_ERROR, 400);
  }

  if (user.account_status === 'disabled') {
    throw new AppError('Account is disabled', 403);
  }

  const passwordHash = await hashPassword(password);

  await withTransaction(async (client) => {
    const updated = await updateUserPasswordHashById(
      user.id,
      passwordHash,
      client,
    );

    if (!updated) {
      throw new AppError(RESET_TOKEN_ERROR, 400);
    }

    const consumed = await markPasswordResetTokenUsedById(resetToken.id, client);

    if (!consumed) {
      throw new AppError(RESET_TOKEN_ERROR, 400);
    }
  });

  return RESET_PASSWORD_RESULT;
};
