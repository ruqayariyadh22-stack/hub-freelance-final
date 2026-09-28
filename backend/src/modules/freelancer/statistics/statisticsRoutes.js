import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/authenticate.js';
import { requireFreelancer } from '../../../middleware/roleGuard.js';
import { getMine } from './statisticsController.js';

const freelancerStatisticsRouter = Router();

freelancerStatisticsRouter.get(
  '/',
  authenticate,
  requireFreelancer,
  asyncHandler(getMine),
);

export default freelancerStatisticsRouter;
