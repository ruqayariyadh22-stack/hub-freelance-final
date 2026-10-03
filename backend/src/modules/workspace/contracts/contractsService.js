import { AppError } from '../../../utils/appError.js';
import {
  AWAITING_ESCROW,
  assertEscrowFunded,
} from '../../wallet/escrow.js';
import { findClientProfileById } from '../../client/clientPersistence.js';
import {
  NOTIFICATION_TYPES,
  notifyUser,
} from '../../notifications/notificationMessages.js';
import { findClientProfileByUserId } from '../../projects/projectsPersistence.js';
import { findFreelancerProfileByUserId } from '../../proposals/proposalsPersistence.js';
import {
  findContractById,
  listContractsByClientId,
  listContractsByFreelancerId,
  updateContractStatusById as updateContractStatusRow,
} from './contractsPersistence.js';

const toPublicContract = (contract) => ({
  id: contract.id,
  project_id: contract.project_id,
  client_id: contract.client_id,
  freelancer_id: contract.freelancer_id,
  contract_value: contract.contract_value,
  commission: contract.commission,
  status: contract.status,
  start_date: contract.start_date,
  delivery_date: contract.delivery_date,
  payment_status: contract.payment_status,
  ...(contract.project_title !== undefined
    ? {
        project_title: contract.project_title,
        client_name: contract.client_name,
        freelancer_name: contract.freelancer_name,
      }
    : {}),
});

const requireContract = (contract) => {
  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  return toPublicContract(contract);
};

export const assertContractParticipant = async (contract, actor) => {
  if (actor?.role === 'client') {
    const profile = await findClientProfileByUserId(actor.id);

    if (profile && profile.id === contract.client_id) {
      return;
    }
  }

  if (actor?.role === 'freelancer') {
    const profile = await findFreelancerProfileByUserId(actor.id);

    if (profile && profile.id === contract.freelancer_id) {
      return;
    }
  }

  throw new AppError('Forbidden: insufficient role', 403);
};

export const listContractsForActor = async (actor) => {
  if (actor?.role === 'client') {
    const profile = await findClientProfileByUserId(actor.id);

    if (!profile) {
      return [];
    }

    const rows = await listContractsByClientId(profile.id);
    return rows.map(toPublicContract);
  }

  if (actor?.role === 'freelancer') {
    const profile = await findFreelancerProfileByUserId(actor.id);

    if (!profile) {
      return [];
    }

    const rows = await listContractsByFreelancerId(profile.id);
    return rows.map(toPublicContract);
  }

  throw new AppError('Forbidden: insufficient role', 403);
};

export const getContractById = async (contractId, actor) => {
  const contract = await findContractById(contractId);
  requireContract(contract);
  await assertContractParticipant(contract, actor);
  return toPublicContract(contract);
};

export const updateContractStatusById = async (contractId, actor, payload) => {
  const contract = await findContractById(contractId);
  requireContract(contract);
  await assertContractParticipant(contract, actor);

  if (contract.status === AWAITING_ESCROW) {
    throw new AppError(
      'Contract cannot change status until escrow is funded',
      409,
    );
  }

  if (payload.status === 'in_progress') {
    await assertEscrowFunded(contractId);
  }

  const updated = await updateContractStatusRow(contractId, payload.status);
  const publicContract = requireContract(updated);

  if (payload.status === 'delivered' && contract.status !== 'delivered') {
    const clientProfile = await findClientProfileById(contract.client_id);

    if (clientProfile?.user_id) {
      await notifyUser({
        userId: clientProfile.user_id,
        type: NOTIFICATION_TYPES.CONTRACT_DELIVERED,
      });
    }
  }

  return publicContract;
};
