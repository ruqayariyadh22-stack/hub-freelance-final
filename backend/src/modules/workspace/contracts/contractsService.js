import { AppError } from '../../../utils/appError.js';
import { findClientProfileByUserId } from '../../projects/projectsPersistence.js';
import { findFreelancerProfileByUserId } from '../../proposals/proposalsPersistence.js';
import {
  findContractById,
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
});

const requireContract = (contract) => {
  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  return toPublicContract(contract);
};

const assertContractParticipant = async (contract, actor) => {
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

  const updated = await updateContractStatusRow(contractId, payload.status);
  return requireContract(updated);
};
