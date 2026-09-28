import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles } from '../../middleware/roleGuard.js';
import { create, getById } from './disputesController.js';

const requireReporter = authorizeRoles('client', 'freelancer');
const requireViewer = authorizeRoles('client', 'freelancer', 'admin');

const router = Router();

router.post('/', authenticate, requireReporter, asyncHandler(create));
router.get('/:id', authenticate, requireViewer, asyncHandler(getById));

export default router;
