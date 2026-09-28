import { validateDescriptionAssistantBody } from './descriptionAssistantValidation.js';
import { requestDescriptionAssistant } from '../../client/clientService.js';

export const create = async (req, res) => {
  const payload = validateDescriptionAssistantBody(req.body);
  const data = await requestDescriptionAssistant(req.user, payload);

  res.status(201).json({
    success: true,
    data,
  });
};
