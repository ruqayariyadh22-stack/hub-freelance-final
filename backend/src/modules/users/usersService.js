import { AppError } from '../../utils/appError.js';
import { findPublicUserById, findUserById, updateUserById } from './usersPersistence.js';

const toSelfUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  profile_image: user.profile_image,
  account_status: user.account_status,
  created_at: user.created_at,
});

const toPublicProfile = (user) => ({
  id: user.id,
  name: user.name,
  role: user.role,
  profile_image: user.profile_image,
  created_at: user.created_at,
});

const requireSelfUser = (user) => {
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return toSelfUser(user);
};

const requirePublicProfile = (user) => {
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return toPublicProfile(user);
};

export const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);
  return requireSelfUser(user);
};

export const updateCurrentUser = async (userId, payload) => {
  const user = await updateUserById(userId, payload);
  return requireSelfUser(user);
};

export const getUserById = async (userId) => {
  const user = await findPublicUserById(userId);
  return requirePublicProfile(user);
};
