import { AppError } from '../utils/appError.js';

const PUBLIC_STATUS_CODES = new Set([400, 401, 403, 404, 409, 429, 503]);

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: 'File is too large',
  LIMIT_FILE_COUNT: 'Only one file can be uploaded at a time',
  LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
};

const normalizeError = (err) => {
  if (err?.name === 'MulterError') {
    return new AppError('Validation failed', 400, [
      { field: 'file', message: MULTER_MESSAGES[err.code] || 'Invalid file upload' },
    ]);
  }

  if (err?.type === 'entity.parse.failed') {
    return new AppError('Request body must be valid JSON', 400);
  }

  if (err?.status === 404 && err?.expose) {
    return new AppError('File not found', 404);
  }

  return err;
};

export const errorHandler = (rawError, req, res, next) => {
  const err = normalizeError(rawError);
  const statusCode = err.statusCode || 500;
  const isHandledAppError = err instanceof AppError;
  const isPublicHandledStatus = PUBLIC_STATUS_CODES.has(statusCode);
  const exposeClientMessage = isHandledAppError || isPublicHandledStatus;

  const payload = {
    success: false,
    message: exposeClientMessage
      ? err.message || 'Internal server error'
      : 'Internal server error',
  };

  if (exposeClientMessage && err.errors) {
    payload.errors = err.errors;
  }

  res.status(exposeClientMessage ? statusCode : 500).json(payload);
};
