import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireFreelancer } from '../../middleware/roleGuard.js';
import {
  cancel,
  create,
  getMe,
  listPlans,
  renew,
} from './subscriptionsController.js';

const router = Router();

router.get('/plans', authenticate, requireFreelancer, asyncHandler(listPlans));
router.get('/me', authenticate, requireFreelancer, asyncHandler(getMe));
router.post('/', authenticate, requireFreelancer, asyncHandler(create));
router.post('/cancel', authenticate, requireFreelancer, asyncHandler(cancel));
router.post('/renew', authenticate, requireFreelancer, asyncHandler(renew));

export default router;
