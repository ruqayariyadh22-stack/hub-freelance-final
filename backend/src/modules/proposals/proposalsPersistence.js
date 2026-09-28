import { query, withTransaction } from '../../config/db.js';
import { AppError } from '../../utils/appError.js';
import {
  lockProjectById,
  markProjectPendingApproval,
} from '../projects/projectsPersistence.js';

const PROPOSAL_COLUMNS = `
  id,
  project_id,
  freelancer_id,
  proposed_price,
  proposed_duration,
  message,
  status,
  submitted_at
`;

const UPDATABLE_COLUMNS = ['proposed_price', 'proposed_duration', 'message'];

export const findFreelancerProfileByUserId = async (userId) => {
  const result = await query(
    `SELECT id, user_id
     FROM freelancer_profiles
     WHERE user_id = $1`,
    [userId],
  );

  return result.rows[0] || null;
};

export const findProposalById = async (proposalId) => {
  const result = await query(
    `SELECT ${PROPOSAL_COLUMNS}
     FROM proposals
     WHERE id = $1`,
    [proposalId],
  );

  return result.rows[0] || null;
};

export const listProposalsByProjectId = async (projectId) => {
  const result = await query(
    `SELECT ${PROPOSAL_COLUMNS}
     FROM proposals
     WHERE project_id = $1`,
    [projectId],
  );

  return result.rows;
};

export const listProposalsByFreelancerId = async (freelancerId) => {
  const result = await query(
    `SELECT ${PROPOSAL_COLUMNS}
     FROM proposals
     WHERE freelancer_id = $1`,
    [freelancerId],
  );

  return result.rows;
};

export const insertProposal = async (projectId, freelancerId, payload) => {
  const result = await query(
    `INSERT INTO proposals (
       project_id,
       freelancer_id,
       proposed_price,
       proposed_duration,
       message,
       status,
       submitted_at
     )
     VALUES ($1, $2, $3, $4, $5, 'pending', CURRENT_TIMESTAMP)
     RETURNING ${PROPOSAL_COLUMNS}`,
    [
      projectId,
      freelancerId,
      payload.proposed_price,
      payload.proposed_duration,
      Object.prototype.hasOwnProperty.call(payload, 'message')
        ? payload.message
        : null,
    ],
  );

  return result.rows[0];
};

export const updateProposalById = async (proposalId, payload) => {
  const assignments = [];
  const values = [];

  UPDATABLE_COLUMNS.forEach((column) => {
    if (Object.prototype.hasOwnProperty.call(payload, column)) {
      values.push(payload[column]);
      assignments.push(`${column} = $${values.length}`);
    }
  });

  if (assignments.length === 0) {
    return findProposalById(proposalId);
  }

  values.push(proposalId);

  const result = await query(
    `UPDATE proposals
     SET ${assignments.join(', ')}
     WHERE id = $${values.length}
     RETURNING ${PROPOSAL_COLUMNS}`,
    values,
  );

  return result.rows[0] || null;
};

export const updateProposalStatusById = async (proposalId, status) => {
  const result = await query(
    `UPDATE proposals
     SET status = $1
     WHERE id = $2
     RETURNING ${PROPOSAL_COLUMNS}`,
    [status, proposalId],
  );

  return result.rows[0] || null;
};

export const acceptProposalAndCreateContract = async ({
  proposalId,
  projectId,
  clientId,
  freelancerId,
  contractValue,
  insertContract,
  insertConversation,
  markAcceptedProject = markProjectPendingApproval,
}) => {
  return withTransaction(async (client) => {
    const lockedProject = await lockProjectById(projectId, client);

    if (!lockedProject) {
      throw new AppError('Project not found', 404);
    }

    if (lockedProject.status !== 'open' || lockedProject.chosen_freelancer_id) {
      throw new AppError('Proposal cannot be accepted', 400);
    }

    const locked = await client.query(
      `SELECT ${PROPOSAL_COLUMNS}
       FROM proposals
       WHERE id = $1
       FOR UPDATE`,
      [proposalId],
    );

    const proposal = locked.rows[0];

    if (!proposal) {
      return { proposal: null, contract: null, conversation: null };
    }

    if (proposal.project_id !== projectId) {
      throw new AppError('Proposal cannot be accepted', 400);
    }

    if (proposal.status !== 'pending') {
      throw new AppError('Proposal cannot be accepted', 400);
    }

    const chosenFreelancerId = proposal.freelancer_id;

    const accepted = await client.query(
      `UPDATE proposals
       SET status = 'accepted'
       WHERE id = $1
       RETURNING ${PROPOSAL_COLUMNS}`,
      [proposalId],
    );

    await client.query(
      `UPDATE proposals
       SET status = 'rejected'
       WHERE project_id = $1
         AND id <> $2
         AND status = 'pending'`,
      [projectId, proposalId],
    );

    await markAcceptedProject(projectId, chosenFreelancerId, client);

    const contract = await insertContract(
      {
        projectId,
        clientId,
        freelancerId: chosenFreelancerId,
        contractValue,
      },
      client,
    );

    const clientOwner = await client.query(
      `SELECT user_id
       FROM client_profiles
       WHERE id = $1`,
      [clientId],
    );
    const freelancerOwner = await client.query(
      `SELECT user_id
       FROM freelancer_profiles
       WHERE id = $1`,
      [chosenFreelancerId],
    );

    if (!clientOwner.rows[0]?.user_id || !freelancerOwner.rows[0]?.user_id) {
      throw new AppError('Conversation participants not found', 404);
    }

    const conversation = await insertConversation(
      {
        clientId: clientOwner.rows[0].user_id,
        freelancerId: freelancerOwner.rows[0].user_id,
        projectId,
      },
      client,
    );

    return {
      proposal: accepted.rows[0] || null,
      contract,
      conversation,
    };
  });
};
