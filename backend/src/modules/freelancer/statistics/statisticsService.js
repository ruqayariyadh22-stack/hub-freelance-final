import {
  PAID_ENTITLEMENTS,
  assertPaidEntitlement,
} from '../../subscriptions/subscriptionsService.js';
import { findFreelancerStatisticsByFreelancerId } from './statisticsPersistence.js';

const toCount = (value) => {
  const count = Number(value);
  return Number.isFinite(count) ? count : 0;
};

const toMoney = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }

  const amount = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const toAcceptanceRate = (acceptedProposals, totalProposals) => {
  if (totalProposals === 0) {
    return 0;
  }

  return Math.round((acceptedProposals / totalProposals) * 100);
};

const toPublicStatistics = (row) => {
  const totalProposals = toCount(row.total_proposals);
  const acceptedProposals = toCount(row.accepted_proposals);

  return {
    total_projects: toCount(row.total_projects),
    completed_projects: toCount(row.completed_projects),
    active_projects: toCount(row.active_projects),
    total_proposals: totalProposals,
    accepted_proposals: acceptedProposals,
    proposal_acceptance_rate: toAcceptanceRate(
      acceptedProposals,
      totalProposals,
    ),
    total_contracts: toCount(row.total_contracts),
    total_earnings: toMoney(row.total_earnings),
  };
};

export const getMyStatistics = async (actor) => {
  const { profile } = await assertPaidEntitlement(
    actor,
    PAID_ENTITLEMENTS.ADVANCED_STATISTICS,
  );

  const row = await findFreelancerStatisticsByFreelancerId(profile.id);
  return toPublicStatistics(row);
};
