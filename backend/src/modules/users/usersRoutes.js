import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middleware/authenticate.js';
import {
  getById,
  getMe,
  getPreferences,
  updateMe,
  updatePreferences,
} from './usersController.js';

const router = Router();

router.get('/me', authenticate, asyncHandler(getMe));
router.patch('/me', authenticate, asyncHandler(updateMe));
router.get('/me/preferences', authenticate, asyncHandler(getPreferences));
router.patch('/me/preferences', authenticate, asyncHandler(updatePreferences));
router.get('/:id', asyncHandler(getById));

export default router;
