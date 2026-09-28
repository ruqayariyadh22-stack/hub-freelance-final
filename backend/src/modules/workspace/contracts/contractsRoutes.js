import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorizeRoles } from '../../../middleware/roleGuard.js';
import { getById, updateStatusById } from './contractsController.js';
import { contractTasksRouter } from '../tasks/tasksRoutes.js';
import { contractScopeChangesRouter } from '../scope-changes/scopeChangesRoutes.js';
import { contractReviewRouter } from '../../reviews/reviewsRoutes.js';

const requireContractParticipant = authorizeRoles('client', 'freelancer');
const router = Router();

router.use('/:id/tasks', contractTasksRouter);
router.use('/:id/scope-changes', contractScopeChangesRouter);
router.use('/:id/review', contractReviewRouter);
router.get(
  '/:id',
  authenticate,
  requireContractParticipant,
  asyncHandler(getById),
);
router.patch(
  '/:id/status',
  authenticate,
  requireContractParticipant,
  asyncHandler(updateStatusById),
);

export default router;
