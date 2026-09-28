import { AppError } from '../../utils/appError.js';

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

const collectErrors = (errors) => {
  if (errors.length > 0) {
    throw new AppError('Validation failed', 400, errors);
  }
};

const ensureObjectBody = (body) => {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Validation failed', 400, [
      { field: 'body', message: 'Request body must be an object' },
    ]);
  }
};

export const validateAiActionBody = (body = {}) => {
  ensureObjectBody(body);

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
    if (!IDENTITY_FIELDS.includes(field)) {
      errors.push({
        field,
        message: `${field} is not a documented AI request field`,
      });
    }
  }

  collectErrors(errors);

  return {};
};
