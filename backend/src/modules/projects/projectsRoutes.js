import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireClient, requireFreelancer } from '../../middleware/roleGuard.js';
import {
  create,
  getById,
  list,
  removeById,
  updateById,
} from './projectsController.js';
import {
  create as createProposal,
  listForProject,
} from '../proposals/proposalsController.js';
import {
  create as createInvitation,
  listForProject as listInvitationsForProject,
} from './invitations/invitationsController.js';

const router = Router();

router.post('/', authenticate, requireClient, asyncHandler(create));
router.get('/', authenticate, requireFreelancer, asyncHandler(list));
router.post('/:id/proposals', authenticate, requireFreelancer, asyncHandler(createProposal));
router.get('/:id/proposals', authenticate, requireClient, asyncHandler(listForProject));
router.post('/:id/invitations', authenticate, requireClient, asyncHandler(createInvitation));
router.get('/:id/invitations', authenticate, requireClient, asyncHandler(listInvitationsForProject));
router.get('/:id', authenticate, asyncHandler(getById));
router.patch('/:id', authenticate, requireClient, asyncHandler(updateById));
router.delete('/:id', authenticate, requireClient, asyncHandler(removeById));

export default router;
