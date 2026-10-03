import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/authenticate.js';
import { requireFreelancer } from '../../../middleware/roleGuard.js';
import { addSkill, listCatalog, listSkills, removeSkill } from './skillsController.js';

const router = Router({ mergeParams: true });

router.get('/', asyncHandler(listSkills));
router.post('/', authenticate, requireFreelancer, asyncHandler(addSkill));
router.delete('/:skillId', authenticate, requireFreelancer, asyncHandler(removeSkill));

export const skillsCatalogRouter = Router();

skillsCatalogRouter.get('/', asyncHandler(listCatalog));

export default router;
