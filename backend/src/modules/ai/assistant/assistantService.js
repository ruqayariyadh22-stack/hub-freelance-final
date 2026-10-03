import { AppError } from '../../../utils/appError.js';
import { runMeteredAiCompletion } from '../aiUsageService.js';
import { countUsageLogsForUserActionOnCurrentDate } from '../aiPersistence.js';

export const ASSISTANT_ACTION = 'assistant';
export const DAILY_ASSISTANT_LIMIT = 20;

const assertDailyAssistantUsage = async (actor, executor) => {
  const used = await countUsageLogsForUserActionOnCurrentDate(
    actor.id,
    ASSISTANT_ACTION,
    executor,
  );

  if (used >= DAILY_ASSISTANT_LIMIT) {
    throw new AppError('Daily AI assistant limit reached', 429);
  }
};

export const askAssistant = async (actor, { message, history }) => {
  const { result } = await runMeteredAiCompletion({
    actor,
    action: ASSISTANT_ACTION,
    context: { role: actor.role, message, history },
    assertUsage: assertDailyAssistantUsage,
  });

  const reply = typeof result === 'string' ? result.trim() : '';

  if (!reply) {
    throw new AppError('Unable to complete AI request', 503);
  }

  const used = await countUsageLogsForUserActionOnCurrentDate(actor.id, ASSISTANT_ACTION);

  return {
    reply,
    usage: {
      limit: DAILY_ASSISTANT_LIMIT,
      used,
      remaining: Math.max(0, DAILY_ASSISTANT_LIMIT - used),
    },
  };
};
