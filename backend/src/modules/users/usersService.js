import { AppError } from '../../utils/appError.js';
import { findClientProfileByUserId } from '../projects/projectsPersistence.js';
import { findFreelancerProfileByUserId } from '../proposals/proposalsPersistence.js';
import {
  findNotificationPreferencesByUserId,
  findPublicUserById,
  findUserById,
  mergeNotificationPreferencesByUserId,
  updateUserById,
} from './usersPersistence.js';
import { withDefaultPreferences } from './notificationPreferences.js';

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

const toSelfProfile = (profile) => {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
  };
};

const loadSelfProfile = async (user) => {
  if (user.role === 'client') {
    return toSelfProfile(await findClientProfileByUserId(user.id));
  }

  if (user.role === 'freelancer') {
    return toSelfProfile(await findFreelancerProfileByUserId(user.id));
  }

  return null;
};

export const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);
  const data = requireSelfUser(user);
  data.profile = await loadSelfProfile(user);
  return data;
};

export const updateCurrentUser = async (userId, payload) => {
  const user = await updateUserById(userId, payload);
  return requireSelfUser(user);
};

export const getUserById = async (userId) => {
  const user = await findPublicUserById(userId);
  return requirePublicProfile(user);
};

export const getNotificationPreferences = async (userId) => {
  const stored = await findNotificationPreferencesByUserId(userId);

  if (stored === undefined) {
    throw new AppError('User not found', 404);
  }

  return withDefaultPreferences(stored);
};

export const updateNotificationPreferences = async (userId, payload) => {
  const stored = await mergeNotificationPreferencesByUserId(userId, payload);

  if (stored === undefined) {
    throw new AppError('User not found', 404);
  }

  return withDefaultPreferences(stored);
};
