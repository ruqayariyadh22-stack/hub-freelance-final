import {
  validateContractIdParam,
  validateCreateScopeChange,
  validateScopeChangeActionBody,
  validateScopeChangeIdParam,
} from './scopeChangesValidation.js';
import {
  approveScopeChangeById,
  createScopeChange,
  listScopeChangesByContract,
  rejectScopeChangeById,
} from './scopeChangesService.js';

export const listByContract = async (req, res) => {
  const contractId = validateContractIdParam(req.params.id);
  const data = await listScopeChangesByContract(contractId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const create = async (req, res) => {
  const contractId = validateContractIdParam(req.params.id);
  const payload = validateCreateScopeChange(req.body);
  const data = await createScopeChange(contractId, req.user, payload);

  res.status(201).json({
    success: true,
    data,
  });
};

export const approveById = async (req, res) => {
  const scopeChangeId = validateScopeChangeIdParam(req.params.id);
  validateScopeChangeActionBody(req.body);
  const data = await approveScopeChangeById(scopeChangeId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const rejectById = async (req, res) => {
  const scopeChangeId = validateScopeChangeIdParam(req.params.id);
  validateScopeChangeActionBody(req.body);
  const data = await rejectScopeChangeById(scopeChangeId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};
