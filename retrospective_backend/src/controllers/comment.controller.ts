import { Request, Response } from "express";
import {
  addComment as addCommentService,
  getComments as getCommentsService,
  removeComment as removeCommentService,
} from "../services/comment.service";
import { resolveSessionActor } from "../utils/sessionActor";

export const getComments = async (req: Request, res: Response) => {
  const sessionId = Number(req.params.sessionId);
  const cardId = Number(req.params.cardId);
  await resolveSessionActor(req, sessionId);

  const data = await getCommentsService(sessionId, cardId);

  return res.status(200).json({
    success: true,
    data,
  });
};

export const createComment = async (req: Request, res: Response) => {
  const sessionId = Number(req.params.sessionId);
  const cardId = Number(req.params.cardId);
  const { content } = req.body;
  const actor = await resolveSessionActor(req, sessionId);

  const data = await addCommentService({ participantId: actor.participantId, sessionId, cardId, content });

  return res.status(201).json({
    success: true,
    message: "Commentaire ajouté.",
    data,
  });
};

export const deleteComment = async (req: Request, res: Response) => {
  const sessionId = Number(req.params.sessionId);
  const cardId = Number(req.params.cardId);
  const commentId = Number(req.params.commentId);
  const actor = await resolveSessionActor(req, sessionId);

  await removeCommentService({ participantId: actor.participantId, cardId, commentId });

  return res.status(200).json({
    success: true,
    message: "Commentaire supprimé.",
  });
};
