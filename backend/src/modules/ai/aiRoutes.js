import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middleware/authenticate.js';
import { getUsage } from './aiUsageController.js';
import projectAnalysisRoutes from './project-analysis/projectAnalysisRoutes.js';
import budgetAnalysisRoutes from './budget-analysis/budgetAnalysisRoutes.js';
import freelancerMatchingRoutes from './freelancer-matching/freelancerMatchingRoutes.js';
import descriptionAssistantRoutes from './description-assistant/descriptionAssistantRoutes.js';
import assistantRoutes from './assistant/assistantRoutes.js';

const router = Router();

router.use('/project-analysis', projectAnalysisRoutes);
router.use('/budget-analysis', budgetAnalysisRoutes);
router.use('/freelancer-matching', freelancerMatchingRoutes);
router.use('/description-assistant', descriptionAssistantRoutes);
router.use('/assistant', assistantRoutes);
router.get('/usage', authenticate, asyncHandler(getUsage));

export default router;
