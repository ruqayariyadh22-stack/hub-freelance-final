import { AppError } from '../../utils/appError.js';
import { requireEntityId } from '../../utils/entityId.js';

const IDENTITY_FIELDS = [
  'user_id',
  'recipient_id',
  'sender_id',
  'client_id',
  'freelancer_id',
  'admin_id',
  'created_by',
  'requested_by',
  'notification_id',
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

export const validateNotificationIdParam = (id) => {
  return requireEntityId(
    id,
    'id',
    'Notification id is required',
    'Notification id must be a valid integer',
  );
};

export const validateMarkAsReadBody = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  rejectIdentityFields(body, errors);

  for (const field of Object.keys(body)) {
    if (!IDENTITY_FIELDS.includes(field)) {
      errors.push({
        field,
        message: `${field} is not a documented notification request field`,
      });
    }
  }

  collectErrors(errors);

  return {};
};
