import { AppError } from '../utils/appError.js';

const PUBLIC_STATUS_CODES = new Set([400, 401, 403, 404, 409, 429, 503]);

export const errorHandler = (err, req, res, next) => {
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
