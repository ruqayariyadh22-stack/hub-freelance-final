import { query } from '../../config/db.js';

const ENTITLEMENT_COLUMNS = `
  id,
  user_id,
  entitlement,
  created_at
`;

const runQuery = (executor, text, params) => {
  if (typeof executor === 'function') {
    return executor(text, params);
  }

  return executor.query(text, params);
};

export const findClientAiEntitlement = async (
  userId,
  entitlement,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `SELECT ${ENTITLEMENT_COLUMNS}
     FROM client_ai_entitlements
     WHERE user_id = $1
       AND entitlement = $2`,
    [userId, entitlement],
  );

  return result.rows[0] || null;
};
