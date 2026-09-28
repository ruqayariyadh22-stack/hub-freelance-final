import { AppError } from './appError.js';

export const persistenceNotConfigured = () => {
  throw new AppError('Database persistence is not configured yet', 503);
};
