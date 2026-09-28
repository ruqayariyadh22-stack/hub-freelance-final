import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middleware/authenticate.js';
import { list, markAsRead } from './notificationsController.js';

const router = Router();

router.get('/', authenticate, asyncHandler(list));
router.patch('/:id/read', authenticate, asyncHandler(markAsRead));

export default router;
