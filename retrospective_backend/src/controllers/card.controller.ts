import { Request, Response } from "express";
import {
  createCard as createCardService,
  deleteCard as deleteCardService,
  getCards as getCardsService,
  updateCard as updateCardService,
} from "../services/card.service";
import { resolveSessionActor } from "../utils/sessionActor";

export const createCard = async (req: Request, res: Response) => {
  const sessionId = String(req.params.sessionId);
  const { content, columnType } = req.body;
  const actor = await resolveSessionActor(req, Number(sessionId));

  const cardId = await createCardService({ participantId: actor.participantId, sessionId, content, columnType });

  return res.status(201).json({
    success: true,
    message: "Carte ajoutée.",
    data: { cardId }
  });
};

export const getCards = async (req: Request, res: Response) => {
  const sessionId = String(req.params.sessionId);
  const actor = await resolveSessionActor(req, Number(sessionId));

  const data = await getCardsService({
    sessionId,
    participantId: actor.participantId,
  });

  return res.status(200).json({
    success: true,
    data
  });
};

export const updateCard = async (req: Request, res: Response) => {
  const sessionId = Number(String(req.params.sessionId));
  const cardId = Number(String(req.params.cardId));
  const { content } = req.body;
  const actor = await resolveSessionActor(req, sessionId);

  await updateCardService({
    participantId: actor.participantId,
    sessionId,
    cardId,
    content,
  });

  return res.status(200).json({
    success: true,
    message: "Carte modifiée."
  });
};

export const deleteCard = async (req: Request, res: Response) => {
  const sessionId = Number(String(req.params.sessionId));
  const cardId = String(req.params.cardId);
  const actor = await resolveSessionActor(req, sessionId);

  await deleteCardService({ participantId: actor.participantId, cardId });

  return res.status(200).json({
    success: true,
    message: "Carte supprimée."
  });
};
