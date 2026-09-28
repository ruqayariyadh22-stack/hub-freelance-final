import { AppError } from '../../../utils/appError.js';
import {
  isBlankEntityId,
  parseEntityId,
  requireEntityId,
} from '../../../utils/entityId.js';

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

export const validateFreelancerIdParam = (id) => {
  return requireEntityId(
    id,
    'id',
    'Freelancer id is required',
    'Freelancer id must be a valid integer',
  );
};

export const validateAddSkill = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  const payload = {};

  if (Object.prototype.hasOwnProperty.call(body, 'user_id')) {
    errors.push({
      field: 'user_id',
      message: 'User id cannot be supplied in the request body',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'freelancer_id')) {
    errors.push({
      field: 'freelancer_id',
      message: 'Freelancer id cannot be supplied in the request body',
    });
  }

  if (isBlankEntityId(body.skill_id)) {
    errors.push({
      field: 'skill_id',
      message: 'Skill id is required',
    });
  } else {
    const skillId = parseEntityId(body.skill_id);

    if (skillId === null) {
      errors.push({
        field: 'skill_id',
        message: 'Skill id must be a valid integer',
      });
    } else {
      payload.skill_id = skillId;
    }
  }

  collectErrors(errors);

  return payload;
};
