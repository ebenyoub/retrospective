import { Request, Response } from "express";
import {
  addMessage as addMessageService,
  getMessages as getMessagesService,
} from "../services/message.service";
import { resolveSessionActor } from "../utils/sessionActor";
import { emitMessageAdded } from "../realtime/socket";

export const getMessages = async (req: Request, res: Response) => {
  const sessionId = Number(req.params.sessionId);
  await resolveSessionActor(req, sessionId);

  const data = await getMessagesService(sessionId);

  return res.status(200).json({
    success: true,
    data,
  });
};

export const createMessage = async (req: Request, res: Response) => {
  const sessionId = Number(req.params.sessionId);
  const { content } = req.body;
  const actor = await resolveSessionActor(req, sessionId, { requireOpen: true });

  const data = await addMessageService({
    sessionId,
    participantId: actor.participantId,
    content,
  });

  // Diffusion temps réel à tous les clients
  emitMessageAdded(sessionId, data);

  return res.status(201).json({
    success: true,
    message: "Message envoyé.",
    data,
  });
};
