import { AppError } from "../utils/AppError";
import { findCardOwner } from "../models/card.model";
import {
  deleteCommentById,
  findCommentById,
  findCommentOwner,
  findCommentsByCardId,
  insertComment,
} from "../models/comment.model";
import type { CommentRow } from "../models/types/comment.model.types";
import type { CommentSummary, CreateCommentInput, DeleteCommentInput } from "./types/comment.service.types";

const toSummary = (row: CommentRow): CommentSummary => ({
  id: row.id,
  cardId: row.card_id,
  authorId: row.author_participant_id,
  authorName: row.author_name,
  content: row.content,
  createdAt: row.created_at,
});

export const getComments = async (sessionId: number, cardId: number): Promise<CommentSummary[]> => {
  const card = await findCardOwner(sessionId, cardId);

  if (card === null) {
    throw new AppError(404, "Carte introuvable.", "CARD_NOT_FOUND");
  }

  const comments = await findCommentsByCardId(cardId);

  return comments.map(toSummary);
};

export const addComment = async ({ participantId, sessionId, cardId, content }: CreateCommentInput): Promise<CommentSummary> => {
  if (!content || typeof content !== "string" || content.trim() === "") {
    throw new AppError(400, "Le commentaire ne peut pas être vide.", "COMMENT_CONTENT_REQUIRED");
  }

  const card = await findCardOwner(sessionId, cardId);

  if (card === null) {
    throw new AppError(404, "Carte introuvable.", "CARD_NOT_FOUND");
  }

  const commentId = await insertComment(cardId, participantId, content.trim());
  const created = await findCommentById(commentId);

  if (!created) {
    throw new AppError(500, "Impossible d'ajouter le commentaire.", "COMMENT_CREATE_FAILED");
  }

  return toSummary(created);
};

export const removeComment = async ({ participantId, cardId, commentId }: DeleteCommentInput): Promise<void> => {
  const comment = await findCommentOwner(commentId);

  if (comment === null || comment.card_id !== cardId) {
    throw new AppError(404, "Commentaire introuvable.", "COMMENT_NOT_FOUND");
  }

  if (comment.author_participant_id !== participantId) {
    throw new AppError(403, "Vous ne pouvez supprimer que vos propres commentaires.", "COMMENT_FORBIDDEN");
  }

  await deleteCommentById(commentId);
};
