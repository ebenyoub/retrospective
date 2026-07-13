import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";
import { AppError } from "../utils/AppError";
import { requireAuthUser } from "../utils/authUser";
import { emitParticipantsUpdated } from "../realtime/socket";
import {
  ensureAuthenticatedParticipant,
  getParticipantsForSession,
  joinSessionAsGuestParticipantByCode,
  joinSessionAsGuestParticipant,
  leaveSession,
  resumeGuestParticipant,
} from "../services/participant.service";
import { getSessionDetails } from "../services/session.service";

const parseSessionId = (req: Request): number => {
  const sessionId = Number(req.params.sessionId);
  if (!sessionId) {
    throw new AppError(400, "L'ID de session est requis.", "SESSION_ID_REQUIRED");
  }
  return sessionId;
};

// Un participant qui quitte peut être authentifié (JWT optionnel) ou invité
// (jeton dans le corps de la requête) : on ne force pas `auth` sur cette route.
const extractOptionalUserId = (req: Request): number | null => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return null;

  try {
    const decoded = jwt.verify(header.split(" ")[1], jwtSecret) as { userId?: number };
    return decoded.userId ?? null;
  } catch {
    return null;
  }
};

export const listParticipants = async (req: Request, res: Response) => {
  const sessionId = parseSessionId(req);
  const participants = await getParticipantsForSession(sessionId);

  return res.status(200).json({ success: true, data: participants });
};

// Facilitateur ou participant déjà connecté : rejoint automatiquement, sans
// pseudo à saisir (son vrai nom de compte est utilisé).
export const joinAsSelf = async (req: AuthRequest, res: Response) => {
  const sessionId = parseSessionId(req);
  const { userId, username } = requireAuthUser(req);

  const session = await getSessionDetails(sessionId);
  const role = session.ownerId === userId ? "facilitator" : "participant";

  const participant = await ensureAuthenticatedParticipant({ sessionId, userId, displayName: username, role });
  await emitParticipantsUpdated(sessionId);

  return res.status(200).json({ success: true, data: participant });
};

export const guestJoin = async (req: Request, res: Response) => {
  const sessionId = parseSessionId(req);
  const { pseudo } = req.body;

  const { participant, guestToken } = await joinSessionAsGuestParticipant(sessionId, pseudo);
  await emitParticipantsUpdated(sessionId);

  return res.status(201).json({ success: true, data: { ...participant, guestToken } });
};

export const guestJoinByCode = async (req: Request, res: Response) => {
  const { code, pseudo } = req.body;

  const { participant, guestToken } = await joinSessionAsGuestParticipantByCode(code, pseudo);
  await emitParticipantsUpdated(participant.sessionId);

  return res.status(201).json({ success: true, data: { ...participant, guestToken } });
};

export const resumeGuest = async (req: Request, res: Response) => {
  const sessionId = parseSessionId(req);
  const { participantId, guestToken } = req.body;

  const participant = await resumeGuestParticipant(sessionId, participantId, guestToken);
  await emitParticipantsUpdated(sessionId);

  return res.status(200).json({ success: true, data: participant });
};

export const removeParticipant = async (req: Request, res: Response) => {
  const sessionId = parseSessionId(req);
  const participantId = Number(req.params.participantId);
  const requesterUserId = extractOptionalUserId(req);
  const requesterGuestToken = typeof req.body?.guestToken === "string" ? req.body.guestToken : null;

  await leaveSession({ sessionId, participantId, requesterUserId, requesterGuestToken });
  await emitParticipantsUpdated(sessionId);

  return res.status(200).json({ success: true, message: "Vous avez quitté la session." });
};
