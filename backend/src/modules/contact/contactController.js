import { validateCreateContact } from './contactValidation.js';
import { submitContact } from './contactService.js';

export const create = async (req, res) => {
  const payload = validateCreateContact(req.body);
  const data = await submitContact(payload);

  res.status(201).json({
    success: true,
    data,
  });
};
