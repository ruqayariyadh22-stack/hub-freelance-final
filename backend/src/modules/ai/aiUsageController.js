import { getAiUsage } from './aiUsageService.js';

export const getUsage = async (req, res) => {
  const data = await getAiUsage(req.user);

  res.status(200).json({
    success: true,
    data,
  });
};
