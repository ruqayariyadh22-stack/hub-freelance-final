import { getMyStatistics } from './statisticsService.js';

export const getMine = async (req, res) => {
  const data = await getMyStatistics(req.user);

  res.status(200).json({
    success: true,
    data,
  });
};
