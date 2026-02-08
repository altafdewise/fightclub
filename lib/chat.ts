import { query, transaction } from "./db";
import { getClientSession, getAdminSession, getHQSession } from "./auth";

export type ChatRole = "client" | "trainer" | "hq";

export type Conversation = {
  id: string;
  client_id: string;
  trainer_id: string;
  created_at: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: ChatRole;
  sender_type: "client" | "trainer";
  client_id: string | null;
  trainer_id: string | null;
  message_text: string | null;
  image_url: string | null;
  client_temp_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

type ConversationAccess = {
  role: ChatRole;
  userId: string;
};

export async function getAssignedTrainerId(clientId: string): Promise<string | null> {
  const result = await query<{ trainer_id: string }>(
    "SELECT trainer_id FROM client_trainer_assignments WHERE client_id = $1 LIMIT 1",
    [clientId]
  );
  return result.rows[0]?.trainer_id || null;
}

export async function ensureConversation(clientId: string, trainerId: string): Promise<Conversation> {
  const existing = await query<Conversation>(
    "SELECT id, client_id, trainer_id, created_at FROM conversations WHERE client_id = $1 LIMIT 1",
    [clientId]
  );
  if (existing.rows[0]) return existing.rows[0];

  const created = await transaction(async (client) => {
    const result = await client.query<Conversation>(
      `INSERT INTO conversations (client_id, trainer_id)
       VALUES ($1, $2)
       ON CONFLICT (client_id) DO UPDATE SET trainer_id = EXCLUDED.trainer_id
       RETURNING id, client_id, trainer_id, created_at`,
      [clientId, trainerId]
    );
    return result.rows[0];
  });

  return created;
}

export async function getConversationById(conversationId: string): Promise<Conversation | null> {
  const result = await query<Conversation>(
    "SELECT id, client_id, trainer_id, created_at FROM conversations WHERE id = $1 LIMIT 1",
    [conversationId]
  );
  return result.rows[0] || null;
}

export async function getConversationForClient(clientId: string): Promise<Conversation> {
  const trainerId = await getAssignedTrainerId(clientId);
  if (!trainerId) {
    throw new Error("No trainer assigned to this client.");
  }
  return ensureConversation(clientId, trainerId);
}

export async function getConversationForTrainer(trainerId: string, clientId: string): Promise<Conversation> {
  const result = await query<{ trainer_id: string }>(
    "SELECT trainer_id FROM client_trainer_assignments WHERE client_id = $1 LIMIT 1",
    [clientId]
  );
  const trainerForClient = result.rows[0]?.trainer_id;
  if (!trainerForClient) {
    throw new Error("Client is not assigned to any trainer.");
  }
  if (trainerForClient !== trainerId) {
    throw new Error("You are not assigned to this client.");
  }
  return ensureConversation(clientId, trainerId);
}

export async function assertConversationAccess(
  access: ConversationAccess,
  conversationId: string
): Promise<Conversation> {
  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  if (access.role === "client" && conversation.client_id !== access.userId) {
    throw new Error("Forbidden");
  }

  if (access.role === "trainer" && conversation.trainer_id !== access.userId) {
    throw new Error("Forbidden");
  }

  return conversation;
}

export async function getMessagesForConversation(
  conversationId: string,
  options?: { cursor?: string; limit?: number }
): Promise<{ messages: MessageRow[]; hasMore: boolean }> {
  const limit = options?.limit ?? 30;
  const cursor = options?.cursor;

  if (cursor) {
    const result = await query<MessageRow>(
            `SELECT id, conversation_id, sender_id, sender_role,
              COALESCE(sender_type, sender_role)::text AS sender_type,
              client_id, trainer_id, message_text, image_url, client_temp_id, is_read, read_at, created_at
       FROM messages
       WHERE conversation_id = $1 AND created_at < $2
       ORDER BY created_at DESC
       LIMIT $3`,
      [conversationId, cursor, limit + 1]
    );
    const rows = result.rows;
    const hasMore = rows.length > limit;
    return { messages: rows.slice(0, limit).reverse(), hasMore };
  }

  const latest = await query<MessageRow>(
        `SELECT id, conversation_id, sender_id, sender_role,
          COALESCE(sender_type, sender_role)::text AS sender_type,
          client_id, trainer_id, message_text, image_url, client_temp_id, is_read, read_at, created_at
     FROM messages
     WHERE conversation_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [conversationId, limit + 1]
  );
  const rows = latest.rows;
  const hasMore = rows.length > limit;
  return { messages: rows.slice(0, limit).reverse(), hasMore };
}

export async function insertMessage(params: {
  conversationId: string;
  senderId: string;
  senderRole: ChatRole;
  clientId: string;
  clientTempId?: string | null;
  trainerId?: string | null;
  messageText?: string | null;
  imageUrl?: string | null;
}): Promise<MessageRow> {
  const text = (params.messageText || "").trim();
  const imageUrl = params.imageUrl?.trim() || null;
  if (!text && !imageUrl) {
    throw new Error("Message text or image is required.");
  }

  const sanitizedText = text.length ? text : null;

  const senderType = params.senderRole === "trainer" ? "trainer" : "client";
  const result = await query<MessageRow>(
    `INSERT INTO messages (conversation_id, sender_id, sender_role, sender_type, client_id, trainer_id, message_text, image_url, client_temp_id, is_read)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false)
     RETURNING id, conversation_id, sender_id, sender_role,
       COALESCE(sender_type, sender_role)::text AS sender_type,
       client_id, trainer_id, message_text, image_url, client_temp_id, is_read, read_at, created_at`,
    [
      params.conversationId,
      params.senderId,
      params.senderRole,
      senderType,
      params.clientId,
      params.trainerId ?? null,
      sanitizedText,
      imageUrl,
      params.clientTempId ?? null,
    ]
  );
  return result.rows[0];
}

export async function markMessagesRead(conversationId: string, viewerRole: ChatRole) {
  if (viewerRole === "hq") return;
  await query(
    `UPDATE messages
     SET is_read = true,
         read_at = COALESCE(read_at, NOW())
     WHERE conversation_id = $1 AND sender_role <> $2 AND is_read = false`,
    [conversationId, viewerRole]
  );
}

export async function getUnreadCount(conversationId: string, viewerRole: ChatRole): Promise<number> {
  if (viewerRole === "hq") return 0;
  const result = await query<{ count: string }>(
    `SELECT COUNT(*)::int AS count
     FROM messages
     WHERE conversation_id = $1 AND sender_role <> $2 AND is_read = false`,
    [conversationId, viewerRole]
  );
  return parseInt(result.rows[0]?.count || "0", 10);
}

export async function resolveChatAccess(): Promise<ConversationAccess> {
  const adminSession = await getAdminSession();
  if (adminSession?.admin) {
    return { role: "trainer", userId: adminSession.admin.id };
  }

  const clientSession = await getClientSession();
  if (clientSession?.client) {
    return { role: "client", userId: clientSession.client.id };
  }

  const hqSession = await getHQSession();
  if (hqSession?.hq) {
    return { role: "hq", userId: "hq" };
  }

  throw new Error("Unauthorized");
}

export async function getConversationMetaForClient(clientId: string) {
  const trainer = await query<{ id: string; username: string }>(
    `SELECT a.id, a.username
     FROM client_trainer_assignments cta
     JOIN admins a ON a.id = cta.trainer_id
     WHERE cta.client_id = $1
     LIMIT 1`,
    [clientId]
  );

  if (!trainer.rows[0]) {
    throw new Error("No trainer assigned to this client.");
  }

  const conversation = await ensureConversation(clientId, trainer.rows[0].id);
  return { conversation, trainerName: trainer.rows[0].username };
}

export async function getConversationMetaForTrainer(trainerId: string, clientId: string) {
  const client = await query<{ id: string; name: string; username: string }>(
    `SELECT c.id, c.name, c.username
     FROM client_trainer_assignments cta
     JOIN clients c ON c.id = cta.client_id
     WHERE cta.client_id = $1 AND cta.trainer_id = $2
     LIMIT 1`,
    [clientId, trainerId]
  );

  if (!client.rows[0]) {
    throw new Error("You are not assigned to this client.");
  }

  const conversation = await ensureConversation(clientId, trainerId);
  return { conversation, clientName: client.rows[0].name, clientUsername: client.rows[0].username };
}

export async function getConversationMetaForHQ(clientId: string) {
  const row = await query<{
    client_id: string;
    client_name: string;
    client_username: string;
    trainer_id: string;
    trainer_username: string;
  }>(
    `SELECT c.id as client_id, c.name as client_name, c.username as client_username,
            a.id as trainer_id, a.username as trainer_username
     FROM client_trainer_assignments cta
     JOIN clients c ON c.id = cta.client_id
     JOIN admins a ON a.id = cta.trainer_id
     WHERE cta.client_id = $1
     LIMIT 1`,
    [clientId]
  );

  const record = row.rows[0];
  if (!record) {
    throw new Error("No trainer assigned to this client.");
  }

  const conversation = await ensureConversation(record.client_id, record.trainer_id);
  return {
    conversation,
    clientName: record.client_name,
    clientUsername: record.client_username,
    trainerName: record.trainer_username,
  };
}

export async function listAllConversationsForHQ() {
  const result = await query<{
    client_id: string;
    client_name: string;
    client_username: string;
    trainer_name: string;
    conversation_id: string | null;
    unread_client: number | null;
    unread_trainer: number | null;
  }>(
    `SELECT c.id as client_id, c.name as client_name, c.username as client_username,
            a.username as trainer_name, conv.id as conversation_id,
            COALESCE(unread_client.count, 0)::int as unread_client,
            COALESCE(unread_trainer.count, 0)::int as unread_trainer
     FROM client_trainer_assignments cta
     JOIN clients c ON c.id = cta.client_id
     JOIN admins a ON a.id = cta.trainer_id
     LEFT JOIN conversations conv ON conv.client_id = c.id
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int as count
       FROM messages m
       WHERE conv.id IS NOT NULL AND m.conversation_id = conv.id AND m.sender_role = 'client' AND m.is_read = false
     ) unread_client ON true
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int as count
       FROM messages m
       WHERE conv.id IS NOT NULL AND m.conversation_id = conv.id AND m.sender_role = 'trainer' AND m.is_read = false
     ) unread_trainer ON true
     ORDER BY c.name`,
    []
  );
  return result.rows;
}

export async function listAssignedClientsWithUnread(trainerId: string) {
  const rows = await query<{
    client_id: string;
    name: string;
    username: string;
    conversation_id: string | null;
    unread_count: number | null;
  }>(
    `SELECT c.id as client_id, c.name, c.username, conv.id as conversation_id,
            COALESCE(unread.unread_count, 0)::int as unread_count
     FROM client_trainer_assignments cta
     JOIN clients c ON c.id = cta.client_id
     LEFT JOIN conversations conv ON conv.client_id = c.id
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS unread_count
       FROM messages m
       WHERE conv.id IS NOT NULL
         AND m.conversation_id = conv.id
         AND m.sender_role <> 'trainer'
         AND m.is_read = false
     ) unread ON true
     WHERE cta.trainer_id = $1
     ORDER BY c.name`,
    [trainerId]
  );
  return rows.rows;
}
