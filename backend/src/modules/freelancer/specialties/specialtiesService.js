import { AppError } from '../../../utils/appError.js';
import {
  findSpecialtyById,
  insertSpecialty,
  listSpecialtiesByStatus,
  updateSpecialtyReview,
} from './specialtiesPersistence.js';

const toPublicSpecialty = (specialty) => ({
  id: specialty.id,
  name: specialty.name,
  status: specialty.status,
  requested_by: specialty.requested_by,
  reviewed_by: specialty.reviewed_by,
  reviewed_at: specialty.reviewed_at,
  created_at: specialty.created_at,
});

const requireSpecialty = (specialty) => {
  if (!specialty) {
    throw new AppError('Specialty not found', 404);
  }

  return toPublicSpecialty(specialty);
};

export const requestSpecialty = async (actor, payload) => {
  const specialty = await insertSpecialty({
    name: payload.name,
    requestedBy: actor.id,
  });

  return toPublicSpecialty(specialty);
};

export const listApprovedSpecialties = async () => {
  const specialties = await listSpecialtiesByStatus('approved');
  return specialties.map(toPublicSpecialty);
};

export const listPendingSpecialties = async (actor) => {
  const specialties = await listSpecialtiesByStatus('pending');
  return specialties.map(toPublicSpecialty);
};

export const approveSpecialtyById = async (specialtyId, actor) => {
  const existing = await findSpecialtyById(specialtyId);
  requireSpecialty(existing);

  const updated = await updateSpecialtyReview(specialtyId, {
    status: 'approved',
    reviewedBy: actor.id,
  });

  return requireSpecialty(updated);
};

export const rejectSpecialtyById = async (specialtyId, actor) => {
  const existing = await findSpecialtyById(specialtyId);
  requireSpecialty(existing);

  const updated = await updateSpecialtyReview(specialtyId, {
    status: 'rejected',
    reviewedBy: actor.id,
  });

  return requireSpecialty(updated);
};
