import { query } from '../../config/db.js';

const SUBSCRIPTION_COLUMNS = `
  id,
  freelancer_id,
  client_id,
  plan_type,
  price,
  start_date,
  end_date,
  status,
  payment_status,
  cancel_at_period_end
`;

const runQuery = (executor, text, params) => {
  if (typeof executor === 'function') {
    return executor(text, params);
  }

  return executor.query(text, params);
};

export const listSubscriptionsByFreelancerId = async (
  freelancerId,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `SELECT ${SUBSCRIPTION_COLUMNS}
     FROM subscriptions
     WHERE freelancer_id = $1
     ORDER BY start_date DESC NULLS LAST, id DESC`,
    [freelancerId],
  );

  return result.rows;
};

export const findActiveSubscriptionByFreelancerId = async (
  freelancerId,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `SELECT ${SUBSCRIPTION_COLUMNS}
     FROM subscriptions
     WHERE freelancer_id = $1
       AND status = 'active'
       AND end_date >= CURRENT_DATE`,
    [freelancerId],
  );

  return result.rows[0] || null;
};

export const findActiveSubscriptionByClientId = async (
  clientId,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `SELECT ${SUBSCRIPTION_COLUMNS}
     FROM subscriptions
     WHERE client_id = $1
       AND status = 'active'
       AND end_date >= CURRENT_DATE`,
    [clientId],
  );

  return result.rows[0] || null;
};

export const settleDueSubscriptionsByClientId = async (
  clientId,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `UPDATE subscriptions
     SET status = CASE
       WHEN cancel_at_period_end IS TRUE THEN 'cancelled'
       ELSE 'expired'
     END
     WHERE client_id = $1
       AND status = 'active'
       AND end_date IS NOT NULL
       AND end_date < CURRENT_DATE
     RETURNING ${SUBSCRIPTION_COLUMNS}`,
    [clientId],
  );

  return result.rows;
};

export const lockActiveSubscriptionsByClientId = async (clientId, executor) => {
  const result = await runQuery(
    executor,
    `SELECT ${SUBSCRIPTION_COLUMNS}
     FROM subscriptions
     WHERE client_id = $1
       AND status = 'active'
     FOR UPDATE`,
    [clientId],
  );

  return result.rows;
};

export const lockActiveSubscriptionByClientId = async (clientId, executor) => {
  await lockActiveSubscriptionsByClientId(clientId, executor);
  await settleDueSubscriptionsByClientId(clientId, executor);
  return findActiveSubscriptionByClientId(clientId, executor);
};

export const lockActiveSubscriptionsByFreelancerId = async (
  freelancerId,
  executor,
) => {
  const result = await runQuery(
    executor,
    `SELECT ${SUBSCRIPTION_COLUMNS}
     FROM subscriptions
     WHERE freelancer_id = $1
       AND status = 'active'
     FOR UPDATE`,
    [freelancerId],
  );

  return result.rows;
};

export const lockActiveSubscriptionByFreelancerId = async (
  freelancerId,
  executor,
) => {
  await lockActiveSubscriptionsByFreelancerId(freelancerId, executor);
  await settleDueSubscriptionsByFreelancerId(freelancerId, executor);
  return findActiveSubscriptionByFreelancerId(freelancerId, executor);
};

export const settleDueSubscriptionsByFreelancerId = async (
  freelancerId,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `UPDATE subscriptions
     SET status = CASE
       WHEN cancel_at_period_end IS TRUE THEN 'cancelled'
       ELSE 'expired'
     END
     WHERE freelancer_id = $1
       AND status = 'active'
       AND end_date IS NOT NULL
       AND end_date < CURRENT_DATE
     RETURNING ${SUBSCRIPTION_COLUMNS}`,
    [freelancerId],
  );

  return result.rows;
};

export const markSubscriptionCancelAtPeriodEnd = async (
  subscriptionId,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `UPDATE subscriptions
     SET cancel_at_period_end = TRUE
     WHERE id = $1
       AND status = 'active'
       AND end_date >= CURRENT_DATE
     RETURNING ${SUBSCRIPTION_COLUMNS}`,
    [subscriptionId],
  );

  return result.rows[0] || null;
};

export const extendSubscriptionEndDate = async (
  subscriptionId,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `UPDATE subscriptions
     SET end_date = end_date + 30
     WHERE id = $1
       AND status = 'active'
       AND cancel_at_period_end IS NOT TRUE
       AND end_date >= CURRENT_DATE
     RETURNING ${SUBSCRIPTION_COLUMNS}`,
    [subscriptionId],
  );

  return result.rows[0] || null;
};

export const insertSubscription = async (
  { freelancerId, clientId = null, planType, price },
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `INSERT INTO subscriptions (
       freelancer_id,
       client_id,
       plan_type,
       price,
       start_date,
       end_date,
       status,
       payment_status,
       cancel_at_period_end
     )
     VALUES (
       $1,
       $2,
       $3,
       $4,
       CURRENT_DATE,
       CURRENT_DATE + 30,
       'active',
       'paid',
       FALSE
     )
     RETURNING ${SUBSCRIPTION_COLUMNS}`,
    [freelancerId ?? null, clientId ?? null, planType, price],
  );

  return result.rows[0];
};
