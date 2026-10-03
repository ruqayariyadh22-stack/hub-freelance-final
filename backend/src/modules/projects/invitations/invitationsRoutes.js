import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/authenticate.js';
import { requireFreelancer } from '../../../middleware/roleGuard.js';
import { decline, listMine } from './invitationsController.js';

const router = Router();

router.get('/', authenticate, requireFreelancer, asyncHandler(listMine));
router.patch('/:id/decline', authenticate, requireFreelancer, asyncHandler(decline));

export default router;
