import { query } from '../../config/db.js';
import { findDisputeById } from '../disputes/disputesPersistence.js';
import {
  deleteServiceById as deleteServiceRow,
  findServiceById,
} from '../freelancer/services/servicesPersistence.js';
import {
  deleteProjectById as deleteProjectRow,
  findProjectById,
} from '../projects/projectsPersistence.js';
import { findUserById } from '../users/usersPersistence.js';

const PUBLIC_USER_COLUMNS = `
  id,
  name,
  email,
  phone,
  role,
  profile_image,
  account_status,
  created_at
`;

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

const TRANSACTION_COLUMNS = `
  id,
  wallet_id,
  contract_id,
  type,
  commission
`;

const SUBSCRIPTION_COLUMNS = `
  id,
  freelancer_id,
  plan_type,
  price,
  start_date,
  end_date,
  status,
  payment_status
`;

const SERVICE_COLUMNS = `
  id,
  freelancer_id,
  title,
  description,
  category,
  price,
  delivery_time,
  status
`;

const PROJECT_COLUMNS = `
  id,
  client_id,
  title,
  description,
  category,
  budget_min,
  budget_max,
  duration,
  required_skills,
  attachments,
  status,
  chosen_freelancer_id,
  published_at
`;

const DISPUTE_COLUMNS = `
  id,
  reported_by,
  reported_against,
  project_id,
  issue_type,
  description,
  evidence_attachments,
  status,
  action_taken
`;

const REVIEW_COLUMNS = `
  id,
  contract_id,
  reviewer_id,
  reviewee_id,
  rating,
  comment
`;

const countRows = async (text) => {
  const result = await query(text);
  return Number(result.rows[0].count);
};

export const findAdminUserById = async (userId) => {
  return findUserById(userId);
};

export const updateAdminUserAccountStatus = async (userId, accountStatus) => {
  const result = await query(
    `UPDATE users
     SET account_status = $1
     WHERE id = $2
     RETURNING ${PUBLIC_USER_COLUMNS}`,
    [accountStatus, userId],
  );

  return result.rows[0] || null;
};

export const deleteAdminUserRow = async (userId) => {
  const result = await query(
    `DELETE FROM users
     WHERE id = $1
     RETURNING ${PUBLIC_USER_COLUMNS}`,
    [userId],
  );

  return result.rows[0] || null;
};

export const findAdminServiceById = async (serviceId) => {
  return findServiceById(serviceId);
};

export const updateAdminServiceStatus = async (serviceId, status) => {
  const result = await query(
    `UPDATE services
     SET status = $1
     WHERE id = $2
     RETURNING ${SERVICE_COLUMNS}`,
    [status, serviceId],
  );

  return result.rows[0] || null;
};

export const deleteAdminServiceRow = async (serviceId) => {
  return deleteServiceRow(serviceId);
};

export const findAdminProjectById = async (projectId) => {
  return findProjectById(projectId);
};

export const updateAdminProjectStatus = async (projectId, status) => {
  const result = await query(
    `UPDATE projects
     SET status = $1
     WHERE id = $2
     RETURNING ${PROJECT_COLUMNS}`,
    [status, projectId],
  );

  return result.rows[0] || null;
};

export const deleteAdminProjectRow = async (projectId) => {
  return deleteProjectRow(projectId);
};

export const listAdminContracts = async () => {
  const result = await query(
    `SELECT ${CONTRACT_COLUMNS}
     FROM contracts`,
  );

  return result.rows;
};

export const listAdminPayments = async () => {
  const result = await query(
    `SELECT ${TRANSACTION_COLUMNS}
     FROM transactions`,
  );

  return result.rows;
};

export const findAdminSubscriptionById = async (subscriptionId) => {
  const result = await query(
    `SELECT ${SUBSCRIPTION_COLUMNS}
     FROM subscriptions
     WHERE id = $1`,
    [subscriptionId],
  );

  return result.rows[0] || null;
};

export const updateAdminSubscriptionStatus = async (subscriptionId, status) => {
  const result = await query(
    `UPDATE subscriptions
     SET status = $1
     WHERE id = $2
     RETURNING ${SUBSCRIPTION_COLUMNS}`,
    [status, subscriptionId],
  );

  return result.rows[0] || null;
};

export const findAdminDisputeById = async (disputeId) => {
  return findDisputeById(disputeId);
};

export const updateAdminDisputeFields = async (disputeId, payload) => {
  const assignments = [];
  const values = [];

  if (Object.prototype.hasOwnProperty.call(payload, 'status')) {
    values.push(payload.status);
    assignments.push(`status = $${values.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'action_taken')) {
    values.push(payload.action_taken);
    assignments.push(`action_taken = $${values.length}`);
  }

  if (assignments.length === 0) {
    return findAdminDisputeById(disputeId);
  }

  values.push(disputeId);

  const result = await query(
    `UPDATE disputes
     SET ${assignments.join(', ')}
     WHERE id = $${values.length}
     RETURNING ${DISPUTE_COLUMNS}`,
    values,
  );

  return result.rows[0] || null;
};

export const findAdminReviewById = async (reviewId) => {
  const result = await query(
    `SELECT ${REVIEW_COLUMNS}
     FROM reviews
     WHERE id = $1`,
    [reviewId],
  );

  return result.rows[0] || null;
};

export const deleteAdminReviewRow = async (reviewId) => {
  const result = await query(
    `DELETE FROM reviews
     WHERE id = $1
     RETURNING ${REVIEW_COLUMNS}`,
    [reviewId],
  );

  return result.rows[0] || null;
};

export const getAdminCounts = async () => {
  const [
    users,
    services,
    projects,
    contracts,
    payments,
    subscriptions,
    disputes,
    reviews,
  ] = await Promise.all([
    countRows('SELECT COUNT(id) AS count FROM users'),
    countRows('SELECT COUNT(id) AS count FROM services'),
    countRows('SELECT COUNT(id) AS count FROM projects'),
    countRows('SELECT COUNT(id) AS count FROM contracts'),
    countRows('SELECT COUNT(id) AS count FROM transactions'),
    countRows('SELECT COUNT(id) AS count FROM subscriptions'),
    countRows('SELECT COUNT(id) AS count FROM disputes'),
    countRows('SELECT COUNT(id) AS count FROM reviews'),
  ]);

  return {
    users,
    services,
    projects,
    contracts,
    payments,
    subscriptions,
    disputes,
    reviews,
  };
};
