import { query } from '../../../config/db.js';

const ADVERTISEMENT_COLUMNS = `
  id,
  freelancer_id,
  service_id,
  subscription_id,
  created_at
`;

const runQuery = (executor, text, params) => {
  if (typeof executor === 'function') {
    return executor(text, params);
  }

  return executor.query(text, params);
};

export const insertAdvertisement = async (
  { freelancerId, serviceId, subscriptionId },
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `INSERT INTO advertisements (
       freelancer_id,
       service_id,
       subscription_id,
       created_at
     )
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
     RETURNING ${ADVERTISEMENT_COLUMNS}`,
    [freelancerId, serviceId, subscriptionId],
  );

  return result.rows[0];
};

export const listAdvertisementsByFreelancerId = async (
  freelancerId,
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `SELECT ${ADVERTISEMENT_COLUMNS}
     FROM advertisements
     WHERE freelancer_id = $1
     ORDER BY created_at DESC, id DESC`,
    [freelancerId],
  );

  return result.rows;
};

export const listPublicAdvertisements = async (executor = query) => {
  const result = await runQuery(
    executor,
    `SELECT
       a.id,
       a.freelancer_id,
       a.service_id,
       a.created_at,
       s.id AS service_row_id,
       s.freelancer_id AS service_freelancer_id,
       s.title,
       s.description,
       s.category,
       s.price,
       s.delivery_time,
       s.status,
       s.is_featured
     FROM advertisements a
     JOIN services s ON s.id = a.service_id
     ORDER BY a.created_at DESC, a.id DESC`,
  );

  return result.rows;
};

export const incrementMonthlyAdUsage = async (
  { freelancerId, subscriptionId },
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `INSERT INTO subscription_ad_usage (
       freelancer_id,
       subscription_id,
       period_start,
       ads_used,
       created_at,
       updated_at
     )
     VALUES (
       $1,
       $2,
       date_trunc('month', CURRENT_DATE)::date,
       1,
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
     )
     ON CONFLICT (freelancer_id, subscription_id, period_start)
     DO UPDATE
       SET ads_used = subscription_ad_usage.ads_used + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE subscription_ad_usage.ads_used < 2
     RETURNING
       id,
       freelancer_id,
       subscription_id,
       period_start,
       ads_used`,
    [freelancerId, subscriptionId],
  );

  return result.rows[0] || null;
};

export const findMonthlyAdUsage = async (
  { freelancerId, subscriptionId },
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `SELECT
       id,
       freelancer_id,
       subscription_id,
       period_start,
       ads_used
     FROM subscription_ad_usage
     WHERE freelancer_id = $1
       AND subscription_id = $2
       AND period_start = date_trunc('month', CURRENT_DATE)::date`,
    [freelancerId, subscriptionId],
  );

  return result.rows[0] || null;
};
