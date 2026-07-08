import { Response } from "express";
import { AuthRequest } from '../types';
import {
  createCard as createCardService,
  deleteCard as deleteCardService,
  getCards as getCardsService,
  updateCard as updateCardService,
} from "../services/card.service";

export const createCard = async (req: AuthRequest, res: Response) => {
  const { userId } = req.user;
  const sessionId = String(req.params.sessionId);
  const { content, columnType } = req.body;

  const cardId = await createCardService({ userId, sessionId, content, columnType });

  return res.status(201).json({
    success: true,
    message: "Carte ajoutée.",
    data: { cardId }
  });
};

export const getCards = async (req: AuthRequest, res: Response) => {
  const sessionId = String(req.params.sessionId);

  const data = await getCardsService({ sessionId });

  return res.status(200).json({
    success: true,
    data
  });
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

  await deleteCardService({ userId, cardId });

  return res.status(200).json({
    success: true,
    message: "Carte supprimée."
  });
};
