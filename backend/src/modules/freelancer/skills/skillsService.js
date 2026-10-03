import { AppError } from '../../../utils/appError.js';
import { findFreelancerProfileById } from '../freelancerPersistence.js';
import {
  deleteFreelancerSkill,
  findFreelancerSkill,
  findSkillById,
  findSkillByName,
  insertFreelancerSkill,
  insertSkill,
  listSkillCatalog,
  listSkillNamesByFreelancerId,
} from './skillsPersistence.js';

const toPublicFreelancerSkill = (link) => ({
  id: link.id,
  freelancer_id: link.freelancer_id,
  skill_id: link.skill_id,
});

const toPublicSkill = (skill) => ({
  id: skill.id,
  name: skill.name,
});

export const listFreelancerSkills = async (freelancerId) => {
  const profile = await findFreelancerProfileById(freelancerId);

  if (!profile) {
    throw new AppError('Freelancer not found', 404);
  }

  const skills = await listSkillNamesByFreelancerId(freelancerId);
  return skills.map(toPublicSkill);
};

export const addFreelancerSkill = async (freelancerId, actor, payload) => {
  const profile = await findFreelancerProfileById(freelancerId);

  if (!profile) {
    throw new AppError('Freelancer not found', 404);
  }

  if (!actor?.id || actor.id !== profile.user_id) {
    throw new AppError('Forbidden: insufficient role', 403);
  }

  let skill = payload.skill_id ? await findSkillById(payload.skill_id) : null;

  if (!skill && payload.name) {
    skill = (await findSkillByName(payload.name)) || (await insertSkill(payload.name));
  }

  if (!skill) {
    throw new AppError('Skill not found', 404);
  }

  const existing = await findFreelancerSkill(freelancerId, skill.id);

  if (existing) {
    throw new AppError('Skill is already assigned', 409);
  }

  const link = await insertFreelancerSkill(freelancerId, skill.id);
  return { ...toPublicFreelancerSkill(link), name: skill.name };
};

export const removeFreelancerSkill = async (freelancerId, actor, skillId) => {
  const profile = await findFreelancerProfileById(freelancerId);

  if (!profile) {
    throw new AppError('Freelancer not found', 404);
  }

  if (!actor?.id || actor.id !== profile.user_id) {
    throw new AppError('Forbidden: insufficient role', 403);
  }

  const removed = await deleteFreelancerSkill(freelancerId, skillId);

  if (!removed) {
    throw new AppError('Skill is not assigned', 404);
  }

  return { skill_id: skillId };
};

export const searchSkillCatalog = async (search) => {
  const rows = await listSkillCatalog(search);
  return rows.map(toPublicSkill);
};
