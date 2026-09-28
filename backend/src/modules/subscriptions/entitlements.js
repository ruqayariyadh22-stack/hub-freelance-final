export const PAID_ENTITLEMENTS = {
  PRIORITY_SUPPORT: 'priority_support',
  FLEXIBLE_CONTRACT_CHOICE: 'flexible_contract_choice',
  MONTHLY_ADS: 'monthly_ads',
  FEATURED_SERVICES: 'featured_services',
  ADVANCED_STATISTICS: 'advanced_statistics',
};

export const MONTHLY_ADS_LIMIT = 2;

const PAID_ENTITLEMENT_VALUES = Object.freeze(
  Object.values(PAID_ENTITLEMENTS),
);

export const isPaidEntitlement = (entitlement) => {
  return PAID_ENTITLEMENT_VALUES.includes(entitlement);
};
