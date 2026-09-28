import { query } from '../../../config/db.js';

const SCOPE_CHANGE_COLUMNS = `
  id,
  contract_id,
  requested_by,
  description,
  price_adjustment,
  duration_adjustment,
  status
`;

export const findScopeChangeById = async (scopeChangeId) => {
  const result = await query(
    `SELECT ${SCOPE_CHANGE_COLUMNS}
     FROM scope_changes
     WHERE id = $1`,
    [scopeChangeId],
  );

  return result.rows[0] || null;
};

export const insertScopeChange = async ({
  contractId,
  requestedBy,
  description,
  priceAdjustment,
  durationAdjustment,
}) => {
  const result = await query(
    `INSERT INTO scope_changes (
       contract_id,
       requested_by,
       description,
       price_adjustment,
       duration_adjustment,
       status
     )
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING ${SCOPE_CHANGE_COLUMNS}`,
    [contractId, requestedBy, description, priceAdjustment, durationAdjustment],
  );

  return result.rows[0];
};

export const updateScopeChangeStatusById = async (scopeChangeId, status) => {
  const result = await query(
    `UPDATE scope_changes
     SET status = $1
     WHERE id = $2
       AND status = $3
     RETURNING ${SCOPE_CHANGE_COLUMNS}`,
    [status, scopeChangeId, 'pending'],
  );

  return result.rows[0] || null;
};
