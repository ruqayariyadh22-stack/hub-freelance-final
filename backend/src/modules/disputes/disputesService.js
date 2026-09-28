import { AppError } from '../../utils/appError.js';
import { withTransaction } from '../../config/db.js';
import {
  NOTIFICATION_TYPES,
  notifyUser,
} from '../notifications/notificationMessages.js';
import {
  findClientProfileByUserId,
  findProjectById,
  lockProjectById,
} from '../projects/projectsPersistence.js';
import { findFreelancerProfileByUserId } from '../proposals/proposalsPersistence.js';
import {
  findDisputeById,
  freelancerHasProposalOnProject,
  insertDispute,
} from './disputesPersistence.js';

export { assertNoActiveDispute } from '../wallet/escrow.js';

const toPublicDispute = (dispute) => ({
  id: dispute.id,
  reported_by: dispute.reported_by,
  reported_against: dispute.reported_against,
  project_id: dispute.project_id,
  issue_type: dispute.issue_type,
  description: dispute.description,
  evidence_attachments: dispute.evidence_attachments,
  status: dispute.status,
  action_taken: dispute.action_taken,
});

const requireProject = (project) => {
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return project;
};

const requireDispute = (dispute) => {
  if (!dispute) {
    throw new AppError('Dispute not found', 404);
  }

  return toPublicDispute(dispute);
};

const isProjectClient = async (project, actor) => {
  if (actor?.role !== 'client') {
    return false;
  }

  const profile = await findClientProfileByUserId(actor.id);
  return Boolean(profile && profile.id === project.client_id);
};

const isProjectFreelancer = async (project, actor) => {
  if (actor?.role !== 'freelancer') {
    return false;
  }

  const profile = await findFreelancerProfileByUserId(actor.id);

  if (!profile) {
    return false;
  }

  if (project.chosen_freelancer_id && project.chosen_freelancer_id === profile.id) {
    return true;
  }

  return freelancerHasProposalOnProject(project.id, profile.id);
};

const assertProjectParticipant = async (project, actor) => {
  if (await isProjectClient(project, actor)) {
    return;
  }

  if (await isProjectFreelancer(project, actor)) {
    return;
  }

  throw new AppError('Forbidden: insufficient role', 403);
};

const requireDisputeParticipant = async (dispute, actor) => {
  if (actor?.role === 'admin') {
    return;
  }

  if (actor?.id && (actor.id === dispute.reported_by || actor.id === dispute.reported_against)) {
    return;
  }

  const project = requireProject(await findProjectById(dispute.project_id));
  await assertProjectParticipant(project, actor);
};

export const createDispute = async (actor, payload) => {
  if (!payload.project_id) {
    throw new AppError('Validation failed', 400, [
      { field: 'project_id', message: 'project_id is required' },
    ]);
  }

  try {
    const created = await withTransaction(async (client) => {
      const project = requireProject(
        await lockProjectById(payload.project_id, client),
      );
      await assertProjectParticipant(project, actor);

      return insertDispute(
        {
          reportedBy: actor.id,
          reportedAgainst: payload.reported_against ?? null,
          projectId: project.id,
          issueType: payload.issue_type ?? null,
          description: payload.description ?? null,
          evidenceAttachments: payload.evidence_attachments ?? null,
        },
        client,
      );
    });

    const publicDispute = toPublicDispute(created);

    if (created.reported_against) {
      await notifyUser({
        userId: created.reported_against,
        type: NOTIFICATION_TYPES.DISPUTE_OPENED,
      });
    }

    return publicDispute;
  } catch (error) {
    if (error?.code === '23503') {
      throw new AppError('Validation failed', 400, [
        { field: 'reported_against', message: 'reported_against is invalid' },
      ]);
    }

    throw error;
  }
};

export const getDisputeById = async (disputeId, actor) => {
  const dispute = requireDispute(await findDisputeById(disputeId));
  await requireDisputeParticipant(dispute, actor);
  return dispute;
};
