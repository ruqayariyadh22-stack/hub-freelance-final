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

const ALLOWED_FIELDS = ['message', 'attachments'];
const MAX_MESSAGE_LENGTH = 5000;

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

  for (const field of Object.keys(body)) {
    if (!IDENTITY_FIELDS.includes(field) && !ALLOWED_FIELDS.includes(field)) {
      errors.push({
        field,
        message: `${field} is not a documented message field`,
      });
    }
  }

  const payload = {};
  const message = asTrimmedString(body.message);

  if (!Object.prototype.hasOwnProperty.call(body, 'message')) {
    errors.push({ field: 'message', message: 'Message is required' });
  } else if (typeof body.message !== 'string') {
    errors.push({ field: 'message', message: 'Message must be a string' });
  } else if (!message) {
    errors.push({ field: 'message', message: 'Message cannot be empty' });
  } else if (message.length > MAX_MESSAGE_LENGTH) {
    errors.push({
      field: 'message',
      message: `Message must be at most ${MAX_MESSAGE_LENGTH} characters`,
    });
  } else {
    payload.message = message;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'attachments')) {
    payload.attachments = body.attachments;
  }

  collectErrors(errors);

  return payload;
};
