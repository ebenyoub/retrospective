import { Response } from "express";
import { AuthRequest } from "../types";
import { castVote } from "../services/vote.service";

export const voteForCard = async (req: AuthRequest, res: Response) => {
  const { userId } = req.user;
  const cardId = Number(req.params.cardId);

  const result = await castVote(userId, cardId);

  return res.status(201).json({
    success: true,
    message: "Vote enregistré.",
    data: result,
  });
};
