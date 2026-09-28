import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireClient } from '../../middleware/roleGuard.js';
import { getById, listProjects, updateById } from './clientController.js';

const router = Router();

router.get('/:id/projects', authenticate, requireClient, asyncHandler(listProjects));
router.get('/:id', asyncHandler(getById));
router.patch('/:id', authenticate, requireClient, asyncHandler(updateById));

export default router;
