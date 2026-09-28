import { AppError } from '../../utils/appError.js';

const IDENTITY_FIELDS = {
  user_id: 'User id cannot be supplied in the request body',
  freelancer_id: 'Freelancer id cannot be supplied in the request body',
  client_id: 'Client id cannot be supplied in the request body',
  subscription_id: 'Subscription id cannot be supplied in the request body',
  admin_id: 'Admin id cannot be supplied in the request body',
  created_by: 'created_by cannot be supplied in the request body',
  requested_by: 'requested_by cannot be supplied in the request body',
};

const SERVER_OWNED_FIELDS = {
  plan_type: 'Plan type cannot be supplied in the request body',
  price: 'Price cannot be supplied in the request body',
  status: 'Status cannot be supplied in the request body',
  payment_status: 'Payment status cannot be supplied in the request body',
  start_date: 'start_date cannot be supplied in the request body',
  end_date: 'end_date cannot be supplied in the request body',
  cancel_at_period_end:
    'cancel_at_period_end cannot be supplied in the request body',
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

export const validateSubscribeBody = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];

  for (const [field, message] of Object.entries({
    ...IDENTITY_FIELDS,
    ...SERVER_OWNED_FIELDS,
  })) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      errors.push({ field, message });
    }
  }

  for (const field of Object.keys(body)) {
    if (!IDENTITY_FIELDS[field] && !SERVER_OWNED_FIELDS[field]) {
      errors.push({
        field,
        message: `${field} is not a documented subscription request field`,
      });
    }
  }

  collectErrors(errors);

  return {};
};

export const validateLifecycleBody = (body = {}) => {
  return validateSubscribeBody(body);
};
