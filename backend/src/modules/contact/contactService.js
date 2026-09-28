import { sendContactEmail } from '../../services/emailService.js';

export const submitContact = async (payload) => {
  await sendContactEmail(payload);

  return {
    message: 'Contact message sent successfully',
  };
};
