import { AppError } from '../../utils/appError.js';
import { parseEntityId, requireEntityId } from '../../utils/entityId.js';

const collectErrors = (errors) => {
  if (errors.length > 0) {
    throw new AppError('Validation failed', 400, errors);
  }
};

export const validateFreelancerIdParam = (id) => {
  return requireEntityId(
    id,
    'id',
    'Freelancer id is required',
    'Freelancer id must be a valid integer',
  );
};

export const validateUpdateFreelancer = (body = {}) => {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Validation failed', 400, [
      { field: 'body', message: 'Request body must be an object' },
    ]);
  }

  const errors = [];
  const payload = {};

  if (Object.prototype.hasOwnProperty.call(body, 'rating_avg')) {
    errors.push({
      field: 'rating_avg',
      message: 'Rating cannot be updated here',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'completed_projects_count')) {
    errors.push({
      field: 'completed_projects_count',
      message: 'Completed projects count cannot be updated here',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'subscription_status')) {
    errors.push({
      field: 'subscription_status',
      message: 'Subscription status cannot be updated here',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'specialty_id')) {
    if (body.specialty_id === null) {
      payload.specialty_id = null;
    } else {
      const specialtyId = parseEntityId(body.specialty_id);

      if (specialtyId === null) {
        errors.push({
          field: 'specialty_id',
          message: 'Specialty id must be a valid integer',
        });
      } else {
        payload.specialty_id = specialtyId;
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'bio')) {
    if (body.bio === null) {
      payload.bio = null;
    } else if (typeof body.bio !== 'string') {
      errors.push({ field: 'bio', message: 'Bio must be a string' });
    } else {
      payload.bio = body.bio.trim() || null;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'experience_years')) {
    const years = Number(body.experience_years);

    if (
      body.experience_years === null ||
      body.experience_years === '' ||
      !Number.isInteger(years) ||
      years < 0
    ) {
      errors.push({
        field: 'experience_years',
        message: 'Experience years must be an integer of 0 or more',
      });
    } else {
      payload.experience_years = years;
    }
  }

  if (Object.keys(payload).length === 0 && errors.length === 0) {
    errors.push({
      field: 'body',
      message: 'At least one of bio or experience_years is required',
    });
  }

  collectErrors(errors);

  return payload;
};
