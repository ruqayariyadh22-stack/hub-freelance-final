import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/authenticate.js';
import {
  authorizeRoles,
  requireClient,
  requireFreelancer,
} from '../../../middleware/roleGuard.js';
import { approveById, create, listByContract, rejectById } from './scopeChangesController.js';

const requireParticipant = authorizeRoles('client', 'freelancer');
const contractScopeChangesRouter = Router({ mergeParams: true });

contractScopeChangesRouter.get(
  '/',
  authenticate,
  requireParticipant,
  asyncHandler(listByContract),
);
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
