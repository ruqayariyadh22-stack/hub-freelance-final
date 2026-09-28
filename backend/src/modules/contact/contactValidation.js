import { AppError } from '../../utils/appError.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export const validateCreateContact = (body = {}) => {
  const errors = [];
  const name = asTrimmedString(body.name);
  const email = asTrimmedString(body.email).toLowerCase();
  const message = asTrimmedString(body.message);

  if (!name) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.push({ field: 'email', message: 'Email must be valid' });
  }

  if (!message) {
    errors.push({ field: 'message', message: 'Message is required' });
  }

  collectErrors(errors);

  return { name, email, message };
};
