import { AppError } from "../utils/AppError";
import { findSessionById } from "../models/session.model";
import {
  insertMessage,
  findMessagesBySessionId,
  findMessageById,
} from "../models/message.model";
import type { MessageRow } from "../models/types/message.model.types";
import type { MessageSummary, CreateMessageInput } from "./types/message.service.types";

const toSummary = (row: MessageRow): MessageSummary => ({
  id: row.id,
  sessionId: row.session_id,
  authorId: row.author_participant_id,
  authorName: row.author_name,
  content: row.content,
  createdAt: row.created_at,
});

export const getMessages = async (sessionId: number): Promise<MessageSummary[]> => {
  const session = await findSessionById(sessionId);
  if (!session) {
    throw new AppError(404, "Session non trouvée.", "SESSION_NOT_FOUND");
  }

  const messages = await findMessagesBySessionId(sessionId);
  return messages.map(toSummary);
};

export const addMessage = async ({
  sessionId,
  participantId,
  content,
}: CreateMessageInput): Promise<MessageSummary> => {
  if (!content || typeof content !== "string" || content.trim() === "") {
    throw new AppError(400, "Le message ne peut pas être vide.", "MESSAGE_CONTENT_REQUIRED");
  }

  if (content.length > 500) {
    throw new AppError(400, "Le message ne peut pas dépasser 500 caractères.", "MESSAGE_TOO_LONG");
  }

  const session = await findSessionById(sessionId);
  if (!session) {
    throw new AppError(404, "Session non trouvée.", "SESSION_NOT_FOUND");
  }

  const messageId = await insertMessage(sessionId, participantId, content.trim());
  const created = await findMessageById(messageId);

  if (!created) {
    throw new AppError(500, "Impossible d'envoyer le message.", "MESSAGE_CREATE_FAILED");
  }

  return toSummary(created);
};
