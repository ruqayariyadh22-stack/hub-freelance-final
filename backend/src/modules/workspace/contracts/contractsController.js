import {
  validateContractIdParam,
  validateUpdateContractStatus,
} from './contractsValidation.js';
import {
  getContractById,
  updateContractStatusById,
} from './contractsService.js';

export const getById = async (req, res) => {
  const contractId = validateContractIdParam(req.params.id);
  const data = await getContractById(contractId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const updateStatusById = async (req, res) => {
  const contractId = validateContractIdParam(req.params.id);
  const payload = validateUpdateContractStatus(req.body);
  const data = await updateContractStatusById(contractId, req.user, payload);

  res.status(200).json({
    success: true,
    data,
  });
};
