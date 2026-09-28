import { AppError } from '../../utils/appError.js';
import { requireEntityId } from '../../utils/entityId.js';

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

const validatePositiveNumber = (value, field, errors) => {
  const amount = Number(value);

  if (value === '' || value === null || Number.isNaN(amount) || amount <= 0) {
    errors.push({
      field,
      message: `${field} must be a number greater than 0`,
    });
    return undefined;
  }

  return amount;
};

const validatePositiveInteger = (value, field, errors) => {
  const amount = Number(value);

  if (!Number.isInteger(amount) || amount <= 0) {
    errors.push({
      field,
      message: `${field} must be an integer greater than 0`,
    });
    return undefined;
  }

  return amount;
};

export const validateProjectIdParam = (id) => {
  return requireEntityId(
    id,
    'id',
    'Project id is required',
    'Project id must be a valid integer',
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

export const validateProposalIdParam = (id) => {
  return requireEntityId(
    id,
    'id',
    'Proposal id is required',
    'Proposal id must be a valid integer',
  );
};

export const validateCreateProposal = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  const payload = {};

  if (Object.prototype.hasOwnProperty.call(body, 'freelancer_id')) {
    errors.push({
      field: 'freelancer_id',
      message: 'Freelancer id cannot be supplied in the request body',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'project_id')) {
    errors.push({
      field: 'project_id',
      message: 'Project id must come from the route parameter',
    });
  }

  if (!Object.prototype.hasOwnProperty.call(body, 'proposed_price')) {
    errors.push({ field: 'proposed_price', message: 'Proposed price is required' });
  } else {
    const proposedPrice = validatePositiveNumber(
      body.proposed_price,
      'proposed_price',
      errors,
    );
    if (proposedPrice !== undefined) {
      payload.proposed_price = proposedPrice;
    }
  }

  if (!Object.prototype.hasOwnProperty.call(body, 'proposed_duration')) {
    errors.push({
      field: 'proposed_duration',
      message: 'Proposed duration is required',
    });
  } else {
    const proposedDuration = validatePositiveInteger(
      body.proposed_duration,
      'proposed_duration',
      errors,
    );
    if (proposedDuration !== undefined) {
      payload.proposed_duration = proposedDuration;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'message')) {
    if (body.message === null) {
      payload.message = null;
    } else if (typeof body.message !== 'string') {
      errors.push({ field: 'message', message: 'Message must be a string' });
    } else {
      payload.message = body.message.trim() || null;
    }
  }

  collectErrors(errors);

  return payload;
};

export const validateUpdateProposal = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  const payload = {};

  if (Object.prototype.hasOwnProperty.call(body, 'freelancer_id')) {
    errors.push({
      field: 'freelancer_id',
      message: 'Freelancer id cannot be supplied in the request body',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'project_id')) {
    errors.push({
      field: 'project_id',
      message: 'Project id cannot be updated here',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'status')) {
    errors.push({
      field: 'status',
      message: 'Status must be changed through accept or reject',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'proposed_price')) {
    const proposedPrice = validatePositiveNumber(
      body.proposed_price,
      'proposed_price',
      errors,
    );
    if (proposedPrice !== undefined) {
      payload.proposed_price = proposedPrice;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'proposed_duration')) {
    const proposedDuration = validatePositiveInteger(
      body.proposed_duration,
      'proposed_duration',
      errors,
    );
    if (proposedDuration !== undefined) {
      payload.proposed_duration = proposedDuration;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'message')) {
    if (body.message === null) {
      payload.message = null;
    } else if (typeof body.message !== 'string') {
      errors.push({ field: 'message', message: 'Message must be a string' });
    } else {
      payload.message = body.message.trim() || null;
    }
  }

  if (Object.keys(payload).length === 0 && errors.length === 0) {
    errors.push({
      field: 'body',
      message: 'At least one of proposed_price, proposed_duration, or message is required',
    });
  }

  collectErrors(errors);

  return payload;
};
