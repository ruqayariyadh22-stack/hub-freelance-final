import { AppError } from '../../../utils/appError.js';
import { requireEntityId } from '../../../utils/entityId.js';

const SERVICE_STATUSES = ['active', 'hidden'];

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

const validatePrice = (value, errors) => {
  const amount = Number(value);

  if (value === '' || value === null || Number.isNaN(amount) || amount < 0) {
    errors.push({
      field: 'price',
      message: 'Price must be a number of 0 or more',
    });
    return undefined;
  }

  return amount;
};

const validateDeliveryTime = (value, errors) => {
  const days = Number(value);

  if (!Number.isInteger(days) || days <= 0) {
    errors.push({
      field: 'delivery_time',
      message: 'Delivery time must be an integer greater than 0',
    });
    return undefined;
  }

  return days;
};

const validateStatus = (value, errors) => {
  const status = asTrimmedString(value);

  if (!SERVICE_STATUSES.includes(status)) {
    errors.push({
      field: 'status',
      message: 'Status must be active or hidden',
    });
    return undefined;
  }

  return status;
};

export const validateFreelancerIdParam = (id) => {
  return requireEntityId(
    id,
    'id',
    'Freelancer id is required',
    'Freelancer id must be a valid integer',
  );
};

export const validateServiceIdParam = (id) => {
  return requireEntityId(
    id,
    'id',
    'Service id is required',
    'Service id must be a valid integer',
  );
};

export const validateCreateService = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  const payload = {};

  if (Object.prototype.hasOwnProperty.call(body, 'freelancer_id')) {
    errors.push({
      field: 'freelancer_id',
      message: 'Freelancer id cannot be supplied in the request body',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'id')) {
    errors.push({
      field: 'id',
      message: 'Service id cannot be supplied in the request body',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'is_featured')) {
    errors.push({
      field: 'is_featured',
      message: 'is_featured cannot be supplied in the request body',
    });
  }

  const title = asTrimmedString(body.title);
  const description = asTrimmedString(body.description);
  const category = asTrimmedString(body.category);

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

  if (!category) {
    errors.push({ field: 'category', message: 'Category is required' });
  } else {
    payload.category = category;
  }

  if (!Object.prototype.hasOwnProperty.call(body, 'price')) {
    errors.push({ field: 'price', message: 'Price is required' });
  } else {
    const price = validatePrice(body.price, errors);
    if (price !== undefined) {
      payload.price = price;
    }
  }

  if (!Object.prototype.hasOwnProperty.call(body, 'delivery_time')) {
    errors.push({
      field: 'delivery_time',
      message: 'Delivery time is required',
    });
  } else {
    const deliveryTime = validateDeliveryTime(body.delivery_time, errors);
    if (deliveryTime !== undefined) {
      payload.delivery_time = deliveryTime;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'status')) {
    const status = validateStatus(body.status, errors);
    if (status) {
      payload.status = status;
    }
  }

  collectErrors(errors);

  return payload;
};

export const validateUpdateService = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  const payload = {};

  if (Object.prototype.hasOwnProperty.call(body, 'id')) {
    errors.push({
      field: 'id',
      message: 'Service id cannot be updated here',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'freelancer_id')) {
    errors.push({
      field: 'freelancer_id',
      message: 'Freelancer id cannot be updated here',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'is_featured')) {
    errors.push({
      field: 'is_featured',
      message: 'is_featured cannot be supplied in the request body',
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
    const category = asTrimmedString(body.category);

    if (!category) {
      errors.push({ field: 'category', message: 'Category cannot be empty' });
    } else {
      payload.category = category;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'price')) {
    const price = validatePrice(body.price, errors);
    if (price !== undefined) {
      payload.price = price;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'delivery_time')) {
    const deliveryTime = validateDeliveryTime(body.delivery_time, errors);
    if (deliveryTime !== undefined) {
      payload.delivery_time = deliveryTime;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'status')) {
    const status = validateStatus(body.status, errors);
    if (status) {
      payload.status = status;
    }
  }

  if (Object.keys(payload).length === 0 && errors.length === 0) {
    errors.push({
      field: 'body',
      message:
        'At least one of title, description, category, price, delivery_time, or status is required',
    });
  }

  collectErrors(errors);

  return payload;
};

export const validateFeatureServiceBody = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];

  if (Object.prototype.hasOwnProperty.call(body, 'is_featured')) {
    errors.push({
      field: 'is_featured',
      message: 'is_featured cannot be supplied in the request body',
    });
  }

  for (const field of ['id', 'freelancer_id', 'user_id']) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      errors.push({
        field,
        message: `${field} cannot be supplied in the request body`,
      });
    }
  }

  for (const field of Object.keys(body)) {
    if (
      field !== 'is_featured' &&
      field !== 'id' &&
      field !== 'freelancer_id' &&
      field !== 'user_id'
    ) {
      errors.push({
        field,
        message: `${field} is not a documented service request field`,
      });
    }
  }

  collectErrors(errors);

  return {};
};
