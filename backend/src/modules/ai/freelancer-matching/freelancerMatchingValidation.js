import { AppError } from '../../../utils/appError.js';
import { requireEntityId } from '../../../utils/entityId.js';

const IDENTITY_FIELDS = [
  'user_id',
  'client_id',
  'freelancer_id',
  'admin_id',
  'created_by',
  'requested_by',
  'requester_id',
  'approved_by',
  'rejected_by',
];

const ALLOWED_FIELDS = new Set(['project_id']);

export const validateFreelancerMatchingBody = (body = {}) => {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Validation failed', 400, [
      { field: 'body', message: 'Request body must be an object' },
    ]);
  }

  const errors = [];

  for (const field of IDENTITY_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      errors.push({
        field,
        message: `${field} cannot be supplied in the request body`,
      });
    }
  }

  for (const field of Object.keys(body)) {
    if (!ALLOWED_FIELDS.has(field) && !IDENTITY_FIELDS.includes(field)) {
      errors.push({
        field,
        message: `${field} is not a documented AI request field`,
      });
    }
  }

  if (errors.length > 0) {
    throw new AppError('Validation failed', 400, errors);
  }

  const projectId = requireEntityId(
    body.project_id,
    'project_id',
    'Project id is required',
    'Project id is invalid',
  );

  return { project_id: projectId };
};
