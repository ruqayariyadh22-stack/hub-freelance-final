import { AppError } from '../../utils/appError.js';
import { requireEntityId } from '../../utils/entityId.js';

const IDENTITY_FIELDS = [
  'user_id',
  'role',
  'owner_id',
  'admin_id',
  'created_by',
  'client_id',
  'freelancer_id',
  'reported_by',
  'reported_against',
  'project_id',
  'chosen_freelancer_id',
  'password',
  'password_hash',
];

const USER_ACCOUNT_STATUSES = ['active', 'disabled'];
const SERVICE_STATUSES = ['active', 'hidden'];
const PROJECT_STATUSES = [
  'draft',
  'open',
  'pending_approval',
  'in_progress',
  'completed',
  'cancelled',
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

const rejectUnknownFields = (body, allowedFields, errors) => {
  for (const field of Object.keys(body)) {
    if (!allowedFields.includes(field) && !IDENTITY_FIELDS.includes(field)) {
      errors.push({
        field,
        message: `${field} is not a documented admin request field`,
      });
    }
  }
};

const readRequiredStatus = (value, allowedStatuses, message, errors) => {
  if (typeof value !== 'string') {
    errors.push({
      field: 'status',
      message,
    });
    return undefined;
  }

  const status = asTrimmedString(value);

  if (!status || (allowedStatuses && !allowedStatuses.includes(status))) {
    errors.push({
      field: 'status',
      message,
    });
    return undefined;
  }

  return status;
};

const readOptionalNonEmptyString = (body, field, message, errors) => {
  if (!Object.prototype.hasOwnProperty.call(body, field)) {
    return undefined;
  }

  if (typeof body[field] !== 'string') {
    errors.push({ field, message });
    return undefined;
  }

  const value = asTrimmedString(body[field]);

  if (!value) {
    errors.push({ field, message });
    return undefined;
  }

  return value;
};

const validateStatusOnlyPatch = (body, { allowedStatuses, statusMessage }) => {
  ensureObjectBody(body);

  const errors = [];
  rejectIdentityFields(body, errors);
  rejectUnknownFields(body, ['status'], errors);

  const payload = {};

  if (Object.prototype.hasOwnProperty.call(body, 'status')) {
    const status = readRequiredStatus(
      body.status,
      allowedStatuses,
      statusMessage,
      errors,
    );

    if (status !== undefined) {
      payload.status = status;
    }
  }

  if (Object.keys(payload).length === 0 && errors.length === 0) {
    errors.push({
      field: 'body',
      message: 'status is required',
    });
  }

  collectErrors(errors);

  return payload;
};

export const validateAdminIdParam = (id, field = 'id') => {
  return requireEntityId(
    id,
    field,
    `${field} is required`,
    `${field} must be a valid integer`,
  );
};

export const validateAdminActionBody = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  rejectIdentityFields(body, errors);

  for (const field of Object.keys(body)) {
    if (!IDENTITY_FIELDS.includes(field)) {
      errors.push({
        field,
        message: `${field} is not a documented admin request field`,
      });
    }
  }

  collectErrors(errors);

  return {};
};

export const validateAdminUserPatch = (body = {}) => {
  return validateStatusOnlyPatch(body, {
    allowedStatuses: USER_ACCOUNT_STATUSES,
    statusMessage: 'Status must be active or disabled',
  });
};

export const validateAdminServicePatch = (body = {}) => {
  return validateStatusOnlyPatch(body, {
    allowedStatuses: SERVICE_STATUSES,
    statusMessage: 'Status must be active or hidden',
  });
};

export const validateAdminProjectPatch = (body = {}) => {
  return validateStatusOnlyPatch(body, {
    allowedStatuses: PROJECT_STATUSES,
    statusMessage:
      'Status must be draft, open, pending_approval, in_progress, completed, or cancelled',
  });
};

export const validateAdminSubscriptionPatch = (body = {}) => {
  return validateStatusOnlyPatch(body, {
    allowedStatuses: ['active', 'expired', 'cancelled'],
    statusMessage: 'Status must be active, expired, or cancelled',
  });
};

export const validateAdminListQuery = (query = {}) => {
  const page = Number(query.page);
  const limit = Number(query.limit);

  return {
    page: Number.isFinite(page) && page >= 1 ? Math.trunc(page) : 1,
    limit: Number.isFinite(limit) && limit >= 1 ? Math.min(Math.trunc(limit), 100) : 20,
    search: typeof query.search === 'string' ? query.search.trim() : '',
    status: typeof query.status === 'string' ? query.status.trim() : '',
    role: typeof query.role === 'string' ? query.role.trim() : '',
    plan: typeof query.plan === 'string' ? query.plan.trim() : '',
    type: typeof query.type === 'string' ? query.type.trim() : '',
  };
};

export const validateAdminDisputePatch = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  rejectIdentityFields(body, errors);
  rejectUnknownFields(body, ['status', 'action_taken'], errors);

  const payload = {};
  const status = readOptionalNonEmptyString(
    body,
    'status',
    'Status must be a non-empty string',
    errors,
  );
  const actionTaken = readOptionalNonEmptyString(
    body,
    'action_taken',
    'action_taken must be a non-empty string',
    errors,
  );

  if (status !== undefined) {
    payload.status = status;
  }

  if (actionTaken !== undefined) {
    payload.action_taken = actionTaken;
  }

  if (Object.keys(payload).length === 0 && errors.length === 0) {
    errors.push({
      field: 'body',
      message: 'At least one of status or action_taken is required',
    });
  }

  collectErrors(errors);

  return payload;
};
