import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorizeRoles } from '../../../middleware/roleGuard.js';
import { create, list, listByConversation } from './chatController.js';

const requireParticipant = authorizeRoles('client', 'freelancer');
const router = Router();

router.get('/', authenticate, asyncHandler(list));
router.get(
  '/:id/messages',
  authenticate,
  requireParticipant,
  asyncHandler(listByConversation),
);
router.post(
  '/:id/messages',
  authenticate,
  requireParticipant,
  asyncHandler(create),
);

export default router;
