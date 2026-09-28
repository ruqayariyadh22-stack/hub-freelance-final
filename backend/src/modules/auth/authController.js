import {
  validateForgotPassword,
  validateLogin,
  validateRegister,
  validateResetPassword,
} from './authValidation.js';
import {
  forgotPassword as forgotPasswordService,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword as resetPasswordService,
} from './authService.js';

export const register = async (req, res) => {
  const payload = validateRegister(req.body);
  const data = await registerUser(payload);

  res.status(201).json({
    success: true,
    data,
  });
};

export const login = async (req, res) => {
  const payload = validateLogin(req.body);
  const data = await loginUser(payload);

  res.status(200).json({
    success: true,
    data,
  });
};

export const logout = async (req, res) => {
  const data = await logoutUser(req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const forgotPassword = async (req, res) => {
  const payload = validateForgotPassword(req.body);
  const data = await forgotPasswordService(payload);

  res.status(200).json({
    success: true,
    data,
  });
};

export const resetPassword = async (req, res) => {
  const payload = validateResetPassword(req.body);
  const data = await resetPasswordService(payload);

  res.status(200).json({
    success: true,
    data,
  });
};
