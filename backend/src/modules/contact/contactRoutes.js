import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { create } from './contactController.js';

const router = Router();

router.post('/', asyncHandler(create));

export default router;
