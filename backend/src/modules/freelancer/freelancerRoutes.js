import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireClient, requireFreelancer } from '../../middleware/roleGuard.js';
import { getById, list, updateById } from './freelancerController.js';
import { listForFreelancer } from '../proposals/proposalsController.js';
import skillsRoutes from './skills/skillsRoutes.js';
import { freelancerServicesRouter } from './services/servicesRoutes.js';
import portfolioRoutes from './portfolio/portfolioRoutes.js';
import { freelancerReviewsRouter } from '../reviews/reviewsRoutes.js';
import freelancerAdvertisementsRouter from './advertisements/advertisementsRoutes.js';
import freelancerStatisticsRouter from './statistics/statisticsRoutes.js';

const router = Router();

router.use('/me/advertisements', freelancerAdvertisementsRouter);
router.use('/me/statistics', freelancerStatisticsRouter);
router.get('/', authenticate, requireClient, asyncHandler(list));
router.get('/:id/proposals', authenticate, requireFreelancer, asyncHandler(listForFreelancer));
router.use('/:id/skills', skillsRoutes);
router.use('/:id/services', freelancerServicesRouter);
router.use('/:id/portfolio', portfolioRoutes);
router.use('/:id/reviews', freelancerReviewsRouter);
router.get('/:id', asyncHandler(getById));
router.patch('/:id', authenticate, requireFreelancer, asyncHandler(updateById));

export default router;
