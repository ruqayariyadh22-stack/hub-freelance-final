import { performAiAction } from '../aiUsageService.js';

export const analyzeBudget = async (actor) => {
  // AI is an advisor only. It does not set budgets or execute payments.
  return performAiAction(actor, 'budget-analysis');
};
