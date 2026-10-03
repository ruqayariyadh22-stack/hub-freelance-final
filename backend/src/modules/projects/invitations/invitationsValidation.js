import { AppError } from '../../../utils/appError.js';
import { requireEntityId } from '../../../utils/entityId.js';

export const validateProjectIdParam = (id) =>
  requireEntityId(id, 'id', 'Project id is required', 'Project id must be a valid integer');

export const validateInvitationIdParam = (id) =>
  requireEntityId(
    id,
    'id',
    'Invitation id is required',
    'Invitation id must be a valid integer',
  );

export const validateCreateInvitation = (body = {}) => {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Validation failed', 400, [
      { field: 'body', message: 'Request body must be an object' },
    ]);
  }

  return {
    freelancerId: requireEntityId(
      body.freelancer_id,
      'freelancer_id',
      'freelancer_id is required',
      'freelancer_id must be a valid integer',
    ),
  };
};
