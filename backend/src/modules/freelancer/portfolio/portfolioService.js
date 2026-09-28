import { AppError } from '../../../utils/appError.js';
import { findFreelancerProfileById } from '../freelancerPersistence.js';
import {
  deletePortfolioItemById,
  findPortfolioItemById,
  findPortfolioItemsByFreelancerId,
  insertPortfolioItem,
  updatePortfolioItemById,
} from './portfolioPersistence.js';

const toPublicPortfolioItem = (item) => ({
  id: item.id,
  freelancer_id: item.freelancer_id,
  title: item.title,
  description: item.description,
  project_url: item.project_url,
  image_url: item.image_url,
  created_at: item.created_at,
  updated_at: item.updated_at,
});

const requireFreelancerProfile = (profile) => {
  if (!profile) {
    throw new AppError('Freelancer not found', 404);
  }

  return profile;
};

const requireOwnedFreelancerProfile = async (freelancerId, actor) => {
  const profile = requireFreelancerProfile(
    await findFreelancerProfileById(freelancerId),
  );

  if (!actor?.id || actor.id !== profile.user_id) {
    throw new AppError('Forbidden: insufficient role', 403);
  }

  return profile;
};

const requireOwnedPortfolioItem = async (freelancerId, portfolioId, actor) => {
  const profile = await requireOwnedFreelancerProfile(freelancerId, actor);
  const item = await findPortfolioItemById(portfolioId);

  if (!item) {
    throw new AppError('Portfolio item not found', 404);
  }

  if (item.freelancer_id !== profile.id) {
    throw new AppError('Forbidden: insufficient role', 403);
  }

  return { profile, item };
};

export const listFreelancerPortfolioItems = async (freelancerId) => {
  const profile = requireFreelancerProfile(
    await findFreelancerProfileById(freelancerId),
  );
  const items = await findPortfolioItemsByFreelancerId(profile.id);

  return items.map(toPublicPortfolioItem);
};

export const addFreelancerPortfolioItem = async (
  freelancerId,
  actor,
  payload,
) => {
  const profile = await requireOwnedFreelancerProfile(freelancerId, actor);

  try {
    const created = await insertPortfolioItem({
      freelancerId: profile.id,
      title: payload.title,
      description: payload.description,
      projectUrl: payload.project_url,
      imageUrl: payload.image_url,
    });

    return toPublicPortfolioItem(created);
  } catch (error) {
    if (error?.code === '23503') {
      throw new AppError('Freelancer not found', 404);
    }

    throw error;
  }
};

export const updateFreelancerPortfolioItem = async (
  freelancerId,
  portfolioId,
  actor,
  payload,
) => {
  await requireOwnedPortfolioItem(freelancerId, portfolioId, actor);

  const updated = await updatePortfolioItemById(portfolioId, payload);

  if (!updated) {
    throw new AppError('Portfolio item not found', 404);
  }

  return toPublicPortfolioItem(updated);
};

export const deleteFreelancerPortfolioItem = async (
  freelancerId,
  portfolioId,
  actor,
) => {
  await requireOwnedPortfolioItem(freelancerId, portfolioId, actor);

  const deleted = await deletePortfolioItemById(portfolioId);

  if (!deleted) {
    throw new AppError('Portfolio item not found', 404);
  }

  return toPublicPortfolioItem(deleted);
};
