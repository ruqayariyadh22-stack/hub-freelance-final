import { AppError } from '../../utils/appError.js';
import { findClientProfileById } from '../client/clientPersistence.js';
import {
  NOTIFICATION_TYPES,
  notifyUser,
} from '../notifications/notificationMessages.js';
import {
  deleteProjectById as deleteProjectRow,
  findClientProfileByUserId,
  findProjectById as findProjectRow,
  insertProject,
  listProjects as listProjectRows,
  listProjectsByClientId,
  updateProjectById as updateProjectRow,
} from './projectsPersistence.js';

const toPublicProject = (project) => ({
  id: project.id,
  client_id: project.client_id,
  title: project.title,
  description: project.description,
  category: project.category,
  budget_min: project.budget_min,
  budget_max: project.budget_max,
  duration: project.duration,
  required_skills: project.required_skills,
  attachments: project.attachments,
  status: project.status,
  chosen_freelancer_id: project.chosen_freelancer_id,
  published_at: project.published_at,
});

const requireClientProfile = (profile) => {
  if (!profile) {
    throw new AppError('Client not found', 404);
  }

  return profile;
};

const requireProject = (project) => {
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return toPublicProject(project);
};

const assertProjectOwner = async (project, actor) => {
  const profile = await findClientProfileById(project.client_id);
  requireClientProfile(profile);

  if (!actor?.id || actor.id !== profile.user_id) {
    throw new AppError('Forbidden: insufficient role', 403);
  }
};

export const createProject = async (actor, payload) => {
  const profile = await findClientProfileByUserId(actor.id);
  requireClientProfile(profile);

  const created = await insertProject(profile.id, payload);
  return toPublicProject(created);
};

export const listProjects = async (actor) => {
  const projects = await listProjectRows();
  return projects.map(toPublicProject);
};

export const listProjectsForClient = async (clientId, actor) => {
  const profile = await findClientProfileById(clientId);
  requireClientProfile(profile);

  if (!actor?.id || actor.id !== profile.user_id) {
    throw new AppError('Forbidden: insufficient role', 403);
  }

  const projects = await listProjectsByClientId(profile.id);
  return projects.map(toPublicProject);
};

export const getProjectById = async (projectId, actor) => {
  const project = await findProjectRow(projectId);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  if (project.status !== 'open') {
    const profile = await findClientProfileById(project.client_id);

    if (!profile || !actor?.id || actor.id !== profile.user_id) {
      throw new AppError('Project not found', 404);
    }
  }

  return toPublicProject(project);
};

export const updateProjectById = async (projectId, actor, payload) => {
  const project = await findProjectRow(projectId);
  requireProject(project);
  await assertProjectOwner(project, actor);

  if (payload?.status === 'in_progress') {
    throw new AppError('Validation failed', 400, [
      {
        field: 'status',
        message: 'Status must be draft, open, completed, or cancelled',
      },
    ]);
  }

  const previousStatus = project.status;
  const updated = await updateProjectRow(projectId, payload);
  const publicProject = requireProject(updated);

  if (
    Object.prototype.hasOwnProperty.call(payload, 'status') &&
    payload.status !== previousStatus
  ) {
    await notifyUser({
      userId: actor.id,
      type: NOTIFICATION_TYPES.PROJECT_STATUS_CHANGED,
    });
  }

  return publicProject;
};

export const deleteProjectById = async (projectId, actor) => {
  const project = await findProjectRow(projectId);
  requireProject(project);
  await assertProjectOwner(project, actor);

  const deleted = await deleteProjectRow(projectId);
  return requireProject(deleted);
};
