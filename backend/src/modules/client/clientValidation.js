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

  if (Object.prototype.hasOwnProperty.call(body, 'logo')) {
    if (body.logo === null) {
      payload.logo = null;
    } else {
      payload.logo = asTrimmedString(body.logo) || null;
    }
  }

  if (Object.keys(payload).length === 0) {
    errors.push({
      field: 'body',
      message: 'At least one of company_name or logo is required',
    });
  }

  collectErrors(errors);

  return payload;
};
