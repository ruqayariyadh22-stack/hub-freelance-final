import { AppError } from '../../utils/appError.js';
import {
  NOTIFICATION_TYPES,
  notifyUser,
} from '../notifications/notificationMessages.js';
import {
  deleteAdminProjectRow,
  deleteAdminReviewRow,
  deleteAdminServiceRow,
  deleteAdminUserRow,
  findAdminDisputeById,
  findAdminProjectById,
  findAdminReviewById,
  findAdminServiceById,
  findAdminSubscriptionById,
  findAdminUserById,
  getAdminCounts,
  listAdminContracts as listAdminContractRows,
  listAdminDisputes as listAdminDisputeRows,
  listAdminPayments as listAdminPaymentRows,
  listAdminProjects as listAdminProjectRows,
  listAdminReviews as listAdminReviewRows,
  listAdminServices as listAdminServiceRows,
  listAdminSubscriptions as listAdminSubscriptionRows,
  listAdminUsers as listAdminUserRows,
  updateAdminDisputeFields,
  updateAdminProjectStatus,
  updateAdminServiceStatus,
  updateAdminSubscriptionStatus,
  updateAdminUserAccountStatus,
} from './adminPersistence.js';

const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  profile_image: user.profile_image,
  account_status: user.account_status,
  created_at: user.created_at,
});

const toPublicService = (service) => ({
  id: service.id,
  freelancer_id: service.freelancer_id,
  freelancer_name: service.freelancer_name ?? null,
  title: service.title,
  description: service.description,
  category: service.category,
  price: service.price,
  delivery_time: service.delivery_time,
  status: service.status,
});

const toPublicProject = (project) => ({
  id: project.id,
  client_id: project.client_id,
  client_name: project.client_name ?? null,
  title: project.title,
  description: project.description,
  category: project.category,
  budget_min: project.budget_min,
  budget_max: project.budget_max,
  duration: project.duration,
  required_skills: project.required_skills,
  attachments: project.attachments,
  status: project.status,
  chosen_freelancer_id: project.chosen_freelancer_id,
  published_at: project.published_at,
});

const toPublicContract = (contract) => ({
  id: contract.id,
  project_id: contract.project_id,
  project_title: contract.project_title ?? null,
  client_id: contract.client_id,
  client_name: contract.client_name ?? null,
  freelancer_id: contract.freelancer_id,
  freelancer_name: contract.freelancer_name ?? null,
  contract_value: contract.contract_value,
  commission: contract.commission,
  status: contract.status,
  start_date: contract.start_date,
  delivery_date: contract.delivery_date,
  payment_status: contract.payment_status,
});

const toPublicPayment = (transaction) => ({
  id: transaction.id,
  wallet_id: transaction.wallet_id,
  contract_id: transaction.contract_id,
  type: transaction.type,
  amount: transaction.amount,
  commission: transaction.commission,
  wallet_user_name: transaction.wallet_user_name ?? null,
  wallet_user_role: transaction.wallet_user_role ?? null,
  project_title: transaction.project_title ?? null,
});

const toPublicSubscription = (subscription) => ({
  id: subscription.id,
  freelancer_id: subscription.freelancer_id ?? null,
  freelancer_name: subscription.freelancer_name ?? null,
  client_id: subscription.client_id ?? null,
  client_name: subscription.client_name ?? null,
  plan_type: subscription.plan_type,
  price: subscription.price,
  start_date: subscription.start_date,
  end_date: subscription.end_date,
  status: subscription.status,
  payment_status: subscription.payment_status,
  cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
});

const toPublicDispute = (dispute) => ({
  id: dispute.id,
  reported_by: dispute.reported_by,
  reporter_name: dispute.reporter_name ?? null,
  reported_against: dispute.reported_against,
  reported_against_name: dispute.reported_against_name ?? null,
  project_id: dispute.project_id,
  project_title: dispute.project_title ?? null,
  issue_type: dispute.issue_type,
  description: dispute.description,
  evidence_attachments: dispute.evidence_attachments,
  status: dispute.status,
  action_taken: dispute.action_taken,
});

const toPublicReview = (review) => ({
  id: review.id,
  contract_id: review.contract_id,
  reviewer_id: review.reviewer_id,
  reviewer_name: review.reviewer_name ?? null,
  reviewee_id: review.reviewee_id,
  reviewee_name: review.reviewee_name ?? null,
  rating: review.rating,
  comment: review.comment,
});

const mapPaged = (pageResult, mapper) => ({
  items: pageResult.items.map(mapper),
  page: pageResult.page,
  limit: pageResult.limit,
  total: pageResult.total,
  total_pages: pageResult.total_pages,
});

const requireResource = (resource, message) => {
  if (!resource) {
    throw new AppError(message, 404);
  }

  return resource;
};

