import {
  validateAddSkill,
  validateFreelancerIdParam,
} from './skillsValidation.js';
import {
  addFreelancerSkill,
  listFreelancerSkills,
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
