import { validateProjectAnalysisBody } from './projectAnalysisValidation.js';
import { requestProjectAnalysis } from '../../freelancer/freelancerService.js';

export const create = async (req, res) => {
  const payload = validateProjectAnalysisBody(req.body);
  const data = await requestProjectAnalysis(req.user, payload);

  res.status(201).json({
    success: true,
    data,
  });
};
