import { AppError } from '../../utils/appError.js';
import { requireEntityId } from '../../utils/entityId.js';

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

export const validateClientIdParam = (id) => {
  return requireEntityId(
    id,
    'id',
    'Client id is required',
    'Client id must be a valid integer',
  );
};

export const validateUpdateClient = (body = {}) => {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Validation failed', 400, [
      { field: 'body', message: 'Request body must be an object' },
    ]);
  }

  const errors = [];
  const payload = {};

  if (Object.prototype.hasOwnProperty.call(body, 'company_name')) {
    if (body.company_name === null) {
      payload.company_name = null;
    } else {
      payload.company_name = asTrimmedString(body.company_name) || null;
    }
  }

  for (const field of ['logo', 'bio', 'location', 'website']) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      if (body[field] === null) {
        payload[field] = null;
      } else if (typeof body[field] !== 'string') {
        errors.push({ field, message: `${field} must be a string` });
      } else {
        payload[field] = asTrimmedString(body[field]) || null;
      }
    }
  }

  if (payload.website && !/^https?:\/\//i.test(payload.website)) {
    errors.push({ field: 'website', message: 'Website must start with http:// or https://' });
  }

  if (payload.bio && payload.bio.length > 2000) {
    errors.push({ field: 'bio', message: 'Bio must be at most 2000 characters' });
  }

  if (Object.keys(payload).length === 0 && errors.length === 0) {
    errors.push({
      field: 'body',
      message: 'At least one of company_name, logo, bio, location or website is required',
    });
  }

  collectErrors(errors);

  return payload;
};
