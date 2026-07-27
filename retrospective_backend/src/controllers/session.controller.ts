import { Request, Response } from "express";
import { AuthRequest } from "../types";
import { AppError } from "../utils/AppError";
import { requireAuthUser } from "../utils/authUser";
import { getOptionalUserId } from "../utils/authCookie";
import { emitSessionStarted, emitSessionTimerUpdated, emitSessionClosed } from "../realtime/socket";
import {
  createSessionForUser,
  getSessionDetailsForViewer,
  getSessionsForUser,
  joinSessionForUser,
  updateSessionFormatService,
  updateSessionStepService,
  updateSessionTimerService,
  closeSessionService,
  updateSessionNameService,
  deleteSessionService,
} from "../services/session.service";

export const createSession = async (req: AuthRequest, res: Response) => {
  const { userId } = requireAuthUser(req);
  const { name, formatName, formatColumns, stepDurationMinutes } = req.body;

  const result = await createSessionForUser({ userId, name, formatName, formatColumns, stepDurationMinutes });

  return res.status(result.statusCode).json({
    success: true,
    message: result.message,
    data: result.data,
  });
};

export const joinSession = async (req: AuthRequest, res: Response) => {
  const { userId } = requireAuthUser(req);
  const { code } = req.body;

  const result = await joinSessionForUser({ userId, code });

  return res.status(result.statusCode).json({
    success: true,
    message: result.message,
    data: result.data,
  });
};

export const listSessions = async (req: AuthRequest, res: Response) => {
  const { userId } = requireAuthUser(req);
  const data = await getSessionsForUser(userId);

  return res.status(200).json({
    success: true,
    data,
  });
};

export const getSession = async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    throw new AppError(400, "L'ID de session est requis.", "SESSION_ID_REQUIRED");
  }

  // Pas de middleware `auth` ici (salle d'attente ouverte aux invités) : on
  // lit l'identité si un cookie valide ou un jeton invité est présent, sans
  // jamais l'exiger tant que la session est ouverte. getSessionDetailsForViewer
  // refuse l'accès si la session est clôturée et que ce viewer n'y a aucun droit.
  const viewerUserId = getOptionalUserId(req);
  const guestToken = req.header("x-guest-token") ?? null;
  const session = await getSessionDetailsForViewer(Number(sessionId), viewerUserId, guestToken);

  return res.status(200).json({
    success: true,
    data: session,
  });
};

export const updateSessionStep = async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  const { userId } = requireAuthUser(req);
  const { step } = req.body;

  if (!sessionId) {
    throw new AppError(400, "L'ID de session est requis.", "SESSION_ID_REQUIRED");
  }

  if (!step || !["waiting", "writing", "voting", "results", "action", "summary"].includes(step)) {
    throw new AppError(400, "L'étape fournie est invalide.", "INVALID_STEP");
  }

  const { stepEndsAt } = await updateSessionStepService(Number(sessionId), userId, step);
  emitSessionStarted(Number(sessionId), step, stepEndsAt);

  return res.status(200).json({
    success: true,
    message: "Étape de la session mise à jour.",
    data: { step, stepEndsAt },
  });
};

export const updateSessionTimer = async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  const { userId } = requireAuthUser(req);
  const { minutes } = req.body;

  if (!sessionId) {
    throw new AppError(400, "L'ID de session est requis.", "SESSION_ID_REQUIRED");
  }

  const result = await updateSessionTimerService(Number(sessionId), userId, minutes);

  // Nouvelle échéance en cours d'étape : diffusée immédiatement à la room.
  if (result.stepEndsAt) {
    emitSessionTimerUpdated(Number(sessionId), result.stepEndsAt);
  }

  return res.status(200).json({
    success: true,
    message: "Timer de la session mis à jour.",
    data: result,
  });
};

export const updateSessionFormat = async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  const { userId } = requireAuthUser(req);
  const { formatName, formatColumns } = req.body;

  if (!sessionId) {
    throw new AppError(400, "L'ID de session est requis.", "SESSION_ID_REQUIRED");
  }

  const session = await updateSessionFormatService(Number(sessionId), userId, formatName, formatColumns);

  return res.status(200).json({
    success: true,
    message: "Format de la session mis à jour.",
    data: session,
  });
};

export const closeSession = async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  const { userId } = requireAuthUser(req);

  if (!sessionId) {
    throw new AppError(400, "L'ID de session est requis.", "SESSION_ID_REQUIRED");
  }

  await closeSessionService(Number(sessionId), userId);
  emitSessionClosed(Number(sessionId));

  return res.status(200).json({
    success: true,
    message: "La session a été fermée avec succès.",
  });
};

export const updateSessionName = async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  const { userId } = requireAuthUser(req);
  const { name } = req.body;

  if (!sessionId) {
    throw new AppError(400, "L'ID de session est requis.", "SESSION_ID_REQUIRED");
  }

  await updateSessionNameService(Number(sessionId), userId, name);

  return res.status(200).json({
    success: true,
    message: "Le nom de la session a été mis à jour avec succès.",
  });
};

export const deleteSession = async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  const { userId } = requireAuthUser(req);

  if (!sessionId) {
    throw new AppError(400, "L'ID de session est requis.", "SESSION_ID_REQUIRED");
  }

  await deleteSessionService(Number(sessionId), userId);

  return res.status(200).json({
    success: true,
    message: "La session a été supprimée avec succès.",
  });
};