const rethrowDeleteConflict = (error, message) => {
  if (error?.code === '23503') {
    throw new AppError(message, 409);
  }

  throw error;
};

export const listAdminUsers = async (filters) =>
  mapPaged(await listAdminUserRows(filters), toPublicUser);

export const getAdminUserById = async (userId) => {
  return toPublicUser(
    requireResource(await findAdminUserById(userId), 'User not found'),
  );
};

export const updateAdminUserById = async (userId, payload) => {
  const updated = await updateAdminUserAccountStatus(userId, payload.status);
  const publicUser = toPublicUser(requireResource(updated, 'User not found'));

  if (payload.status === 'disabled') {
    await notifyUser({
      userId: publicUser.id,
      type: NOTIFICATION_TYPES.ACCOUNT_DISABLED,
    });
  }

  return publicUser;
};

export const deleteAdminUserById = async (userId) => {
  const user = await getAdminUserById(userId);

  try {
    const deleted = await deleteAdminUserRow(userId);
    return toPublicUser(deleted || user);
  } catch (error) {
    rethrowDeleteConflict(
      error,
      'Cannot delete user because related records exist',
    );
  }
};

export const listAdminServices = async (filters) =>
  mapPaged(await listAdminServiceRows(filters), toPublicService);

export const getAdminServiceById = async (serviceId) => {
  return toPublicService(
    requireResource(await findAdminServiceById(serviceId), 'Service not found'),
  );
};

export const updateAdminServiceById = async (serviceId, payload) => {
  const updated = await updateAdminServiceStatus(serviceId, payload.status);
  return toPublicService(requireResource(updated, 'Service not found'));
};

export const deleteAdminServiceById = async (serviceId) => {
  const service = await getAdminServiceById(serviceId);

  try {
    const deleted = await deleteAdminServiceRow(serviceId);
    return toPublicService(deleted || service);
  } catch (error) {
    rethrowDeleteConflict(
      error,
      'Cannot delete service because related records exist',
    );
  }
};

export const listAdminProjects = async (filters) =>
  mapPaged(await listAdminProjectRows(filters), toPublicProject);

export const getAdminProjectById = async (projectId) => {
  return toPublicProject(
    requireResource(await findAdminProjectById(projectId), 'Project not found'),
  );
};

export const updateAdminProjectById = async (projectId, payload) => {
  const updated = await updateAdminProjectStatus(projectId, payload.status);
  return toPublicProject(requireResource(updated, 'Project not found'));
};

export const deleteAdminProjectById = async (projectId) => {
  const project = await getAdminProjectById(projectId);

  try {
    const deleted = await deleteAdminProjectRow(projectId);
    return toPublicProject(deleted || project);
  } catch (error) {
    rethrowDeleteConflict(
      error,
      'Cannot delete project because related records exist',
    );
  }
};

export const listAdminContracts = async (filters) =>
  mapPaged(await listAdminContractRows(filters), toPublicContract);

export const listAdminSubscriptions = async (filters) =>
  mapPaged(await listAdminSubscriptionRows(filters), toPublicSubscription);

export const getAdminSubscriptionById = async (subscriptionId) => {
  return toPublicSubscription(
    requireResource(
      await findAdminSubscriptionById(subscriptionId),
      'Subscription not found',
    ),
  );
};

export const updateAdminSubscriptionById = async (subscriptionId, payload) => {
  const updated = await updateAdminSubscriptionStatus(
    subscriptionId,
    payload.status,
  );
  return toPublicSubscription(
    requireResource(updated, 'Subscription not found'),
  );
};

export const listAdminPayments = async (filters) =>
  mapPaged(await listAdminPaymentRows(filters), toPublicPayment);

export const listAdminDisputes = async (filters) =>
  mapPaged(await listAdminDisputeRows(filters), toPublicDispute);

export const getAdminDisputeById = async (disputeId) => {
  return toPublicDispute(
    requireResource(await findAdminDisputeById(disputeId), 'Dispute not found'),
  );
};

export const updateAdminDisputeById = async (disputeId, payload) => {
  const updated = await updateAdminDisputeFields(disputeId, payload);
  return toPublicDispute(requireResource(updated, 'Dispute not found'));
};

export const listAdminReviews = async (filters) =>
  mapPaged(await listAdminReviewRows(filters), toPublicReview);

export const getAdminReviewById = async (reviewId) => {
  return toPublicReview(
    requireResource(await findAdminReviewById(reviewId), 'Review not found'),
  );
};

export const deleteAdminReviewById = async (reviewId) => {
  const review = await getAdminReviewById(reviewId);

  try {
    const deleted = await deleteAdminReviewRow(reviewId);
    return toPublicReview(deleted || review);
  } catch (error) {
    rethrowDeleteConflict(
      error,
      'Cannot delete review because related records exist',
    );
  }
};

export const getAdminStats = async () => {
  return getAdminCounts();
};
