import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/authenticate.js';
import { requireClient, requireFreelancer } from '../../../middleware/roleGuard.js';
import { approveById, create, rejectById } from './scopeChangesController.js';

const contractScopeChangesRouter = Router({ mergeParams: true });

contractScopeChangesRouter.post(
  '/',
  authenticate,
  requireFreelancer,
  asyncHandler(create),
);

const scopeChangesRouter = Router();

scopeChangesRouter.patch(
  '/:id/approve',
  authenticate,
  requireClient,
  asyncHandler(approveById),
);
scopeChangesRouter.patch(
  '/:id/reject',
  authenticate,
  requireClient,
  asyncHandler(rejectById),
);

export { contractScopeChangesRouter };
export default scopeChangesRouter;
