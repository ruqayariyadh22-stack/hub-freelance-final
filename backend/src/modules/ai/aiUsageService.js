import { withTransaction } from '../../config/db.js';
import { AppError } from '../../utils/appError.js';
import { loadAiContext } from './aiContext.js';
import { generateAiCompletion } from './geminiClient.js';
import {
  countUsageLogsForUserActionInCurrentMonth,
  countUsageLogsForUserOnCurrentDate,
  insertUsageLog,
  listUsageLogsByUserId,
  lockUserForAiUsage,
} from './aiPersistence.js';
import { MONTHLY_CLIENT_FREELANCER_MATCHING_LIMIT } from '../subscriptions/entitlements.js';

const DAILY_AI_USAGE_LIMIT = 5;
export const FREELANCER_MATCHING_ACTION = 'freelancer-matching';
export const DESCRIPTION_ASSISTANT_ACTION = 'description-assistant';

const toPublicUsage = (log) => ({
  id: log.id,
  user_id: log.user_id,
  action: log.action ?? null,
  created_at: log.created_at,
});

const requireAuthenticatedActor = (actor) => {
  if (!actor?.id) {
    throw new AppError('Authentication required', 401);
  }
};

export const assertAiUsageAvailable = async (actor, executor) => {
  requireAuthenticatedActor(actor);

  const usageCount = await countUsageLogsForUserOnCurrentDate(
    actor.id,
    executor,
  );

  if (usageCount >= DAILY_AI_USAGE_LIMIT) {
    throw new AppError('Daily AI usage limit reached', 429);
  }
};

export const getMatchingMonthlyUsageSummary = async (actor, executor) => {
  requireAuthenticatedActor(actor);

  const used = await countUsageLogsForUserActionInCurrentMonth(
    actor.id,
    FREELANCER_MATCHING_ACTION,
    executor,
  );

  const limit = MONTHLY_CLIENT_FREELANCER_MATCHING_LIMIT;

  return {
    action: FREELANCER_MATCHING_ACTION,
    period: 'monthly',
    limit,
    used,
    remaining: Math.max(0, limit - used),
    configured: true,
  };
};

export const assertMonthlyMatchingUsageAvailable = async (actor, executor) => {
  requireAuthenticatedActor(actor);

  const usageCount = await countUsageLogsForUserActionInCurrentMonth(
    actor.id,
    FREELANCER_MATCHING_ACTION,
    executor,
  );

  if (usageCount >= MONTHLY_CLIENT_FREELANCER_MATCHING_LIMIT) {
    throw new AppError('Monthly AI matching usage limit reached', 429);
  }
};

export const getAiUsage = async (actor) => {
  requireAuthenticatedActor(actor);
  const logs = await listUsageLogsByUserId(actor.id);
  const matching = await getMatchingMonthlyUsageSummary(actor);

  return {
    logs: logs.map(toPublicUsage),
    freelancer_matching: matching,
  };
};

export const recordAiUsage = async (actor, action = null) => {
  requireAuthenticatedActor(actor);

  try {
    return await withTransaction(async (client) => {
      const lockedUser = await lockUserForAiUsage(actor.id, client);

      if (!lockedUser) {
        throw new AppError('User not found', 404);
      }

      if (action === FREELANCER_MATCHING_ACTION) {
        await assertMonthlyMatchingUsageAvailable(actor, client);
      } else {
        await assertAiUsageAvailable(actor, client);
      }

      const created = await insertUsageLog(
        { userId: actor.id, action },
        client,
      );
      return toPublicUsage(created);
    });
  } catch (error) {
    if (error?.code === '23503') {
      throw new AppError('User not found', 404);
    }

    throw error;
  }
};

/**
 * Shared path for Freelancer AI actions that still use the daily limit.
 * Client matching/description use dedicated services instead.
 */
export const performAiAction = async (actor, action) => {
  requireAuthenticatedActor(actor);
  const context = await loadAiContext(action, actor);

  try {
    return await withTransaction(async (client) => {
      const lockedUser = await lockUserForAiUsage(actor.id, client);

      if (!lockedUser) {
        throw new AppError('User not found', 404);
      }

      await assertAiUsageAvailable(actor, client);
      const result = await generateAiCompletion({ action, context });
      const created = await insertUsageLog(
        { userId: actor.id, action },
        client,
      );

      return {
        ...toPublicUsage(created),
        result,
      };
    });
  } catch (error) {
    if (error?.code === '23503') {
      throw new AppError('User not found', 404);
    }

    throw error;
  }
};

export const runMeteredAiCompletion = async ({
  actor,
  action,
  context,
  assertUsage,
}) => {
  requireAuthenticatedActor(actor);

  try {
    return await withTransaction(async (client) => {
      const lockedUser = await lockUserForAiUsage(actor.id, client);

      if (!lockedUser) {
        throw new AppError('User not found', 404);
      }

      await assertUsage(actor, client);
      const result = await generateAiCompletion({ action, context });
      const created = await insertUsageLog(
        { userId: actor.id, action },
        client,
      );

      return {
        usage: toPublicUsage(created),
        result,
      };
    });
  } catch (error) {
    if (error?.code === '23503') {
      throw new AppError('User not found', 404);
    }

    throw error;
  }
};
