import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorizeRoles } from '../../../middleware/roleGuard.js';
import {
  create,
  listByContract,
  updateStatusById,
} from './tasksController.js';

const requireParticipant = authorizeRoles('client', 'freelancer');

const contractTasksRouter = Router({ mergeParams: true });

contractTasksRouter.get(
  '/',
  authenticate,
  requireParticipant,
  asyncHandler(listByContract),
);
contractTasksRouter.post(
  '/',
  authenticate,
  requireParticipant,
  asyncHandler(create),
);

const tasksRouter = Router();

tasksRouter.patch(
  '/:id',
  authenticate,
  requireParticipant,
  asyncHandler(updateStatusById),
);

export { contractTasksRouter };
export default tasksRouter;
