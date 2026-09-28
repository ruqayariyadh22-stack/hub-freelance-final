import { AppError } from '../../../utils/appError.js';
import { requireEntityId } from '../../../utils/entityId.js';

const FORBIDDEN_BODY_FIELDS = {
  user_id: 'User id cannot be supplied in the request body',
  freelancer_id: 'Freelancer id cannot be supplied in the request body',
  id: 'Portfolio item id cannot be supplied in the request body',
  created_at: 'created_at cannot be supplied in the request body',
  updated_at: 'updated_at cannot be supplied in the request body',
};

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

const readOptionalUrl = (body, field, errors) => {
  if (!Object.prototype.hasOwnProperty.call(body, field)) {
    return null;
  }

  if (body[field] === null) {
    return null;
  }

  if (typeof body[field] !== 'string') {
    errors.push({
      field,
      message: `${field} must be a string`,
    });
    return undefined;
  }

  const value = body[field].trim();
  return value || null;
};

export const validateFreelancerIdParam = (id) => {
  return requireEntityId(
    id,
    'id',
    'Freelancer id is required',
    'Freelancer id must be a valid integer',
  );
};

export const validatePortfolioIdParam = (id) => {
  return requireEntityId(
    id,
    'portfolioId',
    'Portfolio id is required',
    'Portfolio id must be a valid integer',
  );
};

export const validateAddPortfolioItem = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];

  for (const [field, message] of Object.entries(FORBIDDEN_BODY_FIELDS)) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      errors.push({ field, message });
    }
  }

  const title = asTrimmedString(body.title);
  const description = asTrimmedString(body.description);
  const projectUrl = readOptionalUrl(body, 'project_url', errors);
  const imageUrl = readOptionalUrl(body, 'image_url', errors);

  if (!title) {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  if (!description) {
    errors.push({ field: 'description', message: 'Description is required' });
  }

  collectErrors(errors);

  return {
    title,
    description,
    project_url: projectUrl,
    image_url: imageUrl,
  };
};

export const validateUpdatePortfolioItem = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  const payload = {};

  for (const [field, message] of Object.entries(FORBIDDEN_BODY_FIELDS)) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      errors.push({ field, message });
    }
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

  if (Object.prototype.hasOwnProperty.call(body, 'project_url')) {
    const projectUrl = readOptionalUrl(body, 'project_url', errors);
    if (projectUrl !== undefined) {
      payload.project_url = projectUrl;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'image_url')) {
    const imageUrl = readOptionalUrl(body, 'image_url', errors);
    if (imageUrl !== undefined) {
      payload.image_url = imageUrl;
    }
  }

  if (Object.keys(payload).length === 0 && errors.length === 0) {
    errors.push({
      field: 'body',
      message:
        'At least one of title, description, project_url, or image_url is required',
    });
  }

  collectErrors(errors);

  return payload;
};
