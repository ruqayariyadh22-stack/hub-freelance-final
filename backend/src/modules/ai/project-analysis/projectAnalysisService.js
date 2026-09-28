import { performAiAction } from '../aiUsageService.js';

export const analyzeProject = async (actor) => {
  // AI is an advisor only. It does not approve, reject, or modify projects.
  return performAiAction(actor, 'project-analysis');
};
