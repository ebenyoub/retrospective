import { findCardOwnerInSession, updateCardContent } from "../models/card.model";
import { AppError } from "../utils/AppError";

export const updateOwnCard = async (
  userId: number,
  sessionId: number,
  cardId: number,
  content: unknown
): Promise<void> => {
  if (!content || typeof content !== "string" || content.trim() === "") {
    throw new AppError(400, "Le contenu de la carte est requis.", "CARD_CONTENT_REQUIRED");
  }

  const card = await findCardOwnerInSession(cardId, sessionId);

  if (card === null) {
    throw new AppError(404, "Carte introuvable.", "CARD_NOT_FOUND");
  }

  if (card.author_id !== userId) {
    throw new AppError(403, "Vous ne pouvez modifier que vos propres cartes.", "CARD_FORBIDDEN");
  }

  await updateCardContent(cardId, sessionId, content.trim());
};
