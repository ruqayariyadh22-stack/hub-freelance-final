import {
  validateCreateSpecialty,
  validateSpecialtyIdParam,
} from './specialtiesValidation.js';
import {
  approveSpecialtyById,
  listApprovedSpecialties,
  listPendingSpecialties,
  rejectSpecialtyById,
  requestSpecialty,
} from './specialtiesService.js';

export const create = async (req, res) => {
  const payload = validateCreateSpecialty(req.body);
  const data = await requestSpecialty(req.user, payload);

  res.status(201).json({
    success: true,
    data,
  });
};

export const listApproved = async (req, res) => {
  const data = await listApprovedSpecialties();

  res.status(200).json({
    success: true,
    data,
  });
};

export const listPending = async (req, res) => {
  const data = await listPendingSpecialties(req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const approveById = async (req, res) => {
  const specialtyId = validateSpecialtyIdParam(req.params.id);
  const data = await approveSpecialtyById(specialtyId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const rejectById = async (req, res) => {
  const specialtyId = validateSpecialtyIdParam(req.params.id);
  const data = await rejectSpecialtyById(specialtyId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};
