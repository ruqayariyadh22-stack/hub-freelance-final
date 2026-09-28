import { AppError } from '../../../utils/appError.js';
import { requireEntityId } from '../../../utils/entityId.js';

const FORBIDDEN_BODY_FIELDS = {
  user_id: 'User id cannot be supplied in the request body',
  freelancer_id: 'Freelancer id cannot be supplied in the request body',
  subscription_id: 'Subscription id cannot be supplied in the request body',
  ads_used: 'ads_used cannot be supplied in the request body',
  period_start: 'period_start cannot be supplied in the request body',
  created_at: 'created_at cannot be supplied in the request body',
  id: 'Advertisement id cannot be supplied in the request body',
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

export const validateCreateAdvertisement = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];

  for (const [field, message] of Object.entries(FORBIDDEN_BODY_FIELDS)) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      errors.push({ field, message });
    }
  }

  for (const field of Object.keys(body)) {
    if (field !== 'service_id' && !FORBIDDEN_BODY_FIELDS[field]) {
      errors.push({
        field,
        message: `${field} is not a documented advertisement request field`,
      });
    }
  }

  if (!Object.prototype.hasOwnProperty.call(body, 'service_id')) {
    errors.push({
      field: 'service_id',
      message: 'Service id is required',
    });
    collectErrors(errors);
  }

  collectErrors(errors);

  return {
    service_id: requireEntityId(
      body.service_id,
      'service_id',
      'Service id is required',
      'Service id must be a valid integer',
    ),
  };
};
