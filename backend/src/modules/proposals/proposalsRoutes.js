import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireClient, requireFreelancer } from '../../middleware/roleGuard.js';
import {
  acceptById,
  rejectById,
  updateById,
} from './proposalsController.js';

const router = Router();

router.patch('/:id/accept', authenticate, requireClient, asyncHandler(acceptById));
router.patch('/:id/reject', authenticate, requireClient, asyncHandler(rejectById));
router.patch('/:id', authenticate, requireFreelancer, asyncHandler(updateById));

export default router;
