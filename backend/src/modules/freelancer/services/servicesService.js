import { AppError } from '../../../utils/appError.js';
import { findFreelancerProfileById } from '../freelancerPersistence.js';
import {
  PAID_ENTITLEMENTS,
  assertPaidEntitlement,
} from '../../subscriptions/subscriptionsService.js';
import {
  findActiveSubscriptionByFreelancerId,
  settleDueSubscriptionsByFreelancerId,
} from '../../subscriptions/subscriptionsPersistence.js';
import {
  clearFeaturedServicesByFreelancerId,
  deleteServiceById as deleteServiceRow,
  findFreelancerProfileByUserId,
  findServiceById,
  insertService,
  listServicesByFreelancerId,
  updateServiceById as updateServiceRow,
  updateServiceFeaturedById,
} from './servicesPersistence.js';

const toPublicService = (service) => ({
  id: service.id,
  freelancer_id: service.freelancer_id,
  title: service.title,
  description: service.description,
  category: service.category,
  price: service.price,
  delivery_time: service.delivery_time,
  status: service.status,
  is_featured: Boolean(service.is_featured),
});

const requireFreelancerProfile = (profile) => {
  if (!profile) {
    throw new AppError('Freelancer not found', 404);
  }

  return profile;
};

const requireService = (service) => {
  if (!service) {
    throw new AppError('Service not found', 404);
  }

  return toPublicService(service);
};

const assertServiceOwner = async (service, actor) => {
  const profile = await findFreelancerProfileById(service.freelancer_id);
  requireFreelancerProfile(profile);

  if (!actor?.id || actor.id !== profile.user_id) {
    throw new AppError('Forbidden: insufficient role', 403);
  }
};

export const listFreelancerServices = async (freelancerId) => {
  const profile = await findFreelancerProfileById(freelancerId);
  requireFreelancerProfile(profile);

  await settleDueSubscriptionsByFreelancerId(profile.id);
  const active = await findActiveSubscriptionByFreelancerId(profile.id);

  if (!active) {
    await clearFeaturedServicesByFreelancerId(profile.id);
  }

  const services = await listServicesByFreelancerId(profile.id);
  return services.map(toPublicService);
};

export const createService = async (actor, payload) => {
  const profile = await findFreelancerProfileByUserId(actor.id);
  requireFreelancerProfile(profile);

  const created = await insertService(profile.id, payload);
  return toPublicService(created);
};

export const updateServiceById = async (serviceId, actor, payload) => {
  const service = await findServiceById(serviceId);
  requireService(service);
  await assertServiceOwner(service, actor);

  const updated = await updateServiceRow(serviceId, payload);
  return requireService(updated);
};

export const deleteServiceById = async (serviceId, actor) => {
  const service = await findServiceById(serviceId);
  requireService(service);
  await assertServiceOwner(service, actor);

  const deleted = await deleteServiceRow(serviceId);
  return requireService(deleted);
};

export const featureServiceById = async (serviceId, actor) => {
  const service = await findServiceById(serviceId);
  requireService(service);
  await assertServiceOwner(service, actor);
  await assertPaidEntitlement(actor, PAID_ENTITLEMENTS.FEATURED_SERVICES);

  const featured = await updateServiceFeaturedById(serviceId, true);
  return requireService(featured);
};

export const unfeatureServiceById = async (serviceId, actor) => {
  const service = await findServiceById(serviceId);
  requireService(service);
  await assertServiceOwner(service, actor);

  const unfeatured = await updateServiceFeaturedById(serviceId, false);
  return requireService(unfeatured);
};
