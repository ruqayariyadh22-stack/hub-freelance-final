import { AppError } from '../../../utils/appError.js';
import {
  NOTIFICATION_TYPES,
  notifyUser,
} from '../../notifications/notificationMessages.js';
import { findClientProfileByUserId } from '../../projects/projectsPersistence.js';
import { findFreelancerProfileByUserId } from '../../proposals/proposalsPersistence.js';
import { findContractById } from '../contracts/contractsPersistence.js';
import {
  findScopeChangeById,
  insertScopeChange,
  listScopeChangesByContractId,
  updateScopeChangeStatusById,
} from './scopeChangesPersistence.js';

export const SCOPE_CHANGE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const toPublicScopeChange = (scopeChange) => ({
  id: scopeChange.id,
  contract_id: scopeChange.contract_id,
  requested_by: scopeChange.requested_by,
  description: scopeChange.description,
  price_adjustment: scopeChange.price_adjustment,
  duration_adjustment: scopeChange.duration_adjustment,
  status: scopeChange.status,
});

const requireContract = (contract) => {
  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  return contract;
};

const requireScopeChange = (scopeChange) => {
  if (!scopeChange) {
    throw new AppError('Scope change not found', 404);
  }

  return toPublicScopeChange(scopeChange);
};

const assertContractFreelancer = async (contract, actor) => {
  if (actor?.role === 'freelancer') {
    const profile = await findFreelancerProfileByUserId(actor.id);

    if (profile && profile.id === contract.freelancer_id) {
      return;
    }
  }

  throw new AppError('Forbidden: insufficient role', 403);
};

const assertContractClient = async (contract, actor) => {
  if (actor?.role === 'client') {
    const profile = await findClientProfileByUserId(actor.id);

    if (profile && profile.id === contract.client_id) {
      return;
    }
  }

  throw new AppError('Forbidden: insufficient role', 403);
};

const assertContractParticipant = async (contract, actor) => {
  if (actor?.role === 'client') {
    await assertContractClient(contract, actor);
    return;
  }

  if (actor?.role === 'freelancer') {
    await assertContractFreelancer(contract, actor);
    return;
  }

  throw new AppError('Forbidden: insufficient role', 403);
};

export const listScopeChangesByContract = async (contractId, actor) => {
  const contract = requireContract(await findContractById(contractId));
  await assertContractParticipant(contract, actor);
  const rows = await listScopeChangesByContractId(contract.id);
  return rows.map(toPublicScopeChange);
};

export const createScopeChange = async (contractId, actor, payload) => {
  const contract = requireContract(await findContractById(contractId));
  await assertContractFreelancer(contract, actor);

  const created = await insertScopeChange({
    contractId: contract.id,
    requestedBy: actor.id,
    description: payload.description ?? null,
    priceAdjustment: payload.price_adjustment ?? null,
    durationAdjustment: payload.duration_adjustment ?? null,
  });

  return toPublicScopeChange(created);
};

const persistScopeChangeStatus = async (scopeChangeId, actor, status) => {
  const scopeChange = requireScopeChange(await findScopeChangeById(scopeChangeId));
  const contract = requireContract(await findContractById(scopeChange.contract_id));
  await assertContractClient(contract, actor);

  // Scope change approval currently records the approved change only;
  // contract value/duration are intentionally not modified according to
  // the current project decision.
  const updated = await updateScopeChangeStatusById(scopeChange.id, status);

  if (!updated) {
    throw new AppError(
      status === SCOPE_CHANGE_STATUS.APPROVED
        ? 'Scope change cannot be approved'
        : 'Scope change cannot be rejected',
      409,
    );
  }

  const publicScopeChange = toPublicScopeChange(updated);

  if (scopeChange.requested_by) {
    await notifyUser({
      userId: scopeChange.requested_by,
      type:
        status === SCOPE_CHANGE_STATUS.APPROVED
          ? NOTIFICATION_TYPES.SCOPE_CHANGE_APPROVED
          : NOTIFICATION_TYPES.SCOPE_CHANGE_REJECTED,
    });
  }

  return publicScopeChange;
};

export const approveScopeChangeById = async (scopeChangeId, actor) => {
  return persistScopeChangeStatus(
    scopeChangeId,
    actor,
    SCOPE_CHANGE_STATUS.APPROVED,
  );
};

export const rejectScopeChangeById = async (scopeChangeId, actor) => {
  return persistScopeChangeStatus(
    scopeChangeId,
    actor,
    SCOPE_CHANGE_STATUS.REJECTED,
  );
};
