import { validateUpdateMe, validateUserIdParam } from './usersValidation.js';
import {
  getCurrentUser,
  getUserById,
  updateCurrentUser,
} from './usersService.js';

export const getMe = async (req, res) => {
  const data = await getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    data,
  });
};

export const updateMe = async (req, res) => {
  const payload = validateUpdateMe(req.body);
  const data = await updateCurrentUser(req.user.id, payload);

  res.status(200).json({
    success: true,
    data,
  });
};

export const getById = async (req, res) => {
  const userId = validateUserIdParam(req.params.id);
  const data = await getUserById(userId);

  res.status(200).json({
    success: true,
    data,
  });
};
