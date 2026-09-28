import {
  validateContractIdParam,
  validateCreateReview,
  validateFreelancerIdParam,
} from './reviewsValidation.js';
import {
  createContractReview,
  listFreelancerReviews,
} from './reviewsService.js';

export const create = async (req, res) => {
  const contractId = validateContractIdParam(req.params.id);
  const payload = validateCreateReview(req.body);
  const data = await createContractReview(contractId, req.user, payload);

  res.status(201).json({
    success: true,
    data,
  });
};

export const listByFreelancer = async (req, res) => {
  const freelancerId = validateFreelancerIdParam(req.params.id);
  const data = await listFreelancerReviews(freelancerId);

  res.status(200).json({
    success: true,
    data,
  });
};
