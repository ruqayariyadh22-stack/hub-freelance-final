import { AppError } from '../../../utils/appError.js';
import { parseEntityId } from '../../../utils/entityId.js';
import { verifyAccessToken } from '../../../utils/jwt.js';
import { findUserById } from '../../users/usersPersistence.js';
import { findConversationById } from './chatPersistence.js';
import { createMessage } from './chatService.js';
import { validateConversationIdParam } from './chatValidation.js';

const conversationRoom = (conversationId) => `conversation:${conversationId}`;

const readHandshakeToken = (socket) => {
  const authToken = socket.handshake.auth?.token;

  if (typeof authToken === 'string' && authToken.trim()) {
    return authToken.trim();
  }

  const header = socket.handshake.headers?.authorization;

  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }

  return '';
};

const authenticateHandshake = async (socket) => {
  const token = readHandshakeToken(socket);

  if (!token) {
    throw new AppError('Authentication required', 401);
  }

  let decoded;

  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }

  const userId = parseEntityId(decoded.sub);

  if (userId === null) {
    throw new AppError('Invalid or expired token', 401);
  }

  const user = await findUserById(userId);

  if (!user) {
    throw new AppError('Invalid or expired token', 401);
  }

  if (user.account_status !== 'active') {
    throw new AppError('Account is disabled', 403);
  }

  if (user.role !== 'client' && user.role !== 'freelancer') {
    throw new AppError('Forbidden: insufficient role', 403);
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    account_status: user.account_status,
  };
};

const reply = (ack, payload) => {
  if (typeof ack === 'function') {
    ack(payload);
  }
};

const toSocketError = (error) => ({
  success: false,
  message: error instanceof AppError ? error.message : 'Unable to complete chat request',
  statusCode: error instanceof AppError ? error.statusCode : 500,
  errors: error instanceof AppError ? error.errors : undefined,
});

const requirePayloadObject = (payload) => {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new AppError('Validation failed', 400, [
      { field: 'body', message: 'Request body must be an object' },
    ]);
  }

  return payload;
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

const loadParticipantConversation = async (conversationId, actor) => {
  const id = validateConversationIdParam(conversationId);
  const conversation = await findConversationById(id);

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  assertConversationParticipant(conversation, actor);
  return conversation;
};

export const attachChatSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      socket.user = await authenticateHandshake(socket);
      next();
    } catch (error) {
      const err = new Error(error instanceof AppError ? error.message : 'Authentication required');
      err.data = toSocketError(error);
      next(err);
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_conversation', async (payload, ack) => {
      try {
        const body = requirePayloadObject(payload);
        const conversation = await loadParticipantConversation(
          body.conversationId,
          socket.user,
        );
        socket.join(conversationRoom(conversation.id));
        reply(ack, { success: true, data: { conversationId: conversation.id } });
      } catch (error) {
        reply(ack, toSocketError(error));
      }
    });

    socket.on('send_message', async (payload, ack) => {
      try {
        const body = requirePayloadObject(payload);
        const conversationId = validateConversationIdParam(body.conversationId);
        const messagePayload = Object.prototype.hasOwnProperty.call(body, 'attachments')
          ? { attachments: body.attachments }
          : {};
        const data = await createMessage(conversationId, socket.user, messagePayload);
        io.to(conversationRoom(data.conversation_id)).emit('message_created', data);
        reply(ack, { success: true, data });
      } catch (error) {
        reply(ack, toSocketError(error));
      }
    });
  });
};
