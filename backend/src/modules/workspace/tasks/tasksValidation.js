import { AppError } from '../../../utils/appError.js';
import { requireEntityId } from '../../../utils/entityId.js';

const TASK_FIELDS = ['title', 'description', 'status', 'due_date'];
const IDENTITY_FIELDS = [
  'user_id',
  'client_id',
  'freelancer_id',
  'contract_id',
  'assigned_to',
  'assigned_by',
  'created_by',
  'requested_by',
];

const TASK_STATUSES = ['todo', 'in_progress', 'completed'];
const TASK_STATUS_ALIASES = { done: 'completed', complete: 'completed', 'in-progress': 'in_progress' };

const normalizeTaskStatus = (value) => {
  const status = value.trim().toLowerCase();
  return TASK_STATUS_ALIASES[status] || status;
};

const pushInvalidStatus = (errors) => {
  errors.push({
    field: 'status',
    message: `Status must be one of: ${TASK_STATUSES.join(', ')}`,
  });
};

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

export const validateContractIdParam = (id) => {
  return requireEntityId(
    id,
    'id',
    'Contract id is required',
    'Contract id must be a valid integer',
  );
};

export const validateTaskIdParam = (id) => {
  return requireEntityId(
    id,
    'id',
    'Task id is required',
    'Task id must be a valid integer',
  );
};

export const validateCreateTask = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  rejectIdentityFields(body, errors);

  const payload = {};

  if (Object.prototype.hasOwnProperty.call(body, 'title')) {
    if (typeof body.title !== 'string') {
      errors.push({ field: 'title', message: 'Title must be a string' });
    } else {
      payload.title = body.title.trim() || null;
    }
  }

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

  if (Object.prototype.hasOwnProperty.call(body, 'status')) {
    if (typeof body.status !== 'string' || !body.status.trim()) {
      errors.push({ field: 'status', message: 'Status must be a string' });
    } else if (!TASK_STATUSES.includes(normalizeTaskStatus(body.status))) {
      pushInvalidStatus(errors);
    } else {
      payload.status = normalizeTaskStatus(body.status);
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'due_date')) {
    if (typeof body.due_date !== 'string' || !body.due_date.trim()) {
      errors.push({ field: 'due_date', message: 'Due date must be a string' });
    } else {
      payload.due_date = body.due_date.trim();
    }
  }

  for (const field of Object.keys(body)) {
    if (!TASK_FIELDS.includes(field) && !IDENTITY_FIELDS.includes(field)) {
      errors.push({
        field,
        message: `${field} is not a documented task field`,
      });
    }
  }

  if (Object.keys(payload).length === 0 && errors.length === 0) {
    errors.push({
      field: 'body',
      message: 'At least one of title, description, status, or due_date is required',
    });
  }

  collectErrors(errors);

  return payload;
};

export const validateUpdateTaskStatus = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  rejectIdentityFields(body, errors);

  for (const field of Object.keys(body)) {
    if (field !== 'status' && !IDENTITY_FIELDS.includes(field)) {
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
  } else if (!TASK_STATUSES.includes(normalizeTaskStatus(body.status))) {
    pushInvalidStatus(errors);
  }

  collectErrors(errors);

  return {
    status: normalizeTaskStatus(asTrimmedString(body.status)),
  };
};
