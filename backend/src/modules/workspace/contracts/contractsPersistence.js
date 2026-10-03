import { query } from '../../../config/db.js';

const CONTRACT_COLUMNS = `
  id,
  project_id,
  client_id,
  freelancer_id,
  contract_value,
  commission,
  status,
  start_date,
  delivery_date,
  payment_status
`;

const runQuery = (executor, text, params) => {
  if (typeof executor === 'function') {
    return executor(text, params);
  }

  return executor.query(text, params);
};

export const findContractById = async (contractId, executor = query) => {
  const result = await runQuery(
    executor,
    `SELECT ${CONTRACT_COLUMNS}
     FROM contracts
     WHERE id = $1`,
    [contractId],
  );

  return result.rows[0] || null;
};

export const lockContractById = async (contractId, executor) => {
  const result = await runQuery(
    executor,
    `SELECT ${CONTRACT_COLUMNS}
     FROM contracts
     WHERE id = $1
     FOR UPDATE`,
    [contractId],
  );

  return result.rows[0] || null;
};

export const updateContractPaymentStatusById = async (
  contractId,
  paymentStatus,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `UPDATE contracts
     SET payment_status = $1
     WHERE id = $2
     RETURNING ${CONTRACT_COLUMNS}`,
    [paymentStatus, contractId],
  );

  return result.rows[0] || null;
};

export const findContractByProjectId = async (projectId, executor = query) => {
  const result = await runQuery(
    executor,
    `SELECT ${CONTRACT_COLUMNS}
     FROM contracts
     WHERE project_id = $1`,
    [projectId],
  );

  return result.rows[0] || null;
};

export const listContractsByClientId = async (clientId, executor = query) => {
  const result = await runQuery(
    executor,
    `SELECT ${CONTRACT_COLUMNS},
       (SELECT p.title FROM projects p WHERE p.id = contracts.project_id) AS project_title,
       (SELECT u.name FROM client_profiles cp JOIN users u ON u.id = cp.user_id
         WHERE cp.id = contracts.client_id) AS client_name,
       (SELECT u.name FROM freelancer_profiles fp JOIN users u ON u.id = fp.user_id
         WHERE fp.id = contracts.freelancer_id) AS freelancer_name
     FROM contracts
     WHERE client_id = $1
     ORDER BY id DESC`,
    [clientId],
  );

  return result.rows;
};

export const listContractsByFreelancerId = async (freelancerId, executor = query) => {
  const result = await runQuery(
    executor,
    `SELECT ${CONTRACT_COLUMNS},
       (SELECT p.title FROM projects p WHERE p.id = contracts.project_id) AS project_title,
       (SELECT u.name FROM client_profiles cp JOIN users u ON u.id = cp.user_id
         WHERE cp.id = contracts.client_id) AS client_name,
       (SELECT u.name FROM freelancer_profiles fp JOIN users u ON u.id = fp.user_id
         WHERE fp.id = contracts.freelancer_id) AS freelancer_name
     FROM contracts
     WHERE freelancer_id = $1
     ORDER BY id DESC`,
    [freelancerId],
  );

  return result.rows;
};

export const insertContract = async (
  {
    projectId,
    clientId,
    freelancerId,
    contractValue,
  },
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `INSERT INTO contracts (
       project_id,
       client_id,
       freelancer_id,
       contract_value,
       commission,
       status,
       start_date,
       delivery_date,
       payment_status
     )
     VALUES ($1, $2, $3, $4, NULL, 'awaiting_escrow', CURRENT_DATE, NULL, 'pending')
     RETURNING ${CONTRACT_COLUMNS}`,
    [projectId, clientId, freelancerId, contractValue],
  );

  return result.rows[0];
};

export const updateContractStatusById = async (
  contractId,
  status,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `UPDATE contracts
     SET status = $1
     WHERE id = $2
     RETURNING ${CONTRACT_COLUMNS}`,
    [status, contractId],
  );

  return result.rows[0] || null;
};
