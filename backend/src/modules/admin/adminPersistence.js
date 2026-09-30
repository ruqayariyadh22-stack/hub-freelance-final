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
  c.id,
  c.project_id,
  c.client_id,
  c.freelancer_id,
  c.contract_value,
  c.commission,
  c.status,
  c.start_date,
  c.delivery_date,
  c.payment_status,
  p.title AS project_title,
  cu.name AS client_name,
  fu.name AS freelancer_name
`;

const TRANSACTION_COLUMNS = `
  t.id,
  t.wallet_id,
  t.contract_id,
  t.type,
  t.amount,
  t.commission,
  wu.name AS wallet_user_name,
  wu.role AS wallet_user_role,
  p.title AS project_title
`;

const SUBSCRIPTION_COLUMNS = `
  s.id,
  s.freelancer_id,
  s.client_id,
  s.plan_type,
  s.price,
  s.start_date,
  s.end_date,
  s.status,
  s.payment_status,
  s.cancel_at_period_end,
  fu.name AS freelancer_name,
  cu.name AS client_name
`;

const SERVICE_COLUMNS = `
  s.id,
  s.freelancer_id,
  s.title,
  s.description,
  s.category,
  s.price,
  s.delivery_time,
  s.status,
  u.name AS freelancer_name
`;

const PROJECT_COLUMNS = `
  p.id,
  p.client_id,
  p.title,
  p.description,
  p.category,
  p.budget_min,
  p.budget_max,
  p.duration,
  p.required_skills,
  p.attachments,
  p.status,
  p.chosen_freelancer_id,
  p.published_at,
  u.name AS client_name
`;

const DISPUTE_COLUMNS = `
  d.id,
  d.reported_by,
  d.reported_against,
  d.project_id,
  d.issue_type,
  d.description,
  d.evidence_attachments,
  d.status,
  d.action_taken,
  rb.name AS reporter_name,
  ra.name AS reported_against_name,
  p.title AS project_title
`;

const REVIEW_COLUMNS = `
  r.id,
  r.contract_id,
  r.reviewer_id,
  r.reviewee_id,
  r.rating,
  r.comment,
  rv.name AS reviewer_name,
  re.name AS reviewee_name
`;

const countRows = async (text, params = []) => {
  const result = await query(text, params);
  return Number(result.rows[0].count);
};

const clampLimit = (limit) => {
  const n = Number(limit);
  if (!Number.isFinite(n) || n < 1) {
    return 20;
  }
  return Math.min(Math.trunc(n), 100);
};

const clampPage = (page) => {
  const n = Number(page);
  if (!Number.isFinite(n) || n < 1) {
    return 1;
  }
  return Math.trunc(n);
};

const buildPagedResult = (rows, total, page, limit) => ({
  items: rows,
  page,
  limit,
  total,
  total_pages: Math.max(1, Math.ceil(total / limit)),
});

export const findAdminUserById = async (userId) => {
  return findUserById(userId);
};

export const listAdminUsers = async ({
  page = 1,
  limit = 20,
  search = '',
  role = '',
  status = '',
} = {}) => {
  const safePage = clampPage(page);
  const safeLimit = clampLimit(limit);
  const offset = (safePage - 1) * safeLimit;
  const where = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    where.push(
      `(name ILIKE $${params.length} OR email ILIKE $${params.length})`,
    );
  }

  if (role) {
    params.push(role);
    where.push(`role = $${params.length}`);
  }

  if (status) {
    params.push(status);
    where.push(`account_status = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = await countRows(
    `SELECT COUNT(id) AS count FROM users ${whereSql}`,
    params,
  );

  const listParams = [...params, safeLimit, offset];
  const result = await query(
    `SELECT ${PUBLIC_USER_COLUMNS}
     FROM users
     ${whereSql}
     ORDER BY id DESC
     LIMIT $${params.length + 1}
     OFFSET $${params.length + 2}`,
    listParams,
  );

  return buildPagedResult(result.rows, total, safePage, safeLimit);
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

