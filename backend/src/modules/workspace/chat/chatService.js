import { AppError } from '../../../utils/appError.js';
import {
  findConversationById,
  insertMessage,
  listConversationsForUser,
  listMessagesByConversationId,
} from './chatPersistence.js';

const toPublicConversation = (conversation) => ({
  id: conversation.id,
  client_id: conversation.client_id,
  freelancer_id: conversation.freelancer_id,
  project_id: conversation.project_id,
});

const toPublicMessage = (message) => ({
  id: message.id,
  conversation_id: message.conversation_id,
  attachments: message.attachments,
});

const requireConversation = (conversation) => {
  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  return toPublicConversation(conversation);
};

const assertConversationParticipant = (conversation, actor) => {
  if (
    actor?.id &&
    (actor.id === conversation.client_id || actor.id === conversation.freelancer_id)
  ) {
    return;
  }

  throw new AppError('Forbidden: insufficient role', 403);
};

const resolveAttachments = (payload = {}) => {
  if (!Object.prototype.hasOwnProperty.call(payload, 'attachments')) {
    return null;
  }

  if (payload.attachments === null || Array.isArray(payload.attachments)) {
    return payload.attachments;
  }

  throw new AppError('Validation failed', 400, [
    { field: 'attachments', message: 'attachments must be an array' },
  ]);
};

export const listConversations = async (actor) => {
  const conversations = await listConversationsForUser(actor.id);
  return conversations.map(toPublicConversation);
};

export const listMessages = async (conversationId, actor) => {
  const conversation = requireConversation(await findConversationById(conversationId));
  assertConversationParticipant(conversation, actor);

  const messages = await listMessagesByConversationId(conversation.id);
  return messages.map(toPublicMessage);
};

export const createMessage = async (conversationId, actor, payload) => {
  const conversation = requireConversation(await findConversationById(conversationId));
  assertConversationParticipant(conversation, actor);

  const created = await insertMessage({
    conversationId: conversation.id,
    attachments: resolveAttachments(payload),
  });

  return toPublicMessage(created);
};
