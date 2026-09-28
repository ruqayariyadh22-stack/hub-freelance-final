import { AppError } from '../../utils/appError.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGISTER_ROLES = ['client', 'freelancer'];
const MIN_PASSWORD_LENGTH = 8;

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

export const validateRegister = (body = {}) => {
  const errors = [];
  const name = asTrimmedString(body.name);
  const email = asTrimmedString(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  const role = asTrimmedString(body.role).toLowerCase();
  const phone = asTrimmedString(body.phone);
  const profileImage = asTrimmedString(body.profile_image);

  if (!name) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.push({ field: 'email', message: 'Email must be valid' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push({
      field: 'password',
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    });
  }

  if (!role) {
    errors.push({ field: 'role', message: 'Role is required' });
  } else if (!REGISTER_ROLES.includes(role)) {
    errors.push({
      field: 'role',
      message: 'Role must be client or freelancer',
    });
  }

  collectErrors(errors);

  return {
    name,
    email,
    password,
    role,
    phone: phone || null,
    profile_image: profileImage || null,
  };
};

export const validateLogin = (body = {}) => {
  const errors = [];
  const email = asTrimmedString(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.push({ field: 'email', message: 'Email must be valid' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  collectErrors(errors);

  return { email, password };
};

export const validateForgotPassword = (body = {}) => {
  const errors = [];
  const email = asTrimmedString(body.email).toLowerCase();

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.push({ field: 'email', message: 'Email must be valid' });
  }

  collectErrors(errors);

  return { email };
};

export const validateResetPassword = (body = {}) => {
  const errors = [];
  const token = asTrimmedString(body.token);
  const password = typeof body.password === 'string' ? body.password : '';

  if (!token) {
    errors.push({ field: 'token', message: 'Reset token is required' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push({
      field: 'password',
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    });
  }

  collectErrors(errors);

  return { token, password };
};
