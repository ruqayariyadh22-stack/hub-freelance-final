import { AppError } from '../../utils/appError.js';
import { requireEntityId } from '../../utils/entityId.js';
import { NOTIFICATION_PREFERENCE_KEYS } from './notificationPreferences.js';

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

export const validateUserIdParam = (id) => {
  return requireEntityId(
    id,
    'id',
    'User id is required',
    'User id must be a valid integer',
  );
};

export const validateUpdateMe = (body = {}) => {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Validation failed', 400, [
      { field: 'body', message: 'Request body must be an object' },
    ]);
  }

  const errors = [];
  const payload = {};

  if (Object.prototype.hasOwnProperty.call(body, 'email')) {
    errors.push({ field: 'email', message: 'Email cannot be updated here' });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'role')) {
    errors.push({ field: 'role', message: 'Role cannot be updated here' });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'password')) {
    errors.push({
      field: 'password',
      message: 'Password cannot be updated here',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'account_status')) {
    errors.push({
      field: 'account_status',
      message: 'Account status cannot be updated here',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'name')) {
    const name = asTrimmedString(body.name);

    if (!name) {
      errors.push({ field: 'name', message: 'Name cannot be empty' });
    } else {
      payload.name = name;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'phone')) {
    if (body.phone === null) {
      payload.phone = null;
    } else {
      const phone = asTrimmedString(body.phone);
      payload.phone = phone || null;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'profile_image')) {
    if (body.profile_image === null) {
      payload.profile_image = null;
    } else {
      const profileImage = asTrimmedString(body.profile_image);
      payload.profile_image = profileImage || null;
    }
  }

  if (Object.keys(payload).length === 0 && errors.length === 0) {
    errors.push({
      field: 'body',
      message: 'At least one of name, phone, or profile_image is required',
    });
  }

  collectErrors(errors);

  return payload;
};

export const validateUpdatePreferences = (body = {}) => {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Validation failed', 400, [
      { field: 'body', message: 'Request body must be an object' },
    ]);
  }

  const errors = [];
  const payload = {};

  for (const [key, value] of Object.entries(body)) {
    if (!NOTIFICATION_PREFERENCE_KEYS.includes(key)) {
      errors.push({ field: key, message: `${key} is not a notification preference` });
    } else if (typeof value !== 'boolean') {
      errors.push({ field: key, message: `${key} must be a boolean` });
    } else {
      payload[key] = value;
    }
  }

  if (Object.keys(payload).length === 0 && errors.length === 0) {
    errors.push({
      field: 'body',
      message: 'At least one notification preference is required',
    });
  }

  collectErrors(errors);

  return payload;
};
