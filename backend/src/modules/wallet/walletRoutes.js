import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles, requireClient } from '../../middleware/roleGuard.js';
import {
  escrow,
  getMe,
  listTransactions,
  releaseByContractId,
  topup,
  withdraw,
} from './walletController.js';

const router = Router();

router.get('/', authenticate, asyncHandler(getMe));
router.get('/transactions', authenticate, asyncHandler(listTransactions));
router.post('/topup', authenticate, requireClient, asyncHandler(topup));
router.post(
  '/withdraw',
  authenticate,
  authorizeRoles('client', 'freelancer'),
  asyncHandler(withdraw),
);
router.post(
  '/escrow/:contractId',
  authenticate,
  requireClient,
  asyncHandler(escrow),
);
router.post(
  '/release/:contractId',
  authenticate,
  requireClient,
  asyncHandler(releaseByContractId),
);

export default router;
