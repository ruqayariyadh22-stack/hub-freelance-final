import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/authenticate.js';
import { requireAdmin, requireFreelancer } from '../../../middleware/roleGuard.js';
import {
  approveById,
  create,
  listApproved,
  listPending,
  rejectById,
} from './specialtiesController.js';

const specialtiesRouter = Router();

specialtiesRouter.post('/', authenticate, requireFreelancer, asyncHandler(create));
specialtiesRouter.get('/', asyncHandler(listApproved));

const adminSpecialtiesRouter = Router();

adminSpecialtiesRouter.get(
  '/pending',
  authenticate,
  requireAdmin,
  asyncHandler(listPending),
);
adminSpecialtiesRouter.patch(
  '/:id/approve',
  authenticate,
  requireAdmin,
  asyncHandler(approveById),
);
adminSpecialtiesRouter.patch(
  '/:id/reject',
  authenticate,
  requireAdmin,
  asyncHandler(rejectById),
);

export { adminSpecialtiesRouter };
export default specialtiesRouter;
