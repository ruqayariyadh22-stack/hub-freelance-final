import { AppError } from '../../utils/appError.js';
import { analyzeProject } from '../ai/project-analysis/projectAnalysisService.js';
import { analyzeBudget } from '../ai/budget-analysis/budgetAnalysisService.js';
import {
  findFreelancerProfileById,
  listFreelancerProfiles,
  updateFreelancerProfileById,
} from './freelancerPersistence.js';

const toPublicFreelancer = (profile) => ({
  id: profile.id,
  user_id: profile.user_id,
  specialty_id: profile.specialty_id,
  bio: profile.bio,
  experience_years: profile.experience_years,
  rating_avg: profile.rating_avg,
  completed_projects_count: profile.completed_projects_count,
  subscription_status: profile.subscription_status,
});

const requireFreelancerProfile = (profile) => {
  if (!profile) {
    throw new AppError('Freelancer not found', 404);
  }

  return toPublicFreelancer(profile);
};

const rethrowProfileWriteError = (error) => {
  if (error?.code === '23503') {
    throw new AppError('Validation failed', 400, [
      { field: 'specialty_id', message: 'Specialty is invalid' },
    ]);
  }

  throw error;
};

export const listFreelancers = async (actor) => {
  const profiles = await listFreelancerProfiles();
  return profiles.map(toPublicFreelancer);
};

export const getFreelancerById = async (freelancerId) => {
  const profile = await findFreelancerProfileById(freelancerId);
  return requireFreelancerProfile(profile);
};

export const updateFreelancerById = async (freelancerId, actor, payload) => {
  const profile = await findFreelancerProfileById(freelancerId);
  requireFreelancerProfile(profile);

  if (!actor?.id || actor.id !== profile.user_id) {
    throw new AppError('Forbidden: insufficient role', 403);
  }

  try {
    const updated = await updateFreelancerProfileById(freelancerId, payload);
    return requireFreelancerProfile(updated);
  } catch (error) {
    rethrowProfileWriteError(error);
  }
};

export const requestProjectAnalysis = async (actor, payload) => {
  return analyzeProject(actor, payload);
};

export const requestBudgetAnalysis = async (actor, payload) => {
  return analyzeBudget(actor, payload);
};
