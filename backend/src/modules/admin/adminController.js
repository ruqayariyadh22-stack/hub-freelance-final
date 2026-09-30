import {
  validateAdminActionBody,
  validateAdminDisputePatch,
  validateAdminIdParam,
  validateAdminListQuery,
  validateAdminProjectPatch,
  validateAdminServicePatch,
  validateAdminSubscriptionPatch,
  validateAdminUserPatch,
} from './adminValidation.js';
import {
  deleteAdminProjectById,
  deleteAdminReviewById,
  deleteAdminServiceById,
  deleteAdminUserById,
  getAdminDisputeById,
  getAdminProjectById,
  getAdminReviewById,
  getAdminServiceById,
  getAdminStats,
  getAdminSubscriptionById,
  getAdminUserById,
  listAdminContracts,
  listAdminDisputes,
  listAdminPayments,
  listAdminProjects,
  listAdminReviews,
  listAdminServices,
  listAdminSubscriptions,
  listAdminUsers,
  updateAdminDisputeById,
  updateAdminProjectById,
  updateAdminServiceById,
  updateAdminSubscriptionById,
  updateAdminUserById,
} from './adminService.js';

const sendData = (res, data, status = 200) => {
  res.status(status).json({
    success: true,
    data,
  });
};

export const listUsers = async (req, res) => {
  const filters = validateAdminListQuery(req.query);
  const data = await listAdminUsers(filters);
  sendData(res, data);
};

export const getUserById = async (req, res) => {
  const userId = validateAdminIdParam(req.params.id, 'id');
  const data = await getAdminUserById(userId);
  sendData(res, data);
};

export const updateUserById = async (req, res) => {
  const userId = validateAdminIdParam(req.params.id, 'id');
  const payload = validateAdminUserPatch(req.body);
  const data = await updateAdminUserById(userId, payload);
  sendData(res, data);
};

export const deleteUserById = async (req, res) => {
  const userId = validateAdminIdParam(req.params.id, 'id');
  validateAdminActionBody(req.body);
  const data = await deleteAdminUserById(userId);
  sendData(res, data);
};

export const listServices = async (req, res) => {
  const filters = validateAdminListQuery(req.query);
  const data = await listAdminServices(filters);
  sendData(res, data);
};

export const getServiceById = async (req, res) => {
  const serviceId = validateAdminIdParam(req.params.id, 'id');
  const data = await getAdminServiceById(serviceId);
  sendData(res, data);
};

export const updateServiceById = async (req, res) => {
  const serviceId = validateAdminIdParam(req.params.id, 'id');
  const payload = validateAdminServicePatch(req.body);
  const data = await updateAdminServiceById(serviceId, payload);
  sendData(res, data);
};

export const deleteServiceById = async (req, res) => {
  const serviceId = validateAdminIdParam(req.params.id, 'id');
  validateAdminActionBody(req.body);
  const data = await deleteAdminServiceById(serviceId);
  sendData(res, data);
};

export const listProjects = async (req, res) => {
  const filters = validateAdminListQuery(req.query);
  const data = await listAdminProjects(filters);
  sendData(res, data);
};

export const getProjectById = async (req, res) => {
  const projectId = validateAdminIdParam(req.params.id, 'id');
  const data = await getAdminProjectById(projectId);
  sendData(res, data);
};

export const updateProjectById = async (req, res) => {
  const projectId = validateAdminIdParam(req.params.id, 'id');
  const payload = validateAdminProjectPatch(req.body);
  const data = await updateAdminProjectById(projectId, payload);
  sendData(res, data);
};

export const deleteProjectById = async (req, res) => {
  const projectId = validateAdminIdParam(req.params.id, 'id');
  validateAdminActionBody(req.body);
  const data = await deleteAdminProjectById(projectId);
  sendData(res, data);
};

export const listContracts = async (req, res) => {
  const filters = validateAdminListQuery(req.query);
  const data = await listAdminContracts(filters);
  sendData(res, data);
};

export const listSubscriptions = async (req, res) => {
  const filters = validateAdminListQuery(req.query);
  const data = await listAdminSubscriptions(filters);
  sendData(res, data);
};

export const getSubscriptionById = async (req, res) => {
  const subscriptionId = validateAdminIdParam(req.params.id, 'id');
  const data = await getAdminSubscriptionById(subscriptionId);
  sendData(res, data);
};

export const updateSubscriptionById = async (req, res) => {
  const subscriptionId = validateAdminIdParam(req.params.id, 'id');
  const payload = validateAdminSubscriptionPatch(req.body);
  const data = await updateAdminSubscriptionById(subscriptionId, payload);
  sendData(res, data);
};

export const listPayments = async (req, res) => {
  const filters = validateAdminListQuery(req.query);
  const data = await listAdminPayments(filters);
  sendData(res, data);
};

export const listDisputes = async (req, res) => {
  const filters = validateAdminListQuery(req.query);
  const data = await listAdminDisputes(filters);
  sendData(res, data);
};

export const getDisputeById = async (req, res) => {
  const disputeId = validateAdminIdParam(req.params.id, 'id');
  const data = await getAdminDisputeById(disputeId);
  sendData(res, data);
};

export const updateDisputeById = async (req, res) => {
  const disputeId = validateAdminIdParam(req.params.id, 'id');
  const payload = validateAdminDisputePatch(req.body);
  const data = await updateAdminDisputeById(disputeId, payload);
  sendData(res, data);
};

export const listReviews = async (req, res) => {
  const filters = validateAdminListQuery(req.query);
  const data = await listAdminReviews(filters);
  sendData(res, data);
};

export const getReviewById = async (req, res) => {
  const reviewId = validateAdminIdParam(req.params.id, 'id');
  const data = await getAdminReviewById(reviewId);
  sendData(res, data);
};

export const deleteReviewById = async (req, res) => {
  const reviewId = validateAdminIdParam(req.params.id, 'id');
  validateAdminActionBody(req.body);
  const data = await deleteAdminReviewById(reviewId);
  sendData(res, data);
};

export const getStats = async (req, res) => {
  const data = await getAdminStats();
  sendData(res, data);
};
