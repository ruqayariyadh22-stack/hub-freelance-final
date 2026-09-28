import { validateBudgetAnalysisBody } from './budgetAnalysisValidation.js';
import { requestBudgetAnalysis } from '../../freelancer/freelancerService.js';

export const create = async (req, res) => {
  const payload = validateBudgetAnalysisBody(req.body);
  const data = await requestBudgetAnalysis(req.user, payload);

  res.status(201).json({
    success: true,
    data,
  });
};
