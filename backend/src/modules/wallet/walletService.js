import { AppError } from '../../utils/appError.js';
import { withTransaction } from '../../config/db.js';
import {
  NOTIFICATION_TYPES,
  notifyUser,
} from '../notifications/notificationMessages.js';
import {
  findClientProfileByUserId,
  lockProjectById,
  markProjectInProgressIfPendingApproval,
} from '../projects/projectsPersistence.js';
import { findFreelancerProfileById } from '../freelancer/freelancerPersistence.js';
import {
  lockContractById,
  updateContractPaymentStatusById,
} from '../workspace/contracts/contractsPersistence.js';
import {
  assertEscrowFunded,
  assertNoActiveDispute,
  DELIVERED_CONTRACT_STATUSES,
  FINAL_RELEASE_RULES,
} from './escrow.js';
import { calculateCommission, validateMoneyAmount } from './money.js';
import {
  findTransactionByContractIdAndType,
  findWalletByUserId,
  insertTransaction,
  insertWalletForUser,
  listTransactionsByWalletId,
  lockWalletByUserId,
  updateWalletBalancesById,
} from './walletPersistence.js';

export { calculateCommission, validateMoneyAmount } from './money.js';
export {
  AWAITING_ESCROW,
  FINAL_RELEASE_RULES,
  assertEscrowFunded,
  assertNoActiveDispute,
} from './escrow.js';

const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  ESCROW: 'escrow',
  RELEASE: 'release',
};

const toPublicWallet = (wallet) => ({
  id: wallet.id,
  user_id: wallet.user_id,
  balance: wallet.balance,
  escrow_balance: wallet.escrow_balance,
});

const toPublicTransaction = (transaction) => ({
  id: transaction.id,
  wallet_id: transaction.wallet_id,
  contract_id: transaction.contract_id,
  type: transaction.type,
  commission: transaction.commission,
  amount: transaction.amount,
});

const requireWallet = (wallet) => {
  if (!wallet) {
    throw new AppError('Wallet not found', 404);
  }

  return toPublicWallet(wallet);
};

const requireOwnedWallet = async (actor) => {
  return requireWallet(await findWalletByUserId(actor.id));
};

const parseStoredMoney = (value, field) => {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'number') {
    return validateMoneyAmount(value, field);
  }

  if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim())) {
    return validateMoneyAmount(Number(value), field);
  }

  throw new AppError('Validation failed', 400, [
    { field, message: `${field} must be a finite number` },
  ]);
};

const requirePositiveMoney = (value, field) => {
  const amount = parseStoredMoney(value, field);

  if (amount <= 0) {
    throw new AppError('Validation failed', 400, [
      { field, message: `${field} must be greater than 0` },
    ]);
  }

  return amount;
};

const assertContractClient = async (contract, actor) => {
  if (actor?.role === 'client') {
    const profile = await findClientProfileByUserId(actor.id);

    if (profile && profile.id === contract.client_id) {
      return profile;
    }
  }

  throw new AppError('Forbidden: insufficient role', 403);
};

const requireExistingWallet = async (userId, executor) => {
  const wallet = await lockWalletByUserId(userId, executor);

  if (!wallet) {
    throw new AppError('Wallet not found', 404);
  }

  return wallet;
};

const financialResult = (wallet, transaction) => ({
  wallet: toPublicWallet(wallet),
  transaction: toPublicTransaction(transaction),
});

export const getWallet = async (actor) => {
  return requireOwnedWallet(actor);
};

export const listWalletTransactions = async (actor) => {
  const wallet = await requireOwnedWallet(actor);
  const transactions = await listTransactionsByWalletId(wallet.id);
  return transactions.map(toPublicTransaction);
};

export const topupWallet = async (actor, amount) => {
  if (actor?.role !== 'client') {
    throw new AppError('Forbidden: insufficient role', 403);
  }

  const depositAmount = requirePositiveMoney(amount, 'amount');

  return withTransaction(async (client) => {
    let wallet = await lockWalletByUserId(actor.id, client);

    if (!wallet) {
      await insertWalletForUser(actor.id, client);
      wallet = await lockWalletByUserId(actor.id, client);
    }

    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }

    const updated = await updateWalletBalancesById(
      wallet.id,
      { balanceDelta: depositAmount, escrowDelta: 0 },
      client,
    );
    const transaction = await insertTransaction(
      {
        walletId: updated.id,
        contractId: null,
        type: TRANSACTION_TYPES.DEPOSIT,
        commission: null,
        amount: depositAmount,
      },
      client,
    );

    return financialResult(updated, transaction);
  });
};

