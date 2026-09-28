import { validateCreateAdvertisement } from './advertisementsValidation.js';
import {
  createAdvertisement,
  listAdvertisements,
  listMyAdvertisements,
} from './advertisementsService.js';

export const create = async (req, res) => {
  const payload = validateCreateAdvertisement(req.body);
  const data = await createAdvertisement(req.user, payload);

  res.status(201).json({
    success: true,
    data,
  });
};

export const listMine = async (req, res) => {
  const data = await listMyAdvertisements(req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const listPublic = async (req, res) => {
  const data = await listAdvertisements();

  res.status(200).json({
    success: true,
    data,
  });
};
