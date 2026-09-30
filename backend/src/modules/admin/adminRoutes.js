import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireAdmin } from '../../middleware/roleGuard.js';
import {
  deleteProjectById,
  deleteReviewById,
  deleteServiceById,
  deleteUserById,
  getDisputeById,
  getProjectById,
  getReviewById,
  getServiceById,
  getStats,
  getSubscriptionById,
  getUserById,
  listContracts,
  listDisputes,
  listPayments,
  listProjects,
  listReviews,
  listServices,
  listSubscriptions,
  listUsers,
  updateDisputeById,
  updateProjectById,
  updateServiceById,
  updateSubscriptionById,
  updateUserById,
} from './adminController.js';

const router = Router();
const adminOnly = [authenticate, requireAdmin];

router.get('/stats', ...adminOnly, asyncHandler(getStats));

router.get('/users', ...adminOnly, asyncHandler(listUsers));
router.get('/users/:id', ...adminOnly, asyncHandler(getUserById));
router.patch('/users/:id', ...adminOnly, asyncHandler(updateUserById));
router.delete('/users/:id', ...adminOnly, asyncHandler(deleteUserById));

router.get('/services', ...adminOnly, asyncHandler(listServices));
router.get('/services/:id', ...adminOnly, asyncHandler(getServiceById));
router.patch('/services/:id', ...adminOnly, asyncHandler(updateServiceById));
router.delete('/services/:id', ...adminOnly, asyncHandler(deleteServiceById));

router.get('/projects', ...adminOnly, asyncHandler(listProjects));
router.get('/projects/:id', ...adminOnly, asyncHandler(getProjectById));
router.patch('/projects/:id', ...adminOnly, asyncHandler(updateProjectById));
router.delete('/projects/:id', ...adminOnly, asyncHandler(deleteProjectById));

router.get('/contracts', ...adminOnly, asyncHandler(listContracts));

router.get('/subscriptions', ...adminOnly, asyncHandler(listSubscriptions));
router.get('/subscriptions/:id', ...adminOnly, asyncHandler(getSubscriptionById));
router.patch('/subscriptions/:id', ...adminOnly, asyncHandler(updateSubscriptionById));

router.get('/payments', ...adminOnly, asyncHandler(listPayments));

router.get('/disputes', ...adminOnly, asyncHandler(listDisputes));
router.get('/disputes/:id', ...adminOnly, asyncHandler(getDisputeById));
router.patch('/disputes/:id', ...adminOnly, asyncHandler(updateDisputeById));

router.get('/reviews', ...adminOnly, asyncHandler(listReviews));
router.get('/reviews/:id', ...adminOnly, asyncHandler(getReviewById));
router.delete('/reviews/:id', ...adminOnly, asyncHandler(deleteReviewById));

export default router;
