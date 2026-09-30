import { AppError } from '../../../utils/appError.js';
import { findFreelancerProfileById } from '../freelancerPersistence.js';
import {
  findFreelancerSkill,
  findSkillById,
  insertFreelancerSkill,
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

  const skill = await findSkillById(payload.skill_id);

  if (!skill) {
    throw new AppError('Skill not found', 404);
  }

  const existing = await findFreelancerSkill(freelancerId, payload.skill_id);

  if (existing) {
    throw new AppError('Skill is already assigned', 409);
  }

  const link = await insertFreelancerSkill(freelancerId, payload.skill_id);
  return toPublicFreelancerSkill(link);
};
