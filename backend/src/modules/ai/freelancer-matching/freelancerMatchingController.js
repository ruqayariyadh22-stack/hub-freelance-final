import { validateFreelancerMatchingBody } from './freelancerMatchingValidation.js';
import { requestFreelancerMatching } from '../../client/clientService.js';

export const create = async (req, res) => {
  const payload = validateFreelancerMatchingBody(req.body);
  const data = await requestFreelancerMatching(req.user, payload);

  res.status(201).json({
    success: true,
    data,
  });
};
