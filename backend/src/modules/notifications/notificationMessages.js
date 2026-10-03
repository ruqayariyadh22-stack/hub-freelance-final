import { insertNotification } from './notificationsPersistence.js';
import { findNotificationPreferencesByUserId } from '../users/usersPersistence.js';
import { withDefaultPreferences } from '../users/notificationPreferences.js';

export const NOTIFICATION_TYPES = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  PROPOSAL_ACCEPTED: 'PROPOSAL_ACCEPTED',
  CONTRACT_CREATED: 'CONTRACT_CREATED',
  PROJECT_STATUS_CHANGED: 'PROJECT_STATUS_CHANGED',
  SCOPE_CHANGE_CREATED: 'SCOPE_CHANGE_CREATED',
  SCOPE_CHANGE_APPROVED: 'SCOPE_CHANGE_APPROVED',
  SCOPE_CHANGE_REJECTED: 'SCOPE_CHANGE_REJECTED',
  ESCROW_COMPLETED: 'ESCROW_COMPLETED',
  PAYMENT_RELEASED: 'PAYMENT_RELEASED',
  DISPUTE_OPENED: 'DISPUTE_OPENED',
  DISPUTE_RESOLVED: 'DISPUTE_RESOLVED',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  SUBSCRIPTION_UPDATED: 'SUBSCRIPTION_UPDATED',
  PROPOSAL_RECEIVED: 'PROPOSAL_RECEIVED',
  PROPOSAL_REJECTED: 'PROPOSAL_REJECTED',
  PROJECT_INVITATION: 'PROJECT_INVITATION',
  CONTRACT_DELIVERED: 'CONTRACT_DELIVERED',
  DELIVERY_FILE_UPLOADED: 'DELIVERY_FILE_UPLOADED',
  WITHDRAWAL_COMPLETED: 'WITHDRAWAL_COMPLETED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
};

export const NOTIFICATION_MESSAGES = {
  LOGIN_SUCCESS: 'Your login was successful.',
  PROPOSAL_ACCEPTED: 'Your proposal has been accepted.',
  CONTRACT_CREATED: 'A new contract has been created for your project.',
  PROJECT_STATUS_CHANGED: 'Your project status has been updated.',
  SCOPE_CHANGE_CREATED:
    'A new scope change has been submitted for your project.',
  SCOPE_CHANGE_APPROVED: 'Your scope change has been approved.',
  SCOPE_CHANGE_REJECTED: 'Your scope change has been rejected.',
  ESCROW_COMPLETED: 'Escrow has been completed for your contract.',
  PAYMENT_RELEASED: 'Payment has been released for your contract.',
  DISPUTE_OPENED: 'A dispute has been opened for your project.',
  DISPUTE_RESOLVED: 'The dispute for your project has been resolved.',
  ACCOUNT_DISABLED: 'Your account has been disabled.',
  SUBSCRIPTION_UPDATED: 'Your subscription has been updated.',
  PROPOSAL_RECEIVED: 'A freelancer has submitted a new proposal on your project.',
  PROPOSAL_REJECTED: 'Your proposal was not selected for this project.',
  PROJECT_INVITATION: 'A client has invited you to submit a proposal on their project.',
  CONTRACT_DELIVERED: 'The freelancer has marked your contract as delivered.',
  DELIVERY_FILE_UPLOADED: 'A new delivery file has been uploaded to your contract.',
  WITHDRAWAL_COMPLETED: 'Your withdrawal request has been processed.',
  PASSWORD_CHANGED: 'Your account password was changed.',
};

const PREFERENCE_BY_TYPE = {
  PROPOSAL_ACCEPTED: 'proposal_updates',
  PROPOSAL_RECEIVED: 'proposal_updates',
  PROPOSAL_REJECTED: 'proposal_updates',
  PROJECT_INVITATION: 'proposal_updates',
  CONTRACT_CREATED: 'project_updates',
  PROJECT_STATUS_CHANGED: 'project_updates',
  SCOPE_CHANGE_CREATED: 'project_updates',
  SCOPE_CHANGE_APPROVED: 'project_updates',
  SCOPE_CHANGE_REJECTED: 'project_updates',
  CONTRACT_DELIVERED: 'project_updates',
  DELIVERY_FILE_UPLOADED: 'project_updates',
  ESCROW_COMPLETED: 'payment_updates',
  PAYMENT_RELEASED: 'payment_updates',
  WITHDRAWAL_COMPLETED: 'payment_updates',
  SUBSCRIPTION_UPDATED: 'payment_updates',
  DISPUTE_OPENED: 'dispute_updates',
  DISPUTE_RESOLVED: 'dispute_updates',
};

const isMutedByPreferences = async (userId, type) => {
  const preferenceKey = PREFERENCE_BY_TYPE[type];

  if (!preferenceKey) {
    return false;
  }

  const stored = await findNotificationPreferencesByUserId(userId);
  return withDefaultPreferences(stored)[preferenceKey] === false;
};

export const notifyUser = async ({ userId, type }) => {
  if (userId == null || !NOTIFICATION_MESSAGES[type]) {
    return;
  }

  try {
    if (await isMutedByPreferences(userId, type)) {
      return;
    }

    await insertNotification({
      userId,
      type,
      message: NOTIFICATION_MESSAGES[type],
    });
  } catch {
    return;
  }
};
