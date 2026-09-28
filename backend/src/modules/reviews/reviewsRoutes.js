import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles } from '../../middleware/roleGuard.js';
import { create, listByFreelancer } from './reviewsController.js';

const requireReviewer = authorizeRoles('client', 'freelancer');

const contractReviewRouter = Router({ mergeParams: true });

contractReviewRouter.post(
  '/',
  authenticate,
  requireReviewer,
  asyncHandler(create),
);

const freelancerReviewsRouter = Router({ mergeParams: true });

freelancerReviewsRouter.get('/', asyncHandler(listByFreelancer));

export { contractReviewRouter, freelancerReviewsRouter };
