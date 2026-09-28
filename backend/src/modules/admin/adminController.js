import {
  validateAdminActionBody,
  validateAdminDisputePatch,
  validateAdminIdParam,
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
  listAdminPayments,
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

export const getUserById = async (req, res) => {
  const userId = validateAdminIdParam(req.params.id, 'id');
  const data = await getAdminUserById(userId, req.user);
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
  const data = await deleteAdminUserById(userId, req.user);
  sendData(res, data);
};

export const getServiceById = async (req, res) => {
  const serviceId = validateAdminIdParam(req.params.id, 'id');
  const data = await getAdminServiceById(serviceId, req.user);
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
  const data = await deleteAdminServiceById(serviceId, req.user);
  sendData(res, data);
};

export const getProjectById = async (req, res) => {
  const projectId = validateAdminIdParam(req.params.id, 'id');
  const data = await getAdminProjectById(projectId, req.user);
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
  const data = await deleteAdminProjectById(projectId, req.user);
  sendData(res, data);
};

export const listContracts = async (req, res) => {
  const data = await listAdminContracts(req.user);
  sendData(res, data);
};

export const getSubscriptionById = async (req, res) => {
  const subscriptionId = validateAdminIdParam(req.params.id, 'id');
  const data = await getAdminSubscriptionById(subscriptionId, req.user);
  sendData(res, data);
};

export const updateSubscriptionById = async (req, res) => {
  const subscriptionId = validateAdminIdParam(req.params.id, 'id');
  const payload = validateAdminSubscriptionPatch(req.body);
  const data = await updateAdminSubscriptionById(subscriptionId, payload);
  sendData(res, data);
};

export const listPayments = async (req, res) => {
  const data = await listAdminPayments(req.user);
  sendData(res, data);
};

export const getDisputeById = async (req, res) => {
  const disputeId = validateAdminIdParam(req.params.id, 'id');
  const data = await getAdminDisputeById(disputeId, req.user);
  sendData(res, data);
};

export const updateDisputeById = async (req, res) => {
  const disputeId = validateAdminIdParam(req.params.id, 'id');
  const payload = validateAdminDisputePatch(req.body);
  const data = await updateAdminDisputeById(disputeId, payload);
  sendData(res, data);
};

export const getReviewById = async (req, res) => {
  const reviewId = validateAdminIdParam(req.params.id, 'id');
  const data = await getAdminReviewById(reviewId, req.user);
  sendData(res, data);
};

export const deleteReviewById = async (req, res) => {
  const reviewId = validateAdminIdParam(req.params.id, 'id');
  validateAdminActionBody(req.body);
  const data = await deleteAdminReviewById(reviewId, req.user);
  sendData(res, data);
};

export const getStats = async (req, res) => {
  const data = await getAdminStats(req.user);
  sendData(res, data);
};