export const listAdminServices = async ({
  page = 1,
  limit = 20,
  search = '',
  status = '',
} = {}) => {
  const safePage = clampPage(page);
  const safeLimit = clampLimit(limit);
  const offset = (safePage - 1) * safeLimit;
  const where = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    where.push(
      `(s.title ILIKE $${params.length} OR s.category ILIKE $${params.length} OR u.name ILIKE $${params.length})`,
    );
  }

  if (status) {
    params.push(status);
    where.push(`s.status = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = await countRows(
    `SELECT COUNT(s.id) AS count
     FROM services s
     LEFT JOIN freelancer_profiles fp ON fp.id = s.freelancer_id
     LEFT JOIN users u ON u.id = fp.user_id
     ${whereSql}`,
    params,
  );

  const listParams = [...params, safeLimit, offset];
  const result = await query(
    `SELECT ${SERVICE_COLUMNS}
     FROM services s
     LEFT JOIN freelancer_profiles fp ON fp.id = s.freelancer_id
     LEFT JOIN users u ON u.id = fp.user_id
     ${whereSql}
     ORDER BY s.id DESC
     LIMIT $${params.length + 1}
     OFFSET $${params.length + 2}`,
    listParams,
  );

  return buildPagedResult(result.rows, total, safePage, safeLimit);
};

export const updateAdminServiceStatus = async (serviceId, status) => {
  const result = await query(
    `UPDATE services
     SET status = $1
     WHERE id = $2
     RETURNING id, freelancer_id, title, description, category, price, delivery_time, status`,
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

export const listAdminProjects = async ({
  page = 1,
  limit = 20,
  search = '',
  status = '',
} = {}) => {
  const safePage = clampPage(page);
  const safeLimit = clampLimit(limit);
  const offset = (safePage - 1) * safeLimit;
  const where = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    where.push(
      `(p.title ILIKE $${params.length} OR p.category ILIKE $${params.length} OR u.name ILIKE $${params.length})`,
    );
  }

  if (status) {
    params.push(status);
    where.push(`p.status = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = await countRows(
    `SELECT COUNT(p.id) AS count
     FROM projects p
     LEFT JOIN client_profiles cp ON cp.id = p.client_id
     LEFT JOIN users u ON u.id = cp.user_id
     ${whereSql}`,
    params,
  );

  const listParams = [...params, safeLimit, offset];
  const result = await query(
    `SELECT ${PROJECT_COLUMNS}
     FROM projects p
     LEFT JOIN client_profiles cp ON cp.id = p.client_id
     LEFT JOIN users u ON u.id = cp.user_id
     ${whereSql}
     ORDER BY p.id DESC
     LIMIT $${params.length + 1}
     OFFSET $${params.length + 2}`,
    listParams,
  );

  return buildPagedResult(result.rows, total, safePage, safeLimit);
};

export const updateAdminProjectStatus = async (projectId, status) => {
  const result = await query(
    `UPDATE projects
     SET status = $1
     WHERE id = $2
     RETURNING id, client_id, title, description, category, budget_min, budget_max,
               duration, required_skills, attachments, status, chosen_freelancer_id, published_at`,
    [status, projectId],
  );

  return result.rows[0] || null;
};

export const deleteAdminProjectRow = async (projectId) => {
  return deleteProjectRow(projectId);
};

export const listAdminContracts = async ({
  page = 1,
  limit = 20,
  search = '',
  status = '',
} = {}) => {
  const safePage = clampPage(page);
  const safeLimit = clampLimit(limit);
  const offset = (safePage - 1) * safeLimit;
  const where = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    where.push(
      `(p.title ILIKE $${params.length} OR cu.name ILIKE $${params.length} OR fu.name ILIKE $${params.length} OR CAST(c.id AS TEXT) ILIKE $${params.length})`,
    );
  }

  if (status) {
    params.push(status);
    where.push(`c.status = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = await countRows(
    `SELECT COUNT(c.id) AS count
     FROM contracts c
     LEFT JOIN projects p ON p.id = c.project_id
     LEFT JOIN client_profiles cp ON cp.id = c.client_id
     LEFT JOIN users cu ON cu.id = cp.user_id
     LEFT JOIN freelancer_profiles fp ON fp.id = c.freelancer_id
     LEFT JOIN users fu ON fu.id = fp.user_id
     ${whereSql}`,
    params,
  );

  const listParams = [...params, safeLimit, offset];
  const result = await query(
    `SELECT ${CONTRACT_COLUMNS}
     FROM contracts c
     LEFT JOIN projects p ON p.id = c.project_id
     LEFT JOIN client_profiles cp ON cp.id = c.client_id
     LEFT JOIN users cu ON cu.id = cp.user_id
     LEFT JOIN freelancer_profiles fp ON fp.id = c.freelancer_id
     LEFT JOIN users fu ON fu.id = fp.user_id
     ${whereSql}
     ORDER BY c.id DESC
     LIMIT $${params.length + 1}
     OFFSET $${params.length + 2}`,
    listParams,
  );

  return buildPagedResult(result.rows, total, safePage, safeLimit);
};

export const listAdminPayments = async ({
  page = 1,
  limit = 20,
  search = '',
  type = '',
} = {}) => {
  const safePage = clampPage(page);
  const safeLimit = clampLimit(limit);
  const offset = (safePage - 1) * safeLimit;
  const where = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    where.push(
      `(wu.name ILIKE $${params.length} OR p.title ILIKE $${params.length} OR CAST(t.id AS TEXT) ILIKE $${params.length})`,
    );
  }

  if (type) {
    params.push(type);
    where.push(`t.type = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = await countRows(
    `SELECT COUNT(t.id) AS count
     FROM transactions t
     LEFT JOIN wallets w ON w.id = t.wallet_id
     LEFT JOIN users wu ON wu.id = w.user_id
     LEFT JOIN contracts c ON c.id = t.contract_id
     LEFT JOIN projects p ON p.id = c.project_id
     ${whereSql}`,
    params,
  );

  const listParams = [...params, safeLimit, offset];
  const result = await query(
    `SELECT ${TRANSACTION_COLUMNS}
     FROM transactions t
     LEFT JOIN wallets w ON w.id = t.wallet_id
     LEFT JOIN users wu ON wu.id = w.user_id
     LEFT JOIN contracts c ON c.id = t.contract_id
     LEFT JOIN projects p ON p.id = c.project_id
     ${whereSql}
     ORDER BY t.id DESC
     LIMIT $${params.length + 1}
     OFFSET $${params.length + 2}`,
    listParams,
  );

  return buildPagedResult(result.rows, total, safePage, safeLimit);
};

export const findAdminSubscriptionById = async (subscriptionId) => {
  const result = await query(
    `SELECT ${SUBSCRIPTION_COLUMNS}
     FROM subscriptions s
     LEFT JOIN freelancer_profiles fp ON fp.id = s.freelancer_id
     LEFT JOIN users fu ON fu.id = fp.user_id
     LEFT JOIN client_profiles cp ON cp.id = s.client_id
     LEFT JOIN users cu ON cu.id = cp.user_id
     WHERE s.id = $1`,
    [subscriptionId],
  );

  return result.rows[0] || null;
};

export const listAdminSubscriptions = async ({
  page = 1,
  limit = 20,
  search = '',
  status = '',
  plan = '',
} = {}) => {
  const safePage = clampPage(page);
  const safeLimit = clampLimit(limit);
  const offset = (safePage - 1) * safeLimit;
  const where = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    where.push(
      `(fu.name ILIKE $${params.length} OR cu.name ILIKE $${params.length} OR s.plan_type ILIKE $${params.length})`,
    );
  }

  if (status) {
    params.push(status);
    where.push(`s.status = $${params.length}`);
  }

  if (plan) {
    params.push(plan);
    where.push(`s.plan_type = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = await countRows(
    `SELECT COUNT(s.id) AS count
     FROM subscriptions s
     LEFT JOIN freelancer_profiles fp ON fp.id = s.freelancer_id
     LEFT JOIN users fu ON fu.id = fp.user_id
     LEFT JOIN client_profiles cp ON cp.id = s.client_id
     LEFT JOIN users cu ON cu.id = cp.user_id
     ${whereSql}`,
    params,
  );

  const listParams = [...params, safeLimit, offset];
  const result = await query(
    `SELECT ${SUBSCRIPTION_COLUMNS}
     FROM subscriptions s
     LEFT JOIN freelancer_profiles fp ON fp.id = s.freelancer_id
     LEFT JOIN users fu ON fu.id = fp.user_id
     LEFT JOIN client_profiles cp ON cp.id = s.client_id
     LEFT JOIN users cu ON cu.id = cp.user_id
     ${whereSql}
     ORDER BY s.id DESC
     LIMIT $${params.length + 1}
     OFFSET $${params.length + 2}`,
    listParams,
  );

  return buildPagedResult(result.rows, total, safePage, safeLimit);
};

export const updateAdminSubscriptionStatus = async (subscriptionId, status) => {
  const result = await query(
    `UPDATE subscriptions
     SET status = $1
     WHERE id = $2
     RETURNING id, freelancer_id, client_id, plan_type, price, start_date, end_date, status, payment_status, cancel_at_period_end`,
    [status, subscriptionId],
  );

  return result.rows[0] || null;
};

export const findAdminDisputeById = async (disputeId) => {
  return findDisputeById(disputeId);
};

export const listAdminDisputes = async ({
  page = 1,
  limit = 20,
  search = '',
  status = '',
} = {}) => {
  const safePage = clampPage(page);
  const safeLimit = clampLimit(limit);
  const offset = (safePage - 1) * safeLimit;
  const where = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    where.push(
      `(d.issue_type ILIKE $${params.length} OR d.description ILIKE $${params.length} OR rb.name ILIKE $${params.length} OR p.title ILIKE $${params.length})`,
    );
  }

  if (status) {
    params.push(status);
    where.push(`d.status = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = await countRows(
    `SELECT COUNT(d.id) AS count
     FROM disputes d
     LEFT JOIN users rb ON rb.id = d.reported_by
     LEFT JOIN users ra ON ra.id = d.reported_against
     LEFT JOIN projects p ON p.id = d.project_id
     ${whereSql}`,
    params,
  );

  const listParams = [...params, safeLimit, offset];
  const result = await query(
    `SELECT ${DISPUTE_COLUMNS}
     FROM disputes d
     LEFT JOIN users rb ON rb.id = d.reported_by
     LEFT JOIN users ra ON ra.id = d.reported_against
     LEFT JOIN projects p ON p.id = d.project_id
     ${whereSql}
     ORDER BY d.id DESC
     LIMIT $${params.length + 1}
     OFFSET $${params.length + 2}`,
    listParams,
  );

  return buildPagedResult(result.rows, total, safePage, safeLimit);
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
     RETURNING id, reported_by, reported_against, project_id, issue_type, description, evidence_attachments, status, action_taken`,
    values,
  );

  return result.rows[0] || null;
};

export const findAdminReviewById = async (reviewId) => {
  const result = await query(
    `SELECT ${REVIEW_COLUMNS}
     FROM reviews r
     LEFT JOIN users rv ON rv.id = r.reviewer_id
     LEFT JOIN users re ON re.id = r.reviewee_id
     WHERE r.id = $1`,
    [reviewId],
  );

  return result.rows[0] || null;
};

export const listAdminReviews = async ({
  page = 1,
  limit = 20,
  search = '',
} = {}) => {
  const safePage = clampPage(page);
  const safeLimit = clampLimit(limit);
  const offset = (safePage - 1) * safeLimit;
  const where = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    where.push(
      `(rv.name ILIKE $${params.length} OR re.name ILIKE $${params.length} OR r.comment ILIKE $${params.length})`,
    );
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = await countRows(
    `SELECT COUNT(r.id) AS count
     FROM reviews r
     LEFT JOIN users rv ON rv.id = r.reviewer_id
     LEFT JOIN users re ON re.id = r.reviewee_id
     ${whereSql}`,
    params,
  );

  const listParams = [...params, safeLimit, offset];
  const result = await query(
    `SELECT ${REVIEW_COLUMNS}
     FROM reviews r
     LEFT JOIN users rv ON rv.id = r.reviewer_id
     LEFT JOIN users re ON re.id = r.reviewee_id
     ${whereSql}
     ORDER BY r.id DESC
     LIMIT $${params.length + 1}
     OFFSET $${params.length + 2}`,
    listParams,
  );

  return buildPagedResult(result.rows, total, safePage, safeLimit);
};

export const deleteAdminReviewRow = async (reviewId) => {
  const result = await query(
    `DELETE FROM reviews
     WHERE id = $1
     RETURNING id, contract_id, reviewer_id, reviewee_id, rating, comment`,
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
    money,
  ] = await Promise.all([
    countRows('SELECT COUNT(id) AS count FROM users'),
    countRows('SELECT COUNT(id) AS count FROM services'),
    countRows('SELECT COUNT(id) AS count FROM projects'),
    countRows('SELECT COUNT(id) AS count FROM contracts'),
    countRows('SELECT COUNT(id) AS count FROM transactions'),
    countRows('SELECT COUNT(id) AS count FROM subscriptions'),
    countRows('SELECT COUNT(id) AS count FROM disputes'),
    countRows('SELECT COUNT(id) AS count FROM reviews'),
    query(
      `SELECT
         COALESCE(SUM(amount), 0)::float AS total_amount,
         COALESCE(SUM(commission), 0)::float AS total_commission
       FROM transactions`,
    ),
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
    total_transaction_amount: Number(money.rows[0].total_amount) || 0,
    total_commission: Number(money.rows[0].total_commission) || 0,
  };
};
