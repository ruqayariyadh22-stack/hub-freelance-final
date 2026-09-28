import { insertNotification } from './notificationsPersistence.js';

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
};

export const notifyUser = async ({ userId, type }) => {
  if (userId == null || !NOTIFICATION_MESSAGES[type]) {
    return;
  }

  try {
    await insertNotification({
      userId,
      type,
      message: NOTIFICATION_MESSAGES[type],
    });
  } catch {
    return;
  }
};
