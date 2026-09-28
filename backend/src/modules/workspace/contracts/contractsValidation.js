import { AppError } from '../../../utils/appError.js';
import { requireEntityId } from '../../../utils/entityId.js';

const CONTRACT_STATUSES = ['in_progress', 'delivered', 'completed'];
const OWNERSHIP_FIELDS = [
  'user_id',
  'client_id',
  'freelancer_id',
  'project_id',
];

const asTrimmedString = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

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

export const validateContractIdParam = (id) => {
  return requireEntityId(
    id,
    'id',
    'Contract id is required',
    'Contract id must be a valid integer',
  );
};

export const validateUpdateContractStatus = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];

  for (const field of OWNERSHIP_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      errors.push({
        field,
        message: `${field} cannot be supplied in the request body`,
      });
    }
  }

  for (const field of Object.keys(body)) {
    if (field !== 'status' && !OWNERSHIP_FIELDS.includes(field)) {
      errors.push({
        field,
        message: 'Only status can be updated on this endpoint',
      });
    }
  }

  if (!Object.prototype.hasOwnProperty.call(body, 'status')) {
    errors.push({ field: 'status', message: 'Status is required' });
  } else if (typeof body.status !== 'string' || !body.status.trim()) {
    errors.push({ field: 'status', message: 'Status must be a string' });
  } else if (!CONTRACT_STATUSES.includes(body.status.trim())) {
    errors.push({
      field: 'status',
      message: 'Status must be in_progress, delivered, or completed',
    });
  }

  collectErrors(errors);

  return {
    status: asTrimmedString(body.status),
  };
};
