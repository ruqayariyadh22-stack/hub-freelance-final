import { AppError } from './appError.js';

const ENTITY_ID_PATTERN = /^[1-9]\d*$/;
const MAX_ENTITY_ID = 2147483647;

export const parseEntityId = (value) => {
  if (typeof value === 'number') {
    if (!Number.isInteger(value) || value < 1 || value > MAX_ENTITY_ID) {
      return null;
    }

    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!ENTITY_ID_PATTERN.test(trimmed)) {
      return null;
    }

    const parsed = Number(trimmed);

    if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_ENTITY_ID) {
      return null;
    }

    return parsed;
  }

  return null;
};

export const isBlankEntityId = (value) =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.trim() === '');

export const requireEntityId = (
  value,
  field,
  requiredMessage,
  invalidMessage,
) => {
  if (isBlankEntityId(value)) {
    throw new AppError('Validation failed', 400, [
      { field, message: requiredMessage },
    ]);
  }

  const parsed = parseEntityId(value);

  if (parsed === null) {
    throw new AppError('Validation failed', 400, [
      { field, message: invalidMessage },
    ]);
  }

  return parsed;
};
