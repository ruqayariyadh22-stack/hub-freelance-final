import { AppError } from '../../utils/appError.js';
import { findClientProfileById } from '../client/clientPersistence.js';
import { findFreelancerProfileById } from '../freelancer/freelancerPersistence.js';
import { findClientProfileByUserId } from '../projects/projectsPersistence.js';
import { findFreelancerProfileByUserId } from '../proposals/proposalsPersistence.js';
import { findContractById } from '../workspace/contracts/contractsPersistence.js';
import {
  insertReview,
  listReviewsByRevieweeId,
} from './reviewsPersistence.js';

const toPublicReview = (review) => ({
  id: review.id,
  contract_id: review.contract_id,
  reviewer_id: review.reviewer_id,
  reviewee_id: review.reviewee_id,
  rating: review.rating,
  comment: review.comment,
});

const requireContract = (contract) => {
  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  return contract;
};

const requireFreelancerProfile = (profile) => {
  if (!profile) {
    throw new AppError('Freelancer not found', 404);
  }

  return profile;
};

const resolveRevieweeUserId = async (contract, actor) => {
  if (actor?.role === 'client') {
    const clientProfile = await findClientProfileByUserId(actor.id);

    if (clientProfile && clientProfile.id === contract.client_id) {
      const freelancerProfile = await findFreelancerProfileById(
        contract.freelancer_id,
      );

      if (!freelancerProfile) {
        throw new AppError('Freelancer not found', 404);
      }

      return freelancerProfile.user_id;
    }
  }

  if (actor?.role === 'freelancer') {
    const freelancerProfile = await findFreelancerProfileByUserId(actor.id);

    if (freelancerProfile && freelancerProfile.id === contract.freelancer_id) {
      const clientProfile = await findClientProfileById(contract.client_id);

      if (!clientProfile) {
        throw new AppError('Client not found', 404);
      }

      return clientProfile.user_id;
    }
  }

  throw new AppError('Forbidden: insufficient role', 403);
};

export const createContractReview = async (contractId, actor, payload) => {
  // Reviews are independent of wallet/release.
  const contract = requireContract(await findContractById(contractId));
  const revieweeId = await resolveRevieweeUserId(contract, actor);

  const created = await insertReview({
    contractId: contract.id,
    reviewerId: actor.id,
    revieweeId,
    rating: payload.rating ?? null,
    comment: payload.comment ?? null,
  });

  return toPublicReview(created);
};

export const listFreelancerReviews = async (freelancerId) => {
  const profile = requireFreelancerProfile(
    await findFreelancerProfileById(freelancerId),
  );
  const reviews = await listReviewsByRevieweeId(profile.user_id);
  return reviews.map(toPublicReview);
};
