import { Response } from "express";
import { AuthRequest } from "../types";
import { getActions, addAction } from "../services/action.service";
import { emitActionAdded } from "../realtime/socket";
import { requireAuthUser } from "../utils/authUser";
import { AppError } from "../utils/AppError";
import { resolveSessionActor } from "../utils/sessionActor";

export const getSessionActions = async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    throw new AppError(400, "L'ID de session est requis.", "SESSION_ID_REQUIRED");
  }

  await resolveSessionActor(req, Number(sessionId));

  const actions = await getActions(Number(sessionId));

  res.status(200).json({
    success: true,
    data: actions,
  });
};

export const createSessionAction = async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  const { userId } = requireAuthUser(req);
  const { description, owner, priority, deadline } = req.body;

  if (!sessionId) {
    throw new AppError(400, "L'ID de session est requis.", "SESSION_ID_REQUIRED");
  }

  const createdAction = await addAction(Number(sessionId), userId, {
    description,
    owner,
    priority,
    deadline: deadline || null,
  });

  // Diffuser par socket.io aux participants
  emitActionAdded(Number(sessionId), createdAction);

  res.status(201).json({
    success: true,
    message: "Action enregistrée.",
    data: createdAction,
  });
};
