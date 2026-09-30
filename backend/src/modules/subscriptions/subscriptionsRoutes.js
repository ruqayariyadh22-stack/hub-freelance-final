import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles } from '../../middleware/roleGuard.js';
import {
  cancel,
  create,
  getMe,
  listPlans,
  renew,
} from './subscriptionsController.js';

const router = Router();
const clientOrFreelancer = [authenticate, authorizeRoles('client', 'freelancer')];

router.get('/plans', ...clientOrFreelancer, asyncHandler(listPlans));
router.get('/me', ...clientOrFreelancer, asyncHandler(getMe));
router.post('/', ...clientOrFreelancer, asyncHandler(create));
router.post('/cancel', ...clientOrFreelancer, asyncHandler(cancel));
router.post('/renew', ...clientOrFreelancer, asyncHandler(renew));

export default router;
