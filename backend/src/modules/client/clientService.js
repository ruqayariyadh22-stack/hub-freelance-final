import { AppError } from '../../utils/appError.js';
import { matchFreelancers } from '../ai/freelancer-matching/freelancerMatchingService.js';
import { assistDescription } from '../ai/description-assistant/descriptionAssistantService.js';
import { listProjectsForClient } from '../projects/projectsService.js';
import {
  findClientProfileById,
  updateClientProfileById,
} from './clientPersistence.js';

const toPublicClient = (profile) => ({
  id: profile.id,
  user_id: profile.user_id,
  company_name: profile.company_name,
  logo: profile.logo,
});

const requireClientProfile = (profile) => {
  if (!profile) {
    throw new AppError('Client not found', 404);
  }

  return toPublicClient(profile);
};

export const getClientById = async (clientId) => {
  const profile = await findClientProfileById(clientId);
  return requireClientProfile(profile);
};

export const updateClientById = async (clientId, actor, payload) => {
  const profile = await findClientProfileById(clientId);
  requireClientProfile(profile);

  if (!actor?.id || actor.id !== profile.user_id) {
    throw new AppError('Forbidden: insufficient role', 403);
  }

  const updated = await updateClientProfileById(clientId, payload);
  return requireClientProfile(updated);
};

export const getClientProjects = async (clientId, actor) => {
  return listProjectsForClient(clientId, actor);
};

export const requestFreelancerMatching = async (actor, payload) => {
  return matchFreelancers(actor, payload);
};

export const requestDescriptionAssistant = async (actor, payload) => {
  return assistDescription(actor, payload);
};
