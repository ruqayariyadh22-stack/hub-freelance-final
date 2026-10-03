import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middleware/authenticate.js';
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
} from './authController.js';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/logout', authenticate, asyncHandler(logout));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));
router.post('/change-password', authenticate, asyncHandler(changePassword));

export default router;
