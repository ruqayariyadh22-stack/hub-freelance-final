import { query } from '../../config/db.js';

const WALLET_COLUMNS = `
  id,
  user_id,
  balance,
  escrow_balance
`;

const TRANSACTION_COLUMNS = `
  id,
  wallet_id,
  contract_id,
  type,
  commission,
  amount,
  created_at
`;

const runQuery = (executor, text, params) => {
  if (typeof executor === 'function') {
    return executor(text, params);
  }

  return executor.query(text, params);
};

export const findWalletByUserId = async (userId, executor = query) => {
  const result = await runQuery(
    executor,
    `SELECT ${WALLET_COLUMNS}
     FROM wallets
     WHERE user_id = $1`,
    [userId],
  );

  return result.rows[0] || null;
};

export const lockWalletByUserId = async (userId, executor) => {
  const result = await runQuery(
    executor,
    `SELECT ${WALLET_COLUMNS}
     FROM wallets
     WHERE user_id = $1
     FOR UPDATE`,
    [userId],
  );

  return result.rows[0] || null;
};

export const updateWalletBalancesById = async (
  walletId,
  { balanceDelta = 0, escrowDelta = 0 },
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `UPDATE wallets
     SET balance = COALESCE(balance, 0) + $1,
         escrow_balance = COALESCE(escrow_balance, 0) + $2
     WHERE id = $3
     RETURNING ${WALLET_COLUMNS}`,
    [balanceDelta, escrowDelta, walletId],
  );

  return result.rows[0] || null;
};

export const findTransactionByContractIdAndType = async (
  contractId,
  type,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `SELECT ${TRANSACTION_COLUMNS}
     FROM transactions
     WHERE contract_id = $1
       AND type = $2
     FOR UPDATE`,
    [contractId, type],
  );

  return result.rows[0] || null;
};

export const insertWalletForUser = async (userId, executor = query) => {  const result = await runQuery(
    executor,
    `INSERT INTO wallets (
       user_id,
       balance,
       escrow_balance
     )
     VALUES ($1, NULL, NULL)
     ON CONFLICT (user_id) DO NOTHING
     RETURNING ${WALLET_COLUMNS}`,
    [userId],
  );

  if (result.rows[0]) {
    return result.rows[0];
  }

  return findWalletByUserId(userId, executor);
};

export const listTransactionsByWalletId = async (walletId) => {
  const result = await query(
    `SELECT ${TRANSACTION_COLUMNS}
     FROM transactions
     WHERE wallet_id = $1
     ORDER BY created_at DESC, id DESC`,
    [walletId],
  );

  return result.rows;
};

export const insertTransaction = async (
  {
    walletId,
    contractId,
    type,
    commission,
    amount,
  },
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `INSERT INTO transactions (
       wallet_id,
       contract_id,
       type,
       commission,
       amount
     )
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${TRANSACTION_COLUMNS}`,
    [walletId, contractId, type, commission, amount],
  );

  return result.rows[0];
};

export const countDisputesByProjectId = async (projectId, executor = query) => {
  const result = await runQuery(
    executor,
    `SELECT id
     FROM disputes
     WHERE project_id = $1
       AND (status IS NULL OR status <> 'resolved')`,
    [projectId],
  );

  return result.rowCount;
};
