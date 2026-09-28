import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/authenticate.js';
import { requireFreelancer } from '../../../middleware/roleGuard.js';
import { addSkill } from './skillsController.js';

const router = Router({ mergeParams: true });

router.post('/', authenticate, requireFreelancer, asyncHandler(addSkill));

export default router;
