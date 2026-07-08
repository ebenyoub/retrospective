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

type ColumnType = "start" | "stop" | "continue";

const VALID_COLUMN_TYPES: ColumnType[] = ["start", "stop", "continue"];

const isValidColumnType = (value: unknown): value is ColumnType =>
  typeof value === "string" && VALID_COLUMN_TYPES.includes(value as ColumnType);

interface CreateCardInput {
  userId: number;
  sessionId: string;
  content: unknown;
  columnType: unknown;
}

interface GetCardsInput {
  sessionId: string;
}

interface UpdateCardInput {
  userId: number;
  sessionId: number;
  cardId: number;
  content: unknown;
}

interface DeleteCardInput {
  userId: number;
  cardId: string;
}

export const createCard = async ({
  userId,
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

  return insertCard(sessionId, userId, columnType, content);
};

export const getCards = async ({ sessionId }: GetCardsInput) => {
  const session = await findSessionById(sessionId);

  if (session === null) {
    throw new AppError(404, "Session introuvable.", "SESSION_NOT_FOUND");
  }

  const cards = await findCardsBySessionId(sessionId);

  return cards.map((card) => ({
    id: card.id,
    sessionId: card.session_id,
    authorId: card.author_id,
    columnType: card.column_type,
    content: card.content,
    createdAt: card.created_at,
    votesCount: card.votes_count
  }));
};

export const updateCard = async ({ userId, sessionId, cardId, content }: UpdateCardInput): Promise<void> => {
  if (!content || typeof content !== "string" || content.trim() === "") {
    throw new AppError(400, "Le contenu de la carte est requis.", "CARD_CONTENT_REQUIRED");
  }

  const card = await findCardOwner(sessionId, cardId);

  if (card === null) {
    throw new AppError(404, "Carte introuvable.", "CARD_NOT_FOUND");
  }

  if (card.author_id !== userId) {
    throw new AppError(403, "Vous ne pouvez modifier que vos propres cartes.", "CARD_FORBIDDEN");
  }

  await updateCardContent(sessionId, cardId, content.trim());
};

export const deleteCard = async ({ userId, cardId }: DeleteCardInput): Promise<void> => {
  const card = await findCardOwnerById(cardId);

  if (card === null) {
    throw new AppError(404, "Carte introuvable.", "CARD_NOT_FOUND");
  }

  if (card.author_id !== userId) {
    throw new AppError(403, "Vous ne pouvez supprimer que vos propres cartes.", "CARD_FORBIDDEN");
  }

  await deleteVotesByCardId(cardId);
  await deleteCardById(cardId);
};
