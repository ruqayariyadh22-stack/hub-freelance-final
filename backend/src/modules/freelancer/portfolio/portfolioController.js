import {
  validateAddPortfolioItem,
  validateFreelancerIdParam,
  validatePortfolioIdParam,
  validateUpdatePortfolioItem,
} from './portfolioValidation.js';
import {
  addFreelancerPortfolioItem,
  deleteFreelancerPortfolioItem,
  listFreelancerPortfolioItems,
  updateFreelancerPortfolioItem,
} from './portfolioService.js';

export const listByFreelancer = async (req, res) => {
  const freelancerId = validateFreelancerIdParam(req.params.id);
  const data = await listFreelancerPortfolioItems(freelancerId);

  res.status(200).json({
    success: true,
    data,
  });
};

export const addItem = async (req, res) => {
  const freelancerId = validateFreelancerIdParam(req.params.id);
  const payload = validateAddPortfolioItem(req.body);
  const data = await addFreelancerPortfolioItem(
    freelancerId,
    req.user,
    payload,
  );

  res.status(201).json({
    success: true,
    data,
  });
};

export const updateById = async (req, res) => {
  const freelancerId = validateFreelancerIdParam(req.params.id);
  const portfolioId = validatePortfolioIdParam(req.params.portfolioId);
  const payload = validateUpdatePortfolioItem(req.body);
  const data = await updateFreelancerPortfolioItem(
    freelancerId,
    portfolioId,
    req.user,
    payload,
  );

  res.status(200).json({
    success: true,
    data,
  });
};

export const removeById = async (req, res) => {
  const freelancerId = validateFreelancerIdParam(req.params.id);
  const portfolioId = validatePortfolioIdParam(req.params.portfolioId);
  const data = await deleteFreelancerPortfolioItem(
    freelancerId,
    portfolioId,
    req.user,
  );

  res.status(200).json({
    success: true,
    data,
  });
};
