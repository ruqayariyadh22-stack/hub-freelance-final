import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/authenticate.js';
import { requireFreelancer } from '../../../middleware/roleGuard.js';
import { create, listMine, listPublic } from './advertisementsController.js';

const freelancerAdvertisementsRouter = Router();

freelancerAdvertisementsRouter.get(
  '/',
  authenticate,
  requireFreelancer,
  asyncHandler(listMine),
);
freelancerAdvertisementsRouter.post(
  '/',
  authenticate,
  requireFreelancer,
  asyncHandler(create),
);

const publicAdvertisementsRouter = Router();

publicAdvertisementsRouter.get('/', asyncHandler(listPublic));

export { publicAdvertisementsRouter };
export default freelancerAdvertisementsRouter;
