import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorizeRoles } from '../../../middleware/roleGuard.js';
import { askAssistant } from './assistantService.js';
import { validateAssistantBody } from './assistantValidation.js';

const router = Router();

router.post(
  '/',
  authenticate,
  authorizeRoles('client', 'freelancer'),
  asyncHandler(async (req, res) => {
    const payload = validateAssistantBody(req.body);
    const data = await askAssistant(req.user, payload);

    res.status(201).json({
      success: true,
      data,
    });
  }),
);

export default router;
