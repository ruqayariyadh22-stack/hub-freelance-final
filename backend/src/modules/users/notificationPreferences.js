export const NOTIFICATION_PREFERENCE_KEYS = [
  'email_notifications',
  'proposal_updates',
  'project_updates',
  'payment_updates',
  'dispute_updates',
];

const DEFAULT_PREFERENCES = Object.freeze(
  Object.fromEntries(NOTIFICATION_PREFERENCE_KEYS.map((key) => [key, true])),
);

export const withDefaultPreferences = (stored) => {
  const result = { ...DEFAULT_PREFERENCES };

  if (stored && typeof stored === 'object') {
    for (const key of NOTIFICATION_PREFERENCE_KEYS) {
      if (typeof stored[key] === 'boolean') {
        result[key] = stored[key];
      }
    }
  }

  return result;
};
