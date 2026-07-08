import { Response } from "express";
import { AuthRequest } from '../types';
import { logger } from '../utils/logger';
import { updateCard as updateCardService } from "../services/card.service";
import {
  deleteCardById,
  deleteVotesByCardId,
  findCardOwnerById,
  findCardsBySessionId,
  findSessionById,
  insertCard,
} from "../models/card.model";

type ColumnType = "start" | "stop" | "continue";

const VALID_COLUMN_TYPES: ColumnType[] = ["start", "stop", "continue"];

const isValidColumnType = (value: unknown): value is ColumnType =>
  typeof value === "string" && VALID_COLUMN_TYPES.includes(value as ColumnType);

export const createCard = async (req: AuthRequest, res: Response) => {
  const { userId } = req.user;
  const sessionId = String(req.params.sessionId);
  const { content, columnType } = req.body;

  if (!content || typeof content !== "string" || content.trim() === "") {
    logger.error("❌ Le contenu de la carte est requis.");
    return res.status(400).json({
      success: false,
      message: "Le contenu de la carte est requis."
    });
  }

  if (!isValidColumnType(columnType)) {
    logger.error("❌ Colonne invalide.");
    return res.status(400).json({
      success: false,
      message: "La colonne doit être 'start', 'stop' ou 'continue'."
    });
  }

  try {
    const session = await findSessionById(sessionId);

    if (session === null) {
      logger.error(`❌ Session introuvable : ${sessionId}`);
      return res.status(404).json({
        success: false,
        message: "Session introuvable."
      });
    }

    const cardId = await insertCard(sessionId, userId, columnType, content);

    logger.info(`✅ Carte créée : ${cardId}`);

    return res.status(201).json({
      success: true,
      message: "Carte ajoutée.",
      data: { cardId }
    });

  } catch (error) {
    logger.error(`❌ Erreur lors de la création de la carte : ${error}`);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la création de la carte."
    });
  }
};

export const getCards = async (req: AuthRequest, res: Response) => {
  const sessionId = String(req.params.sessionId);

  try {
    const session = await findSessionById(sessionId);

    if (session === null) {
      logger.error(`❌ Session introuvable : ${sessionId}`);
      return res.status(404).json({
        success: false,
        message: "Session introuvable."
      });
    }

    const cards = await findCardsBySessionId(sessionId);

    const data = cards.map((card) => ({
      id: card.id,
      sessionId: card.session_id,
      authorId: card.author_id,
      columnType: card.column_type,
      content: card.content,
      createdAt: card.created_at,
      votesCount: card.votes_count
    }));

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    logger.error(`❌ Erreur lors de la récupération des cartes : ${error}`);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la récupération des cartes."
    });
  }
};

export const updateCard = async (req: AuthRequest, res: Response) => {
  const { userId } = req.user;
  const sessionId = Number(String(req.params.sessionId));
  const cardId = Number(String(req.params.cardId));
  const { content } = req.body;

  await updateCardService({
    userId,
    sessionId,
    cardId,
    content,
  });

  return res.status(200).json({
    success: true,
    message: "Carte modifiée."
  });
};

export const deleteCard = async (req: AuthRequest, res: Response) => {
  const { userId } = req.user;
  const cardId = String(req.params.cardId);

  try {
    const card = await findCardOwnerById(cardId);

    if (card === null) {
      logger.error(`❌ Carte introuvable : ${cardId}`);
      return res.status(404).json({
        success: false,
        message: "Carte introuvable."
      });
    }

    if (card.author_id !== userId) {
      logger.error(`❌ L'utilisateur ${userId} n'est pas l'auteur de la carte ${cardId}`);
      return res.status(403).json({
        success: false,
        message: "Vous ne pouvez supprimer que vos propres cartes."
      });
    }

    // Les votes n'ont pas de suppression en cascade en base : on les retire
    // explicitement avant de supprimer la carte (sinon contrainte de clé étrangère).
    await deleteVotesByCardId(cardId);
    await deleteCardById(cardId);

    logger.info(`✅ Carte supprimée : ${cardId}`);

    return res.status(200).json({
      success: true,
      message: "Carte supprimée."
    });

  } catch (error) {
    logger.error(`❌ Erreur lors de la suppression de la carte : ${error}`);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la suppression de la carte."
    });
  }
};
