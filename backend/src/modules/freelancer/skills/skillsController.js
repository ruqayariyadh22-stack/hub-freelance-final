import {
  validateAddSkill,
  validateFreelancerIdParam,
  validateSkillIdParam,
} from './skillsValidation.js';
import {
  addFreelancerSkill,
  listFreelancerSkills,
  removeFreelancerSkill,
  searchSkillCatalog,
} from './skillsService.js';

export const listSkills = async (req, res) => {
  const freelancerId = validateFreelancerIdParam(req.params.id);
  const data = await listFreelancerSkills(freelancerId);

  res.status(200).json({
    success: true,
    data,
  });
};

export const addSkill = async (req, res) => {
  const freelancerId = validateFreelancerIdParam(req.params.id);
  const payload = validateAddSkill(req.body);
  const data = await addFreelancerSkill(freelancerId, req.user, payload);

  res.status(201).json({
    success: true,
    data,
  });
};

export const removeSkill = async (req, res) => {
  const freelancerId = validateFreelancerIdParam(req.params.id);
  const skillId = validateSkillIdParam(req.params.skillId);
  const data = await removeFreelancerSkill(freelancerId, req.user, skillId);

  res.status(200).json({
    success: true,
    data,
  });
};

export const listCatalog = async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 60) : '';
  const data = await searchSkillCatalog(search);

  res.status(200).json({
    success: true,
    data,
  });
};
