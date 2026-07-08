import { Response } from "express";
import { getSessionDetails, updateSessionStepService } from "../services/session.service";
import { AuthRequest } from '../types';
import { AppError } from "../utils/AppError";

export const getSession = async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    throw new AppError(400, "L'ID de session est requis.", "SESSION_ID_REQUIRED");
  }

  const session = await getSessionDetails(Number(sessionId));

  return res.status(200).json({
    success: true,
    data: session
  });
};

export const updateSessionStep = async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  const { userId } = req.user;
  const { step } = req.body;

  if (!sessionId) {
    throw new AppError(400, "L'ID de session est requis.", "SESSION_ID_REQUIRED");
  }

  if (!step || !["waiting", "writing", "voting", "results"].includes(step)) {
    throw new AppError(400, "L'étape fournie est invalide.", "INVALID_STEP");
  }

  await updateSessionStepService(Number(sessionId), userId, step);

  return res.status(200).json({
    success: true,
    message: "Étape de la session mise à jour.",
    data: { step }
  });
};
