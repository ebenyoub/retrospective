import {
  deleteCardById,
  deleteVotesByCardId,
  findCardOwner,
  findCardOwnerById,
  findCardsBySessionId,
  findSessionById,
  insertCard,
  updateCardContent,
} from "../models/card.model";
import { AppError } from "../utils/AppError";
import type {
  ColumnType,
  CreateCardInput,
  DeleteCardInput,
  GetCardsInput,
  UpdateCardInput,
} from "./types/card.service.types";

const VALID_COLUMN_TYPES: ColumnType[] = ["start", "stop", "continue"];

const isValidColumnType = (value: unknown): value is ColumnType =>
  typeof value === "string" && VALID_COLUMN_TYPES.includes(value as ColumnType);

export const createCard = async ({
  participantId,
  sessionId,
  content,
  columnType,
}: CreateCardInput): Promise<number> => {
  if (!content || typeof content !== "string" || content.trim() === "") {
    throw new AppError(400, "Le contenu de la carte est requis.", "CARD_CONTENT_REQUIRED");
  }

  if (!isValidColumnType(columnType)) {
    throw new AppError(400, "La colonne doit être 'start', 'stop' ou 'continue'.", "CARD_COLUMN_INVALID");
  }

  const session = await findSessionById(sessionId);

  if (session === null) {
    throw new AppError(404, "Session introuvable.", "SESSION_NOT_FOUND");
  }

  return insertCard(sessionId, participantId, columnType, content.trim());
};

export const getCards = async ({ sessionId, participantId }: GetCardsInput) => {
  const session = await findSessionById(sessionId);

  if (session === null) {
    throw new AppError(404, "Session introuvable.", "SESSION_NOT_FOUND");
  }

  const cards = await findCardsBySessionId(sessionId, participantId);

  return cards.map((card) => ({
    id: card.id,
    sessionId: card.session_id,
    authorId: card.author_participant_id,
    authorName: card.author_name,
    columnType: card.column_type,
    content: card.content,
    createdAt: card.created_at,
    votesCount: card.votes_count,
    votedByMe: !!card.voted_by_me,
  }));
};

export const updateCard = async ({ participantId, sessionId, cardId, content }: UpdateCardInput): Promise<void> => {
  if (!content || typeof content !== "string" || content.trim() === "") {
    throw new AppError(400, "Le contenu de la carte est requis.", "CARD_CONTENT_REQUIRED");
  }

  const card = await findCardOwner(sessionId, cardId);

  if (card === null) {
    throw new AppError(404, "Carte introuvable.", "CARD_NOT_FOUND");
  }

  if (card.author_participant_id !== participantId) {
    throw new AppError(403, "Vous ne pouvez modifier que vos propres cartes.", "CARD_FORBIDDEN");
  }

  await updateCardContent(sessionId, cardId, content.trim());
};

export const deleteCard = async ({ participantId, cardId }: DeleteCardInput): Promise<void> => {
  const card = await findCardOwnerById(cardId);

  if (card === null) {
    throw new AppError(404, "Carte introuvable.", "CARD_NOT_FOUND");
  }

  if (card.author_participant_id !== participantId) {
    throw new AppError(403, "Vous ne pouvez supprimer que vos propres cartes.", "CARD_FORBIDDEN");
  }

  await deleteVotesByCardId(cardId);
  await deleteCardById(cardId);
};
