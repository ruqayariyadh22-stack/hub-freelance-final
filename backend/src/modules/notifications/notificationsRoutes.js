import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middleware/authenticate.js';
import { list, markAllAsRead, markAsRead } from './notificationsController.js';

const router = Router();

router.get('/', authenticate, asyncHandler(list));
router.patch('/read-all', authenticate, asyncHandler(markAllAsRead));
router.patch('/:id/read', authenticate, asyncHandler(markAsRead));

export default router;
