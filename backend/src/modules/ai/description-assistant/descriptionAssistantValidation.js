import { AppError } from '../../../utils/appError.js';

const IDENTITY_FIELDS = [
  'user_id',
  'client_id',
  'freelancer_id',
  'admin_id',
  'created_by',
  'requested_by',
  'requester_id',
  'approved_by',
  'rejected_by',
];

const ALLOWED_FIELDS = new Set([
  'idea',
  'budget_min',
  'budget_max',
  'duration_days',
  'required_skills',
]);

const MAX_IDEA_LENGTH = 4000;
const MAX_SKILL_LENGTH = 80;
const MAX_SKILLS = 30;

const collectErrors = (errors) => {
  if (errors.length > 0) {
    throw new AppError('Validation failed', 400, errors);
  }
};

const parsePositiveNumber = (value, field, errors) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  errors.push({ field, message: `${field} must be a number` });
  return null;
};

export const validateDescriptionAssistantBody = (body = {}) => {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Validation failed', 400, [
      { field: 'body', message: 'Request body must be an object' },
    ]);
  }

  const errors = [];

  for (const field of IDENTITY_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      errors.push({
        field,
        message: `${field} cannot be supplied in the request body`,
      });
    }
  }

  for (const field of Object.keys(body)) {
    if (!ALLOWED_FIELDS.has(field) && !IDENTITY_FIELDS.includes(field)) {
      errors.push({
        field,
        message: `${field} is not a documented AI request field`,
      });
    }
  }

  if (typeof body.idea !== 'string' || !body.idea.trim()) {
    errors.push({ field: 'idea', message: 'Idea is required' });
  } else if (body.idea.trim().length > MAX_IDEA_LENGTH) {
    errors.push({ field: 'idea', message: 'Idea is too long' });
  }

  const budgetMin = parsePositiveNumber(body.budget_min, 'budget_min', errors);
  const budgetMax = parsePositiveNumber(body.budget_max, 'budget_max', errors);
  const durationDays = parsePositiveNumber(
    body.duration_days,
    'duration_days',
    errors,
  );

  if (budgetMin !== null && budgetMin < 0) {
    errors.push({ field: 'budget_min', message: 'budget_min must be >= 0' });
  }

  if (budgetMax !== null && budgetMax < 0) {
    errors.push({ field: 'budget_max', message: 'budget_max must be >= 0' });
  }

  if (
    budgetMin !== null &&
    budgetMax !== null &&
    budgetMax < budgetMin
  ) {
    errors.push({
      field: 'budget_max',
      message: 'budget_max must be greater than or equal to budget_min',
    });
  }

  if (durationDays !== null && (!Number.isInteger(durationDays) || durationDays < 1)) {
    errors.push({
      field: 'duration_days',
      message: 'duration_days must be an integer >= 1',
    });
  }

  if (!Array.isArray(body.required_skills)) {
    errors.push({
      field: 'required_skills',
      message: 'required_skills must be an array of strings',
    });
  }

  collectErrors(errors);

  const requiredSkills = body.required_skills
    .map((skill) => (typeof skill === 'string' ? skill.trim() : ''))
    .filter(Boolean);

  if (requiredSkills.length === 0) {
    throw new AppError('Validation failed', 400, [
      { field: 'required_skills', message: 'At least one required skill is required' },
    ]);
  }

  if (requiredSkills.length > MAX_SKILLS) {
    throw new AppError('Validation failed', 400, [
      { field: 'required_skills', message: 'Too many required skills' },
    ]);
  }

  for (const skill of requiredSkills) {
    if (skill.length > MAX_SKILL_LENGTH) {
      throw new AppError('Validation failed', 400, [
        { field: 'required_skills', message: 'Skill name is too long' },
      ]);
    }
  }

  return {
    idea: body.idea.trim(),
    budget_min: budgetMin,
    budget_max: budgetMax,
    duration_days: durationDays,
    required_skills: requiredSkills,
  };
};
