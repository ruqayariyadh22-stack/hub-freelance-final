import { AppError } from '../../utils/appError.js';
import { findClientProfileById } from '../client/clientPersistence.js';
import { findFreelancerProfileById } from '../freelancer/freelancerPersistence.js';
import { findProjectById } from '../projects/projectsPersistence.js';
import {
  NOTIFICATION_TYPES,
  notifyUser,
} from '../notifications/notificationMessages.js';
import { insertConversation } from '../workspace/chat/chatPersistence.js';
import { insertContract } from '../workspace/contracts/contractsPersistence.js';
import {
  acceptProposalAndCreateContract,
  findFreelancerProfileByUserId,
  findProposalById,
  insertProposal,
  listProposalsByFreelancerId,
  listProposalsByProjectId,
  updateProposalById as updateProposalRow,
  updateProposalStatusById,
} from './proposalsPersistence.js';

const toPublicProposal = (proposal) => ({
  id: proposal.id,
  project_id: proposal.project_id,
  freelancer_id: proposal.freelancer_id,
  proposed_price: proposal.proposed_price,
  proposed_duration: proposal.proposed_duration,
  message: proposal.message,
  status: proposal.status,
  submitted_at: proposal.submitted_at,
});

const requireProject = (project) => {
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return project;
};

const requireFreelancerProfile = (profile) => {
  if (!profile) {
    throw new AppError('Freelancer not found', 404);
  }

  return profile;
};

const requireProposal = (proposal) => {
  if (!proposal) {
    throw new AppError('Proposal not found', 404);
  }

  return toPublicProposal(proposal);
};

const requirePendingProposal = (proposal, message) => {
  if (proposal.status !== 'pending') {
    throw new AppError(message, 400);
  }
};

const assertProjectOwner = async (project, actor) => {
  const clientProfile = await findClientProfileById(project.client_id);

  if (!clientProfile) {
    throw new AppError('Client not found', 404);
  }

  if (!actor?.id || actor.id !== clientProfile.user_id) {
    throw new AppError('Forbidden: insufficient role', 403);
  }
};

const assertFreelancerOwner = (profile, actor) => {
  if (!actor?.id || actor.id !== profile.user_id) {
    throw new AppError('Forbidden: insufficient role', 403);
  }
};

export const createProposal = async (projectId, actor, payload) => {
  const project = requireProject(await findProjectById(projectId));

  if (project.status !== 'open') {
    throw new AppError('Proposal cannot be submitted', 400);
  }

  const freelancer = requireFreelancerProfile(
    await findFreelancerProfileByUserId(actor.id),
  );

  const created = await insertProposal(project.id, freelancer.id, payload);
  return toPublicProposal(created);
};

export const listProjectProposals = async (projectId, actor) => {
  const project = requireProject(await findProjectById(projectId));
  await assertProjectOwner(project, actor);

  const proposals = await listProposalsByProjectId(project.id);
  return proposals.map(toPublicProposal);
};

export const listFreelancerProposals = async (freelancerId, actor) => {
  const freelancer = requireFreelancerProfile(
    await findFreelancerProfileById(freelancerId),
  );
  assertFreelancerOwner(freelancer, actor);

  const proposals = await listProposalsByFreelancerId(freelancer.id);
  return proposals.map(toPublicProposal);
};

export const updateProposalById = async (proposalId, actor, payload) => {
  const proposal = await findProposalById(proposalId);
  requireProposal(proposal);

  const freelancer = requireFreelancerProfile(
    await findFreelancerProfileById(proposal.freelancer_id),
  );
  assertFreelancerOwner(freelancer, actor);
  requirePendingProposal(proposal, 'Proposal cannot be updated');

  const updated = await updateProposalRow(proposalId, payload);
  return requireProposal(updated);
};

export const acceptProposalById = async (proposalId, actor) => {
  const proposal = await findProposalById(proposalId);
  requireProposal(proposal);

  const project = requireProject(await findProjectById(proposal.project_id));
  await assertProjectOwner(project, actor);
  requirePendingProposal(proposal, 'Proposal cannot be accepted');

  if (project.status !== 'open' || project.chosen_freelancer_id) {
    throw new AppError('Proposal cannot be accepted', 400);
  }

  try {
    const result = await acceptProposalAndCreateContract({
      proposalId: proposal.id,
      projectId: proposal.project_id,
      clientId: project.client_id,
      freelancerId: proposal.freelancer_id,
      contractValue: proposal.proposed_price,
      insertContract,
      insertConversation,
    });

    const accepted = requireProposal(result.proposal);
    const conversation = result.conversation;

    if (conversation?.freelancer_id) {
      await notifyUser({
        userId: conversation.freelancer_id,
        type: NOTIFICATION_TYPES.PROPOSAL_ACCEPTED,
      });
    }

    if (result.contract && conversation) {
      if (conversation.client_id) {
        await notifyUser({
          userId: conversation.client_id,
          type: NOTIFICATION_TYPES.CONTRACT_CREATED,
        });
      }

      if (conversation.freelancer_id) {
        await notifyUser({
          userId: conversation.freelancer_id,
          type: NOTIFICATION_TYPES.CONTRACT_CREATED,
        });
      }
    }

    if (conversation?.client_id) {
      await notifyUser({
        userId: conversation.client_id,
        type: NOTIFICATION_TYPES.PROJECT_STATUS_CHANGED,
      });
    }

    if (conversation?.freelancer_id) {
      await notifyUser({
        userId: conversation.freelancer_id,
        type: NOTIFICATION_TYPES.PROJECT_STATUS_CHANGED,
      });
    }

    return accepted;
  } catch (error) {
    if (error?.code === '23505') {
      throw new AppError('Contract already exists for this project', 409);
    }

    throw error;
  }
};

export const rejectProposalById = async (proposalId, actor) => {
  const proposal = await findProposalById(proposalId);
  requireProposal(proposal);

  const project = requireProject(await findProjectById(proposal.project_id));
  await assertProjectOwner(project, actor);
  requirePendingProposal(proposal, 'Proposal cannot be rejected');

  const rejected = await updateProposalStatusById(proposal.id, 'rejected');
  return requireProposal(rejected);
};
