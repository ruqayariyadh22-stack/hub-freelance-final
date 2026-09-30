import { query } from '../../../config/db.js';

const CONVERSATION_COLUMNS = `
  id,
  client_id,
  freelancer_id,
  project_id
`;

const MESSAGE_COLUMNS = `
  id,
  conversation_id,
  sender_id,
  message,
  attachments,
  created_at
`;

const runQuery = (executor, text, params) => {
  if (typeof executor === 'function') {
    return executor(text, params);
  }

  return executor.query(text, params);
};

export const findConversationByParticipants = async (
  { clientId, freelancerId, projectId },
  executor = query,
) => {
  const result = await runQuery(
    executor,
    `SELECT ${CONVERSATION_COLUMNS}
     FROM conversations
     WHERE client_id = $1
       AND freelancer_id = $2
       AND project_id = $3`,
    [clientId, freelancerId, projectId],
  );

  return result.rows[0] || null;
};

export const insertConversation = async (
  { clientId, freelancerId, projectId },
  executor = query,
) => {
  const existing = await findConversationByParticipants(
    { clientId, freelancerId, projectId },
    executor,
  );

  if (existing) {
    return existing;
  }

  const result = await runQuery(
    executor,
    `INSERT INTO conversations (
       client_id,
       freelancer_id,
       project_id
     )
     VALUES ($1, $2, $3)
     RETURNING ${CONVERSATION_COLUMNS}`,
    [clientId, freelancerId, projectId],
  );

  return result.rows[0];
};

export const listConversationsForUser = async (userId) => {
  const result = await query(
    `SELECT ${CONVERSATION_COLUMNS}
     FROM conversations
     WHERE client_id = $1
        OR freelancer_id = $1`,
    [userId],
  );

  return result.rows;
};

export const findConversationById = async (conversationId) => {
  const result = await query(
    `SELECT ${CONVERSATION_COLUMNS}
     FROM conversations
     WHERE id = $1`,
    [conversationId],
  );

  return result.rows[0] || null;
};

export const listMessagesByConversationId = async (conversationId) => {
  const result = await query(
    `SELECT ${MESSAGE_COLUMNS}
     FROM messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC, id ASC`,
    [conversationId],
  );

  return result.rows;
};

export const insertMessage = async ({
  conversationId,
  senderId,
  message,
  attachments,
}) => {
  const result = await query(
    `INSERT INTO messages (
       conversation_id,
       sender_id,
       message,
       attachments
     )
     VALUES ($1, $2, $3, $4)
     RETURNING ${MESSAGE_COLUMNS}`,
    [conversationId, senderId, message, attachments],
  );

  return result.rows[0];
};
