import {
  validateCreateService,
  validateFeatureServiceBody,
  validateFreelancerIdParam,
  validateServiceIdParam,
  validateUpdateService,
} from './servicesValidation.js';
import {
  createService,
  deleteServiceById,
  featureServiceById,
  listFreelancerServices,
  unfeatureServiceById,
  updateServiceById,
} from './servicesService.js';

export const listByFreelancer = async (req, res) => {
  const freelancerId = validateFreelancerIdParam(req.params.id);
  const data = await listFreelancerServices(freelancerId);

  res.status(200).json({
    success: true,
    data,
  });
};

export const create = async (req, res) => {
  const payload = validateCreateService(req.body);
  const data = await createService(req.user, payload);

  res.status(201).json({
    success: true,
    data,
  });
};

export const updateById = async (req, res) => {
  const serviceId = validateServiceIdParam(req.params.id);
  const payload = validateUpdateService(req.body);
  const data = await updateServiceById(serviceId, req.user, payload);

  res.status(200).json({
    success: true,
    data,
  });
};

export const removeById = async (req, res) => {
  const serviceId = validateServiceIdParam(req.params.id);
  const data = await deleteServiceById(serviceId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const featureById = async (req, res) => {
  const serviceId = validateServiceIdParam(req.params.id);
  validateFeatureServiceBody(req.body);
  const data = await featureServiceById(serviceId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const unfeatureById = async (req, res) => {
  const serviceId = validateServiceIdParam(req.params.id);
  validateFeatureServiceBody(req.body);
  const data = await unfeatureServiceById(serviceId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};
