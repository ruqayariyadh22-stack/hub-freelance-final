import {
  validateFreelancerIdParam,
  validateUpdateFreelancer,
} from './freelancerValidation.js';
import {
  getFreelancerById,
  listFreelancers,
  updateFreelancerById,
} from './freelancerService.js';

export const list = async (req, res) => {
  const data = await listFreelancers(req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const getById = async (req, res) => {
  const freelancerId = validateFreelancerIdParam(req.params.id);
  const data = await getFreelancerById(freelancerId);

  res.status(200).json({
    success: true,
    data,
  });
};

export const updateById = async (req, res) => {
  const freelancerId = validateFreelancerIdParam(req.params.id);
  const payload = validateUpdateFreelancer(req.body);
  const data = await updateFreelancerById(freelancerId, req.user, payload);

  res.status(200).json({
    success: true,
    data,
  });
};
