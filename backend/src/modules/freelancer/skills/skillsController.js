import {
  validateAddSkill,
  validateFreelancerIdParam,
} from './skillsValidation.js';
import { addFreelancerSkill } from './skillsService.js';

export const addSkill = async (req, res) => {
  const freelancerId = validateFreelancerIdParam(req.params.id);
  const payload = validateAddSkill(req.body);
  const data = await addFreelancerSkill(freelancerId, req.user, payload);

  res.status(201).json({
    success: true,
    data,
  });
};
