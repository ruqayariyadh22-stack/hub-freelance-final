import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/authenticate.js';
import { requireFreelancer } from '../../../middleware/roleGuard.js';
import {
  create,
  featureById,
  listByFreelancer,
  removeById,
  unfeatureById,
  updateById,
} from './servicesController.js';

const freelancerServicesRouter = Router({ mergeParams: true });

freelancerServicesRouter.get('/', asyncHandler(listByFreelancer));

const servicesRouter = Router();

servicesRouter.post('/', authenticate, requireFreelancer, asyncHandler(create));
servicesRouter.patch(
  '/:id/feature',
  authenticate,
  requireFreelancer,
  asyncHandler(featureById),
);
servicesRouter.patch(
  '/:id/unfeature',
  authenticate,
  requireFreelancer,
  asyncHandler(unfeatureById),
);
servicesRouter.patch(
  '/:id',
  authenticate,
  requireFreelancer,
  asyncHandler(updateById),
);
servicesRouter.delete(
  '/:id',
  authenticate,
  requireFreelancer,
  asyncHandler(removeById),
);

export { freelancerServicesRouter };
export default servicesRouter;
