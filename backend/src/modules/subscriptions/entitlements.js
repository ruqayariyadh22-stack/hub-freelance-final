export const PAID_ENTITLEMENTS = {
  PRIORITY_SUPPORT: 'priority_support',
  FLEXIBLE_CONTRACT_CHOICE: 'flexible_contract_choice',
  MONTHLY_ADS: 'monthly_ads',
  FEATURED_SERVICES: 'featured_services',
  ADVANCED_STATISTICS: 'advanced_statistics',
};

/**
 * Client-paid AI entitlement identifier granted by an active Client AI subscription.
 */
export const CLIENT_PAID_AI_ENTITLEMENTS = {
  DESCRIPTION_ASSISTANT: 'description_assistant',
};

/** Plan type stored on subscriptions for Client premium AI access. */
export const CLIENT_AI_PLAN_TYPE = 'Client AI';

/** Fixed Client AI subscription price (IQD). */
export const CLIENT_AI_PLAN_PRICE = 15000;

/** Fixed Client AI subscription duration in days. */
export const CLIENT_AI_PLAN_DURATION_DAYS = 30;

export const MONTHLY_ADS_LIMIT = 2;

/** Free Client freelancer-matching requests per calendar month. */
export const MONTHLY_CLIENT_FREELANCER_MATCHING_LIMIT = 5;

const PAID_ENTITLEMENT_VALUES = Object.freeze(
  Object.values(PAID_ENTITLEMENTS),
);

const CLIENT_PAID_AI_ENTITLEMENT_VALUES = Object.freeze(
  Object.values(CLIENT_PAID_AI_ENTITLEMENTS),
);

export const isPaidEntitlement = (entitlement) => {
  return PAID_ENTITLEMENT_VALUES.includes(entitlement);
};

export const isClientPaidAiEntitlement = (entitlement) => {
  return CLIENT_PAID_AI_ENTITLEMENT_VALUES.includes(entitlement);
};

export const clientAiPlanGrantsEntitlement = (planType, entitlement) => {
  if (planType !== CLIENT_AI_PLAN_TYPE) {
    return false;
  }

  return isClientPaidAiEntitlement(entitlement);
};
