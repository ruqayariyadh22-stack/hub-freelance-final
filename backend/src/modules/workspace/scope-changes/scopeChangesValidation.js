import { AppError } from '../../../utils/appError.js';
import { requireEntityId } from '../../../utils/entityId.js';

const SCOPE_CHANGE_FIELDS = [
  'description',
  'price_adjustment',
  'duration_adjustment',
];
const IDENTITY_FIELDS = [
  'user_id',
  'client_id',
  'freelancer_id',
  'contract_id',
  'project_id',
  'requested_by',
  'requester_id',
  'created_by',
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

const rejectIdentityFields = (body, errors) => {
  for (const field of IDENTITY_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      errors.push({
        field,
        message: `${field} cannot be supplied in the request body`,
      });
    }
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

export const validateScopeChangeIdParam = (id) => {
  return requireEntityId(
    id,
    'id',
    'Scope change id is required',
    'Scope change id must be a valid integer',
  );
};

export const validateCreateScopeChange = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  rejectIdentityFields(body, errors);

  if (Object.prototype.hasOwnProperty.call(body, 'status')) {
    errors.push({
      field: 'status',
      message: 'Status cannot be set by the requester',
    });
  }

  const payload = {};

  if (Object.prototype.hasOwnProperty.call(body, 'description')) {
    if (typeof body.description !== 'string') {
      errors.push({
        field: 'description',
        message: 'Description must be a string',
      });
    } else {
      payload.description = body.description.trim() || null;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'price_adjustment')) {
    const amount = Number(body.price_adjustment);

    if (body.price_adjustment === '' || Number.isNaN(amount)) {
      errors.push({
        field: 'price_adjustment',
        message: 'Price adjustment must be a number',
      });
    } else {
      payload.price_adjustment = amount;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'duration_adjustment')) {
    const days = Number(body.duration_adjustment);

    if (!Number.isInteger(days)) {
      errors.push({
        field: 'duration_adjustment',
        message: 'Duration adjustment must be an integer',
      });
    } else {
      payload.duration_adjustment = days;
    }
  }

  for (const field of Object.keys(body)) {
    if (
      !SCOPE_CHANGE_FIELDS.includes(field) &&
      !IDENTITY_FIELDS.includes(field) &&
      field !== 'status'
    ) {
      errors.push({
        field,
        message: `${field} is not a documented scope change field`,
      });
    }
  }

  if (Object.keys(payload).length === 0 && errors.length === 0) {
    errors.push({
      field: 'body',
      message:
        'At least one of description, price_adjustment, or duration_adjustment is required',
    });
  }

  collectErrors(errors);

  return payload;
};

export const validateScopeChangeActionBody = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  rejectIdentityFields(body, errors);

  if (Object.prototype.hasOwnProperty.call(body, 'status')) {
    errors.push({
      field: 'status',
      message: 'Status is set by the approve or reject action',
    });
  }

  for (const field of Object.keys(body)) {
    if (!IDENTITY_FIELDS.includes(field) && field !== 'status') {
      errors.push({
        field,
        message: `${field} is not a documented scope change action field`,
      });
    }
  }

  collectErrors(errors);

  return {};
};
