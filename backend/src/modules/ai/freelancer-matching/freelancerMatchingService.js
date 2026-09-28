import { performAiAction } from '../aiUsageService.js';

export const matchFreelancers = async (actor) => {
  // AI is an advisor only. It does not accept proposals or choose a freelancer.
  return performAiAction(actor, 'freelancer-matching');
};
