import { AppError } from '../../utils/appError.js';
import { requireEntityId } from '../../utils/entityId.js';

const CREATE_STATUSES = ['draft', 'open'];
const UPDATE_STATUSES = ['draft', 'open', 'completed', 'cancelled'];

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

const ensureObjectBody = (body) => {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Validation failed', 400, [
      { field: 'body', message: 'Request body must be an object' },
    ]);
  }
};

const validateStringArray = (value, field, errors) => {
  if (!Array.isArray(value)) {
    errors.push({ field, message: `${field} must be an array` });
    return undefined;
  }

  const items = [];

  for (const item of value) {
    if (typeof item !== 'string' || !item.trim()) {
      errors.push({
        field,
        message: `${field} must contain non-empty strings`,
      });
      return undefined;
    }

    items.push(item.trim());
  }

  return items;
};

const validateBudgetField = (value, field, errors) => {
  const amount = Number(value);

  if (value === '' || value === null || Number.isNaN(amount) || amount < 0) {
    errors.push({
      field,
      message: `${field} must be a number of 0 or more`,
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

export const validateCreateProject = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  const title = asTrimmedString(body.title);
  const description = asTrimmedString(body.description);
  const payload = {};

  if (!title) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else {
    payload.title = title;
  }

  if (!description) {
    errors.push({ field: 'description', message: 'Description is required' });
  } else {
    payload.description = description;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'category')) {
    payload.category = asTrimmedString(body.category) || null;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'budget_min')) {
    const budgetMin = validateBudgetField(body.budget_min, 'budget_min', errors);
    if (budgetMin !== undefined) {
      payload.budget_min = budgetMin;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'budget_max')) {
    const budgetMax = validateBudgetField(body.budget_max, 'budget_max', errors);
    if (budgetMax !== undefined) {
      payload.budget_max = budgetMax;
    }
  }

  if (
    payload.budget_min !== undefined &&
    payload.budget_max !== undefined &&
    payload.budget_min > payload.budget_max
  ) {
    errors.push({
      field: 'budget_min',
      message: 'budget_min cannot be greater than budget_max',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'duration')) {
    const duration = Number(body.duration);

    if (!Number.isInteger(duration) || duration <= 0) {
      errors.push({
        field: 'duration',
        message: 'Duration must be an integer greater than 0',
      });
    } else {
      payload.duration = duration;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'required_skills')) {
    const skills = validateStringArray(
      body.required_skills,
      'required_skills',
      errors,
    );
    if (skills) {
      payload.required_skills = skills;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'attachments')) {
    const attachments = validateStringArray(
      body.attachments,
      'attachments',
      errors,
    );
    if (attachments) {
      payload.attachments = attachments;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'status')) {
    const status = asTrimmedString(body.status);

    if (!CREATE_STATUSES.includes(status)) {
      errors.push({
        field: 'status',
        message: 'Status must be draft or open',
      });
    } else {
      payload.status = status;
    }
  }

  collectErrors(errors);

  return payload;
};

export const validateUpdateProject = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  const payload = {};

  if (Object.prototype.hasOwnProperty.call(body, 'client_id')) {
    errors.push({
      field: 'client_id',
      message: 'Client id cannot be updated here',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'chosen_freelancer_id')) {
    errors.push({
      field: 'chosen_freelancer_id',
      message: 'Chosen freelancer cannot be updated here',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'title')) {
    const title = asTrimmedString(body.title);

    if (!title) {
      errors.push({ field: 'title', message: 'Title cannot be empty' });
    } else {
      payload.title = title;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'description')) {
    const description = asTrimmedString(body.description);

    if (!description) {
      errors.push({
        field: 'description',
        message: 'Description cannot be empty',
      });
    } else {
      payload.description = description;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'category')) {
    payload.category = asTrimmedString(body.category) || null;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'budget_min')) {
    const budgetMin = validateBudgetField(body.budget_min, 'budget_min', errors);
    if (budgetMin !== undefined) {
      payload.budget_min = budgetMin;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'budget_max')) {
    const budgetMax = validateBudgetField(body.budget_max, 'budget_max', errors);
    if (budgetMax !== undefined) {
      payload.budget_max = budgetMax;
    }
  }

  if (
    payload.budget_min !== undefined &&
    payload.budget_max !== undefined &&
    payload.budget_min > payload.budget_max
  ) {
    errors.push({
      field: 'budget_min',
      message: 'budget_min cannot be greater than budget_max',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'duration')) {
    const duration = Number(body.duration);

    if (!Number.isInteger(duration) || duration <= 0) {
      errors.push({
        field: 'duration',
        message: 'Duration must be an integer greater than 0',
      });
    } else {
      payload.duration = duration;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'required_skills')) {
    const skills = validateStringArray(
      body.required_skills,
      'required_skills',
      errors,
    );
    if (skills) {
      payload.required_skills = skills;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'attachments')) {
    const attachments = validateStringArray(
      body.attachments,
      'attachments',
      errors,
    );
    if (attachments) {
      payload.attachments = attachments;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'status')) {
    const status = asTrimmedString(body.status);

    if (!UPDATE_STATUSES.includes(status)) {
      errors.push({
        field: 'status',
        message: 'Status must be draft, open, completed, or cancelled',
      });
    } else {
      payload.status = status;
    }
  }

  if (Object.keys(payload).length === 0 && errors.length === 0) {
    errors.push({
      field: 'body',
      message: 'At least one project field is required',
    });
  }

  collectErrors(errors);

  return payload;
};
