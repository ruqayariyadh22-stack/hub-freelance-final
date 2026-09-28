import { performAiAction } from '../aiUsageService.js';

export const assistDescription = async (actor) => {
  // AI is an advisor only. It does not publish projects or change project status.
  return performAiAction(actor, 'description-assistant');
};
