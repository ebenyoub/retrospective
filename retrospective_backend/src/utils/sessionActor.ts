import type { Request } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { ensureAuthenticatedParticipant, resumeGuestParticipant, type ParticipantSummary } from "../services/participant.service";
import { getSessionDetails } from "../services/session.service";
import { AppError } from "./AppError";
import { readAuthToken } from "./authCookie";

interface AuthPayload extends JwtPayload {
  userId?: number;
  username?: string;
}

export interface SessionActor {
  participantId: number;
  displayName: string;
  role: "facilitator" | "participant";
}

const toActor = (participant: ParticipantSummary): SessionActor => ({
  participantId: participant.id,
  displayName: participant.displayName,
  role: participant.role,
});

const readParticipantId = (req: Request): number | null => {
  const raw = req.header("x-participant-id");
  if (!raw) return null;

  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const readAuthPayload = (req: Request): AuthPayload | null => {
  const token = readAuthToken(req);
  if (!token) return null;

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new AppError(500, "Configuration JWT manquante.", "JWT_SECRET_MISSING");
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    return typeof decoded === "object" ? (decoded as AuthPayload) : null;
  } catch {
    throw new AppError(401, "Token invalide.", "AUTH_TOKEN_INVALID");
  }
};

export const resolveSessionActor = async (req: Request, sessionId: number): Promise<SessionActor> => {
  const participantId = readParticipantId(req);
  const guestToken = req.header("x-guest-token");

  if (guestToken) {
    if (!participantId) {
      throw new AppError(401, "Identité invitée incomplète.", "GUEST_IDENTITY_INCOMPLETE");
    }

    const participant = await resumeGuestParticipant(sessionId, participantId, guestToken);
    return toActor(participant);
  }

  const payload = readAuthPayload(req);
  if (!payload?.userId || !payload.username) {
    throw new AppError(401, "Authentification requise.", "SESSION_ACTOR_REQUIRED");
  }

  const session = await getSessionDetails(sessionId);
  const role = session.ownerId === payload.userId ? "facilitator" : "participant";
  const participant = await ensureAuthenticatedParticipant({
    sessionId,
    userId: payload.userId,
    displayName: payload.username,
    role,
  });

  return toActor(participant);
};
