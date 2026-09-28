import { withTransaction } from '../../config/db.js';
import { AppError } from '../../utils/appError.js';
import { loadAiContext } from './aiContext.js';
import { generateAiCompletion } from './geminiClient.js';
import {
  countUsageLogsForUserOnCurrentDate,
  insertUsageLog,
  listUsageLogsByUserId,
  lockUserForAiUsage,
} from './aiPersistence.js';

const DAILY_AI_USAGE_LIMIT = 5;

const toPublicUsage = (log) => ({
  id: log.id,
  user_id: log.user_id,
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

export const getAiUsage = async (actor) => {
  requireAuthenticatedActor(actor);
  const logs = await listUsageLogsByUserId(actor.id);
  return logs.map(toPublicUsage);
};

export const recordAiUsage = async (actor) => {
  requireAuthenticatedActor(actor);

  try {
    return await withTransaction(async (client) => {
      const lockedUser = await lockUserForAiUsage(actor.id, client);

      if (!lockedUser) {
        throw new AppError('User not found', 404);
      }

      await assertAiUsageAvailable(actor, client);
      const created = await insertUsageLog({ userId: actor.id }, client);
      return toPublicUsage(created);
    });
  } catch (error) {
    if (error?.code === '23503') {
      throw new AppError('User not found', 404);
    }

    throw error;
  }
};

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
      const created = await insertUsageLog({ userId: actor.id }, client);

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
