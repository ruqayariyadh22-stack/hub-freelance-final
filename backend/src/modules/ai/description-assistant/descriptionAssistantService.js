import { AppError } from '../../../utils/appError.js';
import { CLIENT_PAID_AI_ENTITLEMENTS } from '../../subscriptions/entitlements.js';
import { assertClientPaidAiEntitlement } from '../../subscriptions/subscriptionsService.js';
import {
  DESCRIPTION_ASSISTANT_ACTION,
  runMeteredAiCompletion,
} from '../aiUsageService.js';
import { parseJsonFromAiText } from '../geminiClient.js';

const assertDescriptionAssistantEntitlement = async (actor) => {
  await assertClientPaidAiEntitlement(
    actor,
    CLIENT_PAID_AI_ENTITLEMENTS.DESCRIPTION_ASSISTANT,
  );
};

const assertNoFreeDailyLimit = async (_actor, _executor) => {
  // Paid description assistant is gated by entitlement only (no free quota).
};

export const assistDescription = async (actor, payload) => {
  await assertDescriptionAssistantEntitlement(actor);

  const context = {
    idea: payload.idea,
    budget_min: payload.budget_min,
    budget_max: payload.budget_max,
    duration_days: payload.duration_days,
    required_skills: payload.required_skills,
  };

  const { result } = await runMeteredAiCompletion({
    actor,
    action: DESCRIPTION_ASSISTANT_ACTION,
    context,
    assertUsage: assertNoFreeDailyLimit,
  });

  const parsed = parseJsonFromAiText(result);
  const description =
    typeof parsed?.description === 'string' ? parsed.description.trim() : '';

  if (!description) {
    throw new AppError('Unable to complete AI request', 503);
  }

  return {
    description,
    entitlement: CLIENT_PAID_AI_ENTITLEMENTS.DESCRIPTION_ASSISTANT,
  };
};
