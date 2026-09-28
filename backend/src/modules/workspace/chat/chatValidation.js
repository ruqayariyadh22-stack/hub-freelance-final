import { AppError } from '../../../utils/appError.js';
import { requireEntityId } from '../../../utils/entityId.js';

const IDENTITY_FIELDS = [
  'sender_id',
  'user_id',
  'client_id',
  'freelancer_id',
  'conversation_id',
  'project_id',
  'created_by',
  'requested_by',
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

export const validateConversationIdParam = (id) => {
  return requireEntityId(
    id,
    'id',
    'Conversation id is required',
    'Conversation id must be a valid integer',
  );
};

export const validateCreateMessage = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  rejectIdentityFields(body, errors);

  const payload = {};

  for (const [field, value] of Object.entries(body)) {
    if (IDENTITY_FIELDS.includes(field)) {
      continue;
    }

    payload[field] = value;
  }

  if (Object.keys(payload).length === 0 && errors.length === 0) {
    errors.push({
      field: 'body',
      message: 'Request body cannot be empty',
    });
  }

  collectErrors(errors);

  return payload;
};
