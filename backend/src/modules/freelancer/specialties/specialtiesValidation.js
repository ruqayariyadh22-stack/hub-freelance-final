import { AppError } from '../../../utils/appError.js';
import { requireEntityId } from '../../../utils/entityId.js';

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

export const validateSpecialtyIdParam = (id) => {
  return requireEntityId(
    id,
    'id',
    'Specialty id is required',
    'Specialty id must be a valid integer',
  );
};

export const validateCreateSpecialty = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  const payload = {};

  if (Object.prototype.hasOwnProperty.call(body, 'status')) {
    errors.push({
      field: 'status',
      message: 'Status cannot be set by the requester',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'user_id')) {
    errors.push({
      field: 'user_id',
      message: 'User id cannot be supplied in the request body',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'freelancer_id')) {
    errors.push({
      field: 'freelancer_id',
      message: 'Freelancer id cannot be supplied in the request body',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'requested_by')) {
    errors.push({
      field: 'requested_by',
      message: 'Requester identity cannot be supplied in the request body',
    });
  }

  const name = asTrimmedString(body.name);

  if (!name) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else {
    payload.name = name;
  }

  collectErrors(errors);

  return payload;
};
