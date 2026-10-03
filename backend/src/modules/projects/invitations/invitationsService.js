import { AppError } from '../../../utils/appError.js';
import { findClientProfileById } from '../../client/clientPersistence.js';
import { findFreelancerProfileById } from '../../freelancer/freelancerPersistence.js';
import {
  NOTIFICATION_TYPES,
  notifyUser,
} from '../../notifications/notificationMessages.js';
import { findFreelancerProfileByUserId } from '../../proposals/proposalsPersistence.js';
import { findProjectById } from '../projectsPersistence.js';
import {
  findInvitationById,
  insertInvitation,
  listInvitationsByFreelancerId,
  listInvitationsByProjectId,
  updateInvitationStatusById,
} from './invitationsPersistence.js';

const toPublicInvitation = (row) => ({
  id: row.id,
  project_id: row.project_id,
  freelancer_id: row.freelancer_id,
  invited_by: row.invited_by,
  status: row.status,
  created_at: row.created_at,
  ...(row.freelancer_name !== undefined ? { freelancer_name: row.freelancer_name } : {}),
  ...(row.project_title !== undefined
    ? {
        project_title: row.project_title,
        budget_min: row.budget_min,
        budget_max: row.budget_max,
        project_status: row.project_status,
        client_name: row.client_name,
      }
    : {}),
});

const requireOwnedProject = async (projectId, actor) => {
  const project = await findProjectById(projectId);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const clientProfile = await findClientProfileById(project.client_id);

  if (!clientProfile || clientProfile.user_id !== actor.id) {
    throw new AppError('Forbidden: insufficient role', 403);
  }

  return project;
};

const requireActorFreelancerProfile = async (actor) => {
  const profile = await findFreelancerProfileByUserId(actor.id);

  if (!profile) {
    throw new AppError('Freelancer not found', 404);
  }

  return profile;
};

export const inviteFreelancer = async (projectId, actor, { freelancerId }) => {
  const project = await requireOwnedProject(projectId, actor);

  if (project.status !== 'open') {
    throw new AppError('Only open projects accept invitations', 400);
  }

  const freelancer = await findFreelancerProfileById(freelancerId);

  if (!freelancer) {
    throw new AppError('Freelancer not found', 404);
  }

  const created = await insertInvitation({
    projectId: project.id,
    freelancerId: freelancer.id,
    invitedBy: actor.id,
  });

  if (!created) {
    throw new AppError('Freelancer has already been invited to this project', 409);
  }

  await notifyUser({
    userId: freelancer.user_id,
    type: NOTIFICATION_TYPES.PROJECT_INVITATION,
  });

  return toPublicInvitation(created);
};

export const listProjectInvitations = async (projectId, actor) => {
  const project = await requireOwnedProject(projectId, actor);
  const rows = await listInvitationsByProjectId(project.id);
  return rows.map(toPublicInvitation);
};

export const listMyInvitations = async (actor) => {
  const profile = await requireActorFreelancerProfile(actor);
  const rows = await listInvitationsByFreelancerId(profile.id);
  return rows.map(toPublicInvitation);
};

export const declineInvitation = async (invitationId, actor) => {
  const profile = await requireActorFreelancerProfile(actor);
  const invitation = await findInvitationById(invitationId);

  if (!invitation) {
    throw new AppError('Invitation not found', 404);
  }

  if (invitation.freelancer_id !== profile.id) {
    throw new AppError('Forbidden: insufficient role', 403);
  }

  if (invitation.status !== 'pending') {
    throw new AppError('Invitation is no longer pending', 400);
  }

  return toPublicInvitation(await updateInvitationStatusById(invitation.id, 'declined'));
};
