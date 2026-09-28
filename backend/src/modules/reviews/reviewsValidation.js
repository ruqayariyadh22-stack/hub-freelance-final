import { AppError } from '../../utils/appError.js';
import { requireEntityId } from '../../utils/entityId.js';

const REVIEW_FIELDS = ['rating', 'comment'];
const IDENTITY_FIELDS = [
  'user_id',
  'reviewer_id',
  'reviewee_id',
  'review_id',
  'client_id',
  'freelancer_id',
  'contract_id',
  'project_id',
  'created_by',
  'requested_by',
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
    'id',
    'Contract id is required',
    'Contract id must be a valid integer',
  );
};

export const validateFreelancerIdParam = (id) => {
  return requireEntityId(
    id,
    'id',
    'Freelancer id is required',
    'Freelancer id must be a valid integer',
  );
};

export const validateCreateReview = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  rejectIdentityFields(body, errors);

  const payload = {};

  if (Object.prototype.hasOwnProperty.call(body, 'rating')) {
    if (typeof body.rating !== 'number' || Number.isNaN(body.rating) || !Number.isFinite(body.rating)) {
      errors.push({
        field: 'rating',
        message: 'Rating must be a number',
      });
    } else {
      payload.rating = body.rating;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'comment')) {
    if (typeof body.comment !== 'string') {
      errors.push({
        field: 'comment',
        message: 'Comment must be a string',
      });
    } else {
      payload.comment = body.comment.trim() || null;
    }
  }

  for (const field of Object.keys(body)) {
    if (!REVIEW_FIELDS.includes(field) && !IDENTITY_FIELDS.includes(field)) {
      errors.push({
        field,
        message: `${field} is not a documented review field`,
      });
    }
  }

  if (Object.keys(payload).length === 0 && errors.length === 0) {
    errors.push({
      field: 'body',
      message: 'At least one of rating or comment is required',
    });
  }

  collectErrors(errors);

  return payload;
};
