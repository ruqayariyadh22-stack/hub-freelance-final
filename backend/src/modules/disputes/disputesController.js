import {
  validateCreateDispute,
  validateDisputeIdParam,
} from './disputesValidation.js';
import { createDispute, getDisputeById } from './disputesService.js';

export const create = async (req, res) => {
  const payload = validateCreateDispute(req.body);
  const data = await createDispute(req.user, payload);

  res.status(201).json({
    success: true,
    data,
  });
};

export const getById = async (req, res) => {
  const disputeId = validateDisputeIdParam(req.params.id);
  const data = await getDisputeById(disputeId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};
