import { AppError } from '../../utils/appError.js';
import { parseEntityId, requireEntityId } from '../../utils/entityId.js';

const DISPUTE_FIELDS = [
  'reported_against',
  'project_id',
  'issue_type',
  'description',
  'evidence_attachments',
];
const IDENTITY_FIELDS = [
  'user_id',
  'client_id',
  'freelancer_id',
  'admin_id',
  'created_by',
  'requested_by',
  'requester_id',
  'dispute_id',
  'reported_by',
  'resolved_by',
  'closed_by',
  'contract_id',
];
const SYSTEM_FIELDS = ['status', 'action_taken'];

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

export const validateDisputeIdParam = (id) => {
  return requireEntityId(
    id,
    'id',
    'Dispute id is required',
    'Dispute id must be a valid integer',
  );
};

export const validateCreateDispute = (body = {}) => {
  ensureObjectBody(body);

  const errors = [];
  rejectIdentityFields(body, errors);

  if (Object.prototype.hasOwnProperty.call(body, 'status')) {
    errors.push({
      field: 'status',
      message: 'Status cannot be set by the reporter',
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, 'action_taken')) {
    errors.push({
      field: 'action_taken',
      message: 'action_taken cannot be set by the reporter',
    });
  }

  const payload = {};

  if (Object.prototype.hasOwnProperty.call(body, 'reported_against')) {
    const reportedAgainst = parseEntityId(body.reported_against);

    if (reportedAgainst === null) {
      errors.push({
        field: 'reported_against',
        message: 'reported_against must be a valid integer',
      });
    } else {
      payload.reported_against = reportedAgainst;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'project_id')) {
    const projectId = parseEntityId(body.project_id);

    if (projectId === null) {
      errors.push({
        field: 'project_id',
        message: 'project_id must be a valid integer',
      });
    } else {
      payload.project_id = projectId;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'issue_type')) {
    if (typeof body.issue_type !== 'string') {
      errors.push({
        field: 'issue_type',
        message: 'issue_type must be a string',
      });
    } else {
      payload.issue_type = body.issue_type.trim() || null;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'description')) {
    if (typeof body.description !== 'string') {
      errors.push({
        field: 'description',
        message: 'Description must be a string',
      });
    } else {
      payload.description = body.description.trim() || null;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'evidence_attachments')) {
    if (!Array.isArray(body.evidence_attachments)) {
      errors.push({
        field: 'evidence_attachments',
        message: 'evidence_attachments must be an array',
      });
    } else {
      payload.evidence_attachments = body.evidence_attachments;
    }
  }

  for (const field of Object.keys(body)) {
    if (
      !DISPUTE_FIELDS.includes(field) &&
      !IDENTITY_FIELDS.includes(field) &&
      !SYSTEM_FIELDS.includes(field)
    ) {
      errors.push({
        field,
        message: `${field} is not a documented dispute field`,
      });
    }
  }

  if (Object.keys(payload).length === 0 && errors.length === 0) {
    errors.push({
      field: 'body',
      message:
        'At least one of reported_against, project_id, issue_type, description, or evidence_attachments is required',
    });
  }

  collectErrors(errors);

  return payload;
};
