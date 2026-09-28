import { AppError } from '../../utils/appError.js';
import { findContractById } from '../workspace/contracts/contractsPersistence.js';
import { validateContractIdParam } from './walletValidation.js';
import {
  countDisputesByProjectId,
  findTransactionByContractIdAndType,
} from './walletPersistence.js';

// Funding/execution condition only. Not a documented contracts.status value.
export const AWAITING_ESCROW = 'awaiting_escrow';

export const FINAL_RELEASE_RULES = {
  SINGLE_FINAL_RELEASE: true,
  REQUIRES_CLIENT_RECEIVED_CONFIRMATION: true,
  REQUIRES_FREELANCER_DELIVERED_CONFIRMATION: true,
};

export const DELIVERED_CONTRACT_STATUSES = ['delivered', 'completed'];

export const assertEscrowFunded = async (contractId, executor) => {
  validateContractIdParam(contractId);

  const funded = await findTransactionByContractIdAndType(
    contractId,
    'escrow',
    executor,
  );

  if (!funded) {
    throw new AppError('Contract is not funded in escrow', 409);
  }

  return funded;
};

export const assertNoActiveDispute = async (contractId, executor) => {
  validateContractIdParam(contractId);

  const contract = await findContractById(contractId, executor);

  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  const disputeCount = await countDisputesByProjectId(
    contract.project_id,
    executor,
  );

  if (disputeCount > 0) {
    throw new AppError('Active dispute blocks release', 409);
  }
};
