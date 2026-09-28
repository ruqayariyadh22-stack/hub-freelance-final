import { AppError } from '../../../utils/appError.js';
import { withTransaction } from '../../../config/db.js';
import { findFreelancerProfileByUserId } from '../../proposals/proposalsPersistence.js';
import { findServiceById } from '../services/servicesPersistence.js';
import {
  PAID_ENTITLEMENTS,
  assertPaidEntitlement,
} from '../../subscriptions/subscriptionsService.js';
import {
  incrementMonthlyAdUsage,
  insertAdvertisement,
  listAdvertisementsByFreelancerId,
  listPublicAdvertisements,
} from './advertisementsPersistence.js';

const toOwnerAdvertisement = (advertisement) => ({
  id: advertisement.id,
  freelancer_id: advertisement.freelancer_id,
  service_id: advertisement.service_id,
  subscription_id: advertisement.subscription_id,
  created_at: advertisement.created_at,
});

const toPublicService = (row) => ({
  id: row.service_row_id,
  freelancer_id: row.service_freelancer_id,
  title: row.title,
  description: row.description,
  category: row.category,
  price: row.price,
  delivery_time: row.delivery_time,
  status: row.status,
  is_featured: Boolean(row.is_featured),
});

const toPublicAdvertisement = (row) => ({
  id: row.id,
  freelancer_id: row.freelancer_id,
  service_id: row.service_id,
  created_at: row.created_at,
  service: toPublicService(row),
});

const requireOwnedService = (service, freelancerId) => {
  if (!service) {
    throw new AppError('Service not found', 404);
  }

  if (service.freelancer_id !== freelancerId) {
    throw new AppError('Forbidden: insufficient role', 403);
  }

  return service;
};

export const createAdvertisement = async (actor, payload) => {
  return withTransaction(async (client) => {
    const { profile, subscription } = await assertPaidEntitlement(
      actor,
      PAID_ENTITLEMENTS.MONTHLY_ADS,
      client,
    );

    const service = requireOwnedService(
      await findServiceById(payload.service_id),
      profile.id,
    );

    const usage = await incrementMonthlyAdUsage(
      {
        freelancerId: profile.id,
        subscriptionId: subscription.id,
      },
      client,
    );

    if (!usage) {
      throw new AppError('Monthly advertisement limit reached', 409);
    }

    const created = await insertAdvertisement(
      {
        freelancerId: profile.id,
        serviceId: service.id,
        subscriptionId: subscription.id,
      },
      client,
    );

    return toOwnerAdvertisement(created);
  });
};

export const listMyAdvertisements = async (actor) => {
  const profile = await findFreelancerProfileByUserId(actor.id);

  if (!profile) {
    throw new AppError('Freelancer not found', 404);
  }

  const advertisements = await listAdvertisementsByFreelancerId(profile.id);
  return advertisements.map(toOwnerAdvertisement);
};

export const listAdvertisements = async () => {
  const advertisements = await listPublicAdvertisements();
  return advertisements.map(toPublicAdvertisement);
};
