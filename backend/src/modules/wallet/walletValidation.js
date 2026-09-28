import { AppError } from '../../utils/appError.js';
import { requireEntityId } from '../../utils/entityId.js';

const IDENTITY_FIELDS = [
  'user_id',
  'client_id',
  'freelancer_id',
  'admin_id',
  'created_by',
  'requested_by',
  'wallet_id',
  'contract_id',
  'project_id',
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

export const validateContractIdParam = (id) => {
  return requireEntityId(
    id,
    'contractId',
    'Contract id is required',
    'Contract id must be a valid integer',
  );
};

export const validateWalletActionBody = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  rejectIdentityFields(body, errors);

  for (const field of Object.keys(body)) {
    if (!IDENTITY_FIELDS.includes(field)) {
      errors.push({
        field,
        message: `${field} is not a documented wallet request field`,
      });
    }
  }

  collectErrors(errors);

  return {};
};

export const validateTopupBody = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  rejectIdentityFields(body, errors);

  let amount;

  if (!Object.prototype.hasOwnProperty.call(body, 'amount')) {
    errors.push({
      field: 'amount',
      message: 'Amount is required',
    });
  } else if (
    typeof body.amount !== 'number' ||
    Number.isNaN(body.amount) ||
    !Number.isFinite(body.amount)
  ) {
    errors.push({
      field: 'amount',
      message: 'Amount must be a finite number',
    });
  } else if (body.amount <= 0) {
    errors.push({
      field: 'amount',
      message: 'Amount must be greater than 0',
    });
  } else {
    amount = body.amount;
  }

  for (const field of Object.keys(body)) {
    if (field !== 'amount' && !IDENTITY_FIELDS.includes(field)) {
      errors.push({
        field,
        message: `${field} is not a documented wallet request field`,
      });
    }
  }

  collectErrors(errors);

  return { amount };
};
