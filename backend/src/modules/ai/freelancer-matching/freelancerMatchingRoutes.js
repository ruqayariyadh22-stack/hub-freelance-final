import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/authenticate.js';
import { requireClient } from '../../../middleware/roleGuard.js';
import { create } from './freelancerMatchingController.js';

const router = Router();

router.post('/', authenticate, requireClient, asyncHandler(create));

export default router;
