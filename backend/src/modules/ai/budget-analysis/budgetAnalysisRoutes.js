import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/authenticate.js';
import { requireFreelancer } from '../../../middleware/roleGuard.js';
import { create } from './budgetAnalysisController.js';

const router = Router();

router.post('/', authenticate, requireFreelancer, asyncHandler(create));

export default router;
