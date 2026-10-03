import {
  validateCreateInvitation,
  validateInvitationIdParam,
  validateProjectIdParam,
} from './invitationsValidation.js';
import {
  declineInvitation,
  inviteFreelancer,
  listMyInvitations,
  listProjectInvitations,
} from './invitationsService.js';

export const create = async (req, res) => {
  const projectId = validateProjectIdParam(req.params.id);
  const payload = validateCreateInvitation(req.body);
  const data = await inviteFreelancer(projectId, req.user, payload);

  res.status(201).json({
    success: true,
    data,
  });
};

export const listForProject = async (req, res) => {
  const projectId = validateProjectIdParam(req.params.id);
  const data = await listProjectInvitations(projectId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const listMine = async (req, res) => {
  const data = await listMyInvitations(req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const decline = async (req, res) => {
  const invitationId = validateInvitationIdParam(req.params.id);
  const data = await declineInvitation(invitationId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};
