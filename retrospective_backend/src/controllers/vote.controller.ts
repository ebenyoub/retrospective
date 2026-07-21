import { Request, Response } from "express";
import { castVote } from "../services/vote.service";
import { resolveSessionActor } from "../utils/sessionActor";

export const voteForCard = async (req: Request, res: Response) => {
  const sessionId = Number(req.params.sessionId);
  const cardId = Number(req.params.cardId);
  const actor = await resolveSessionActor(req, sessionId, { requireOpen: true });

  const result = await castVote(actor.participantId, sessionId, cardId);

  return res.status(201).json({
    success: true,
    message: "Vote enregistré.",
    data: result,
  });
};
