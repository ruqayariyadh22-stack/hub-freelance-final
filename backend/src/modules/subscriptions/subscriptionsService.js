import { AppError } from '../../utils/appError.js';
import { withTransaction } from '../../config/db.js';
import { findFreelancerProfileByUserId } from '../proposals/proposalsPersistence.js';
import { persistenceNotConfigured } from '../../utils/persistence.js';
import { validateMoneyAmount } from '../wallet/money.js';
import {
  insertTransaction,
  lockWalletByUserId,
  updateWalletBalancesById,
} from '../wallet/walletPersistence.js';
import { clearFeaturedServicesByFreelancerId } from '../freelancer/services/servicesPersistence.js';
import {
  extendSubscriptionEndDate,
  findActiveSubscriptionByFreelancerId,
  insertSubscription,
  listSubscriptionsByFreelancerId,
  lockActiveSubscriptionByFreelancerId,
  markSubscriptionCancelAtPeriodEnd,
} from './subscriptionsPersistence.js';

import {
  MONTHLY_ADS_LIMIT,
  PAID_ENTITLEMENTS,
  isPaidEntitlement,
} from './entitlements.js';

export { MONTHLY_ADS_LIMIT, PAID_ENTITLEMENTS, isPaidEntitlement };

const FREELANCER_PRO_PLAN = {
  plan_type: 'Freelancer Pro',
  price: 25000,
  duration_days: 30,
  currency: 'IQD',
  benefits: [
    'Priority Support',
    'Free-to-Choose Contract',
    '2 Monthly Advertisements',
    'Featured Services',
    'Advanced Statistics',
  ],
};

const TRANSACTION_TYPE_WITHDRAWAL = 'withdrawal';

const toPublicSubscription = (subscription) => ({
  id: subscription.id,
  freelancer_id: subscription.freelancer_id,
  plan_type: subscription.plan_type,
  price: subscription.price,
  start_date: subscription.start_date,
  end_date: subscription.end_date,
  status: subscription.status,
  payment_status: subscription.payment_status,
  cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
});

const parseStoredMoney = (value, field) => {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'number') {
    return validateMoneyAmount(value, field);
  }

  if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim())) {
    return validateMoneyAmount(Number(value), field);
  }

  throw new AppError('Validation failed', 400, [
    { field, message: `${field} must be a finite number` },
  ]);
};

const requireFreelancerProfile = async (actor) => {
  const profile = await findFreelancerProfileByUserId(actor.id);

  if (!profile) {
    throw new AppError('Freelancer not found', 404);
  }

  return profile;
};

const requireCurrentSubscription = (subscription) => {
  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }

  return subscription;
};

const requireLockedWallet = async (actor, client) => {
  const wallet = await lockWalletByUserId(actor.id, client);

  if (!wallet) {
    throw new AppError('Wallet not found', 404);
  }

  return wallet;
};

const deductPlanFromWallet = async (wallet, client) => {
  const price = FREELANCER_PRO_PLAN.price;
  const available = parseStoredMoney(wallet.balance, 'balance');

  if (available < price) {
    throw new AppError('Insufficient wallet balance', 409);
  }

  const updatedWallet = await updateWalletBalancesById(
    wallet.id,
    { balanceDelta: -price, escrowDelta: 0 },
    client,
  );

  if (!updatedWallet) {
    throw new AppError('Wallet not found', 404);
  }

  await insertTransaction(
    {
      walletId: updatedWallet.id,
      contractId: null,
      type: TRANSACTION_TYPE_WITHDRAWAL,
      commission: null,
      amount: price,
    },
    client,
  );

  return updatedWallet;
};

export const listSubscriptionPlans = async () => {
  return [FREELANCER_PRO_PLAN];
};

export const listMySubscriptionHistory = async (actor) => {
  const profile = await requireFreelancerProfile(actor);
  const subscriptions = await listSubscriptionsByFreelancerId(profile.id);
  return subscriptions.map(toPublicSubscription);
};

export const getMySubscription = async (actor) => {
  const profile = await requireFreelancerProfile(actor);

  const subscription = await withTransaction(async (client) => {
    return lockActiveSubscriptionByFreelancerId(profile.id, client);
  });

  return toPublicSubscription(requireCurrentSubscription(subscription));
};

export const subscribe = async (actor) => {
  const profile = await requireFreelancerProfile(actor);

  try {
    return await withTransaction(async (client) => {
      const wallet = await requireLockedWallet(actor, client);
      const active = await lockActiveSubscriptionByFreelancerId(
        profile.id,
        client,
      );

      if (active) {
        throw new AppError('An active subscription already exists', 409);
      }

      await deductPlanFromWallet(wallet, client);

      const created = await insertSubscription(
        {
          freelancerId: profile.id,
          planType: FREELANCER_PRO_PLAN.plan_type,
          price: FREELANCER_PRO_PLAN.price,
        },
        client,
      );

      return toPublicSubscription(created);
    });
  } catch (error) {
    if (error?.code === '23505') {
      throw new AppError('An active subscription already exists', 409);
    }

    throw error;
  }
};

export const cancelMySubscription = async (actor) => {
  const profile = await requireFreelancerProfile(actor);

  return withTransaction(async (client) => {
    const current = requireCurrentSubscription(
      await lockActiveSubscriptionByFreelancerId(profile.id, client),
    );

    if (current.cancel_at_period_end) {
      return toPublicSubscription(current);
    }

    const updated = await markSubscriptionCancelAtPeriodEnd(current.id, client);
    return toPublicSubscription(requireCurrentSubscription(updated));
  });
};

export const renewMySubscription = async (actor) => {
  const profile = await requireFreelancerProfile(actor);

  try {
    return await withTransaction(async (client) => {
      const wallet = await requireLockedWallet(actor, client);
      const current = requireCurrentSubscription(
        await lockActiveSubscriptionByFreelancerId(profile.id, client),
      );

      if (current.cancel_at_period_end) {
        throw new AppError(
          'Subscription is set to cancel at period end',
          409,
        );
      }

      await deductPlanFromWallet(wallet, client);

      const renewed = await extendSubscriptionEndDate(current.id, client);

      if (!renewed) {
        throw new AppError('Subscription not found', 404);
      }

      return toPublicSubscription(renewed);
    });
  } catch (error) {
    if (error?.code === '23505') {
      throw new AppError('An active subscription already exists', 409);
    }

    throw error;
  }
};

export const assertPaidEntitlement = async (actor, entitlement, executor) => {
  if (!actor?.id) {
    throw new AppError('Authentication required', 401);
  }

  if (!isPaidEntitlement(entitlement)) {
    throw new AppError('Validation failed', 400, [
      { field: 'entitlement', message: 'Entitlement is invalid' },
    ]);
  }

  const profile = await requireFreelancerProfile(actor);

  const resolveCurrent = (client) =>
    lockActiveSubscriptionByFreelancerId(profile.id, client);

  const subscription = executor
    ? await resolveCurrent(executor)
    : await withTransaction(resolveCurrent);

  if (!subscription) {
    await clearFeaturedServicesByFreelancerId(profile.id);
    throw new AppError('Forbidden: insufficient role', 403);
  }

  return {
    profile,
    subscription: toPublicSubscription(subscription),
    entitlement,
  };
};

export const assertMonthlyAdsAvailable = async (actor) => {
  // Subscription expiry must not affect contracts that are already in progress.
  persistenceNotConfigured();
};
