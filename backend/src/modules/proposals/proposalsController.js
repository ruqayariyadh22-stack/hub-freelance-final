import {
  validateCreateProposal,
  validateFreelancerIdParam,
  validateProjectIdParam,
  validateProposalIdParam,
  validateUpdateProposal,
} from './proposalsValidation.js';
import {
  acceptProposalById,
  createProposal,
  listFreelancerProposals,
  listProjectProposals,
  rejectProposalById,
  updateProposalById,
} from './proposalsService.js';

export const create = async (req, res) => {
  const projectId = validateProjectIdParam(req.params.id);
  const payload = validateCreateProposal(req.body);
  const data = await createProposal(projectId, req.user, payload);

  res.status(201).json({
    success: true,
    data,
  });
};

export const listForProject = async (req, res) => {
  const projectId = validateProjectIdParam(req.params.id);
  const data = await listProjectProposals(projectId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const listForFreelancer = async (req, res) => {
  const freelancerId = validateFreelancerIdParam(req.params.id);
  const data = await listFreelancerProposals(freelancerId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const updateById = async (req, res) => {
  const proposalId = validateProposalIdParam(req.params.id);
  const payload = validateUpdateProposal(req.body);
  const data = await updateProposalById(proposalId, req.user, payload);

  res.status(200).json({
    success: true,
    data,
  });
};

export const acceptById = async (req, res) => {
  const proposalId = validateProposalIdParam(req.params.id);
  const data = await acceptProposalById(proposalId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const rejectById = async (req, res) => {
  const proposalId = validateProposalIdParam(req.params.id);
  const data = await rejectProposalById(proposalId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};
