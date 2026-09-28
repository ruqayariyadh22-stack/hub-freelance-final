import {
  validateClientIdParam,
  validateUpdateClient,
} from './clientValidation.js';
import {
  getClientById,
  getClientProjects,
  updateClientById,
} from './clientService.js';

export const getById = async (req, res) => {
  const clientId = validateClientIdParam(req.params.id);
  const data = await getClientById(clientId);

  res.status(200).json({
    success: true,
    data,
  });
};

export const updateById = async (req, res) => {
  const clientId = validateClientIdParam(req.params.id);
  const payload = validateUpdateClient(req.body);
  const data = await updateClientById(clientId, req.user, payload);

  res.status(200).json({
    success: true,
    data,
  });
};

export const listProjects = async (req, res) => {
  const clientId = validateClientIdParam(req.params.id);
  const data = await getClientProjects(clientId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};
