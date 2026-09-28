import {
  validateCreateProject,
  validateProjectIdParam,
  validateUpdateProject,
} from './projectsValidation.js';
import {
  createProject,
  deleteProjectById,
  getProjectById,
  listProjects,
  updateProjectById,
} from './projectsService.js';

export const create = async (req, res) => {
  const payload = validateCreateProject(req.body);
  const data = await createProject(req.user, payload);

  res.status(201).json({
    success: true,
    data,
  });
};

export const list = async (req, res) => {
  const data = await listProjects(req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const getById = async (req, res) => {
  const projectId = validateProjectIdParam(req.params.id);
  const data = await getProjectById(projectId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const updateById = async (req, res) => {
  const projectId = validateProjectIdParam(req.params.id);
  const payload = validateUpdateProject(req.body);
  const data = await updateProjectById(projectId, req.user, payload);

  res.status(200).json({
    success: true,
    data,
  });
};

export const removeById = async (req, res) => {
  const projectId = validateProjectIdParam(req.params.id);
  const data = await deleteProjectById(projectId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};
