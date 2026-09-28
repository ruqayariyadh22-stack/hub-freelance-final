import {
  validateConversationIdParam,
  validateCreateMessage,
} from './chatValidation.js';
import {
  createMessage,
  listConversations,
  listMessages,
} from './chatService.js';

export const list = async (req, res) => {
  const data = await listConversations(req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const listByConversation = async (req, res) => {
  const conversationId = validateConversationIdParam(req.params.id);
  const data = await listMessages(conversationId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const create = async (req, res) => {
  const conversationId = validateConversationIdParam(req.params.id);
  const payload = validateCreateMessage(req.body);
  const data = await createMessage(conversationId, req.user, payload);

  res.status(201).json({
    success: true,
    data,
  });
};
