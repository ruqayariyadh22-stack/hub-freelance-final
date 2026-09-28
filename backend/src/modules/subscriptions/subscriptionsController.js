import {
  validateLifecycleBody,
  validateSubscribeBody,
} from './subscriptionsValidation.js';
import {
  cancelMySubscription,
  getMySubscription,
  listSubscriptionPlans,
  renewMySubscription,
  subscribe,
} from './subscriptionsService.js';

export const listPlans = async (req, res) => {
  const data = await listSubscriptionPlans(req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const create = async (req, res) => {
  validateSubscribeBody(req.body);
  const data = await subscribe(req.user);

  res.status(201).json({
    success: true,
    data,
  });
};

export const getMe = async (req, res) => {
  const data = await getMySubscription(req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const cancel = async (req, res) => {
  validateLifecycleBody(req.body);
  const data = await cancelMySubscription(req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const renew = async (req, res) => {
  validateLifecycleBody(req.body);
  const data = await renewMySubscription(req.user);

  res.status(200).json({
    success: true,
    data,
  });
};
