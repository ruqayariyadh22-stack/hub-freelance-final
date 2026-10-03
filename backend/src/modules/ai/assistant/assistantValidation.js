import { AppError } from '../../../utils/appError.js';

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_TURNS = 10;

export const validateAssistantBody = (body = {}) => {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Validation failed', 400, [
      { field: 'body', message: 'Request body must be an object' },
    ]);
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!message) {
    throw new AppError('Validation failed', 400, [
      { field: 'message', message: 'Message is required' },
    ]);
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new AppError('Validation failed', 400, [
      {
        field: 'message',
        message: `Message must be at most ${MAX_MESSAGE_LENGTH} characters`,
      },
    ]);
  }

  const history = Array.isArray(body.history)
    ? body.history
        .filter(
          (turn) =>
            turn &&
            (turn.role === 'user' || turn.role === 'assistant') &&
            typeof turn.text === 'string' &&
            turn.text.trim(),
        )
        .slice(-MAX_HISTORY_TURNS)
        .map((turn) => ({
          role: turn.role,
          text: turn.text.trim().slice(0, MAX_MESSAGE_LENGTH),
        }))
    : [];

  return { message, history };
};
