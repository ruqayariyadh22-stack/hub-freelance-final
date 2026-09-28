import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/authenticate.js';
import { requireFreelancer } from '../../../middleware/roleGuard.js';
import {
  addItem,
  listByFreelancer,
  removeById,
  updateById,
} from './portfolioController.js';

const router = Router({ mergeParams: true });

router.get('/', asyncHandler(listByFreelancer));
router.post('/', authenticate, requireFreelancer, asyncHandler(addItem));
router.patch(
  '/:portfolioId',
  authenticate,
  requireFreelancer,
  asyncHandler(updateById),
);
router.delete(
  '/:portfolioId',
  authenticate,
  requireFreelancer,
  asyncHandler(removeById),
);

export default router;