export const holdEscrow = async (contractId, actor) => {
  const result = await withTransaction(async (client) => {
    const contract = await lockContractById(contractId, client);

    if (!contract) {
      throw new AppError('Contract not found', 404);
    }

    await assertContractClient(contract, actor);

    const contractValue = requirePositiveMoney(
      contract.contract_value,
      'contract_value',
    );
    const existingEscrow = await findTransactionByContractIdAndType(
      contract.id,
      TRANSACTION_TYPES.ESCROW,
      client,
    );

    if (existingEscrow) {
      throw new AppError('Contract is already funded in escrow', 409);
    }

    const wallet = await requireExistingWallet(actor.id, client);
    const available = parseStoredMoney(wallet.balance, 'balance');

    if (available < contractValue) {
      throw new AppError('Insufficient wallet balance', 409);
    }

    const updated = await updateWalletBalancesById(
      wallet.id,
      { balanceDelta: -contractValue, escrowDelta: contractValue },
      client,
    );
    const transaction = await insertTransaction(
      {
        walletId: updated.id,
        contractId: contract.id,
        type: TRANSACTION_TYPES.ESCROW,
        commission: null,
        amount: contractValue,
      },
      client,
    );

    await lockProjectById(contract.project_id, client);
    await markProjectInProgressIfPendingApproval(contract.project_id, client);

    return financialResult(updated, transaction);
  });

  await notifyUser({
    userId: actor.id,
    type: NOTIFICATION_TYPES.ESCROW_COMPLETED,
  });

  return result;
};

export const releasePaymentByContractId = async (contractId, actor) => {
  let freelancerUserId;

  const result = await withTransaction(async (client) => {
    const contract = await lockContractById(contractId, client);

    if (!contract) {
      throw new AppError('Contract not found', 404);
    }

    await lockProjectById(contract.project_id, client);
    await assertContractClient(contract, actor);

    if (contract.payment_status === 'released') {
      throw new AppError('Payment already released', 409);
    }

    const contractValue = requirePositiveMoney(
      contract.contract_value,
      'contract_value',
    );

    if (
      FINAL_RELEASE_RULES.REQUIRES_FREELANCER_DELIVERED_CONFIRMATION &&
      !DELIVERED_CONTRACT_STATUSES.includes(contract.status)
    ) {
      throw new AppError('Contract has not been delivered', 400);
    }

    await assertNoActiveDispute(contract.id, client);
    await assertEscrowFunded(contract.id, client);

    const existingRelease = await findTransactionByContractIdAndType(
      contract.id,
      TRANSACTION_TYPES.RELEASE,
      client,
    );

    if (existingRelease) {
      throw new AppError('Payment already released', 409);
    }

    const freelancerProfile = await findFreelancerProfileById(
      contract.freelancer_id,
    );

    if (!freelancerProfile?.user_id) {
      throw new AppError('Freelancer not found', 404);
    }

    freelancerUserId = freelancerProfile.user_id;

    const clientWallet = await requireExistingWallet(actor.id, client);
    const freelancerWallet = await requireExistingWallet(
      freelancerProfile.user_id,
      client,
    );
    const escrowBalance = parseStoredMoney(
      clientWallet.escrow_balance,
      'escrow_balance',
    );

    if (escrowBalance < contractValue) {
      throw new AppError('Contract is not funded in escrow', 409);
    }

    const { commission, payout } = calculateCommission(contractValue);

    const updatedClientWallet = await updateWalletBalancesById(
      clientWallet.id,
      { balanceDelta: 0, escrowDelta: -contractValue },
      client,
    );
    await updateWalletBalancesById(
      freelancerWallet.id,
      { balanceDelta: payout, escrowDelta: 0 },
      client,
    );
    await updateContractPaymentStatusById(contract.id, 'released', client);

    const transaction = await insertTransaction(
      {
        walletId: updatedClientWallet.id,
        contractId: contract.id,
        type: TRANSACTION_TYPES.RELEASE,
        commission,
        amount: contractValue,
      },
      client,
    );

    return financialResult(updatedClientWallet, transaction);
  });

  await notifyUser({
    userId: freelancerUserId,
    type: NOTIFICATION_TYPES.PAYMENT_RELEASED,
  });

  return result;
};
