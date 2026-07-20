import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";
import { AppError } from "../utils/AppError";
import {
  readAuthToken,
  RESUME_COOKIE_NAME,
  resumeCookieOptions,
  clearResumeCookieOptions,
  signResumeToken,
  verifyResumeToken,
} from "../utils/authCookie";
import { requireAuthUser } from "../utils/authUser";
import { emitParticipantsUpdated } from "../realtime/socket";
import {
  checkGuestResume,
  ensureAuthenticatedParticipant,
  getParticipantsForSession,
  joinSessionAsGuestParticipantByCode,
  joinSessionAsGuestParticipant,
  leaveSession,
  renameParticipant,
  resumeGuestParticipant,
} from "../services/participant.service";
import { assertSessionOpen, getSessionDetails } from "../services/session.service";

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
  const token = readAuthToken(req);
  if (!token) return null;

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return null;

  try {
    const decoded = jwt.verify(token, jwtSecret) as { userId?: number };
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
  assertSessionOpen(session);
  const role = session.ownerId === userId ? "facilitator" : "participant";

  const participant = await ensureAuthenticatedParticipant({ sessionId, userId, displayName: username, role });
  await emitParticipantsUpdated(sessionId);

  const token = signResumeToken({
    sessionId: participant.sessionId,
    participantId: participant.id,
    displayName: participant.displayName,
    guestToken: null,
  });
  res.cookie(RESUME_COOKIE_NAME, token, resumeCookieOptions);

  return res.status(200).json({ success: true, data: participant });
};

export const guestJoin = async (req: Request, res: Response) => {
  const sessionId = parseSessionId(req);
  const { pseudo } = req.body;

  const { participant, guestToken } = await joinSessionAsGuestParticipant(sessionId, pseudo);
  await emitParticipantsUpdated(sessionId);

  const token = signResumeToken({
    sessionId: participant.sessionId,
    participantId: participant.id,
    displayName: participant.displayName,
    guestToken,
  });
  res.cookie(RESUME_COOKIE_NAME, token, resumeCookieOptions);

  return res.status(201).json({ success: true, data: { ...participant, guestToken } });
};

export const guestJoinByCode = async (req: Request, res: Response) => {
  const { code, pseudo } = req.body;

  const { participant, guestToken } = await joinSessionAsGuestParticipantByCode(code, pseudo);
  await emitParticipantsUpdated(participant.sessionId);

  const token = signResumeToken({
    sessionId: participant.sessionId,
    participantId: participant.id,
    displayName: participant.displayName,
    guestToken,
  });
  res.cookie(RESUME_COOKIE_NAME, token, resumeCookieOptions);

  return res.status(201).json({ success: true, data: { ...participant, guestToken } });
};

export const resumeGuest = async (req: Request, res: Response) => {
  const sessionId = parseSessionId(req);
  const { participantId, guestToken } = req.body;

  // Une vraie reprise (contrairement à la simple résolution d'acteur pour une
  // action déjà en cours) ne doit jamais rouvrir une session clôturée.
  const session = await getSessionDetails(sessionId);
  assertSessionOpen(session);

  const participant = await resumeGuestParticipant(sessionId, participantId, guestToken);
  await emitParticipantsUpdated(sessionId);

  const token = signResumeToken({
    sessionId: participant.sessionId,
    participantId: participant.id,
    displayName: participant.displayName,
    guestToken,
  });
  res.cookie(RESUME_COOKIE_NAME, token, resumeCookieOptions);

  return res.status(200).json({ success: true, data: participant });
};

export const removeParticipant = async (req: Request, res: Response) => {
  const sessionId = parseSessionId(req);
  const participantId = Number(req.params.participantId);
  const requesterUserId = extractOptionalUserId(req);
  const requesterGuestToken = typeof req.body?.guestToken === "string" ? req.body.guestToken : null;

  await leaveSession({ sessionId, participantId, requesterUserId, requesterGuestToken });
  await emitParticipantsUpdated(sessionId);

  res.clearCookie(RESUME_COOKIE_NAME, clearResumeCookieOptions);

  return res.status(200).json({ success: true, message: "Vous avez quitté la session." });
};

// Changement de pseudo par le participant lui-même. La nouvelle liste est
// diffusée en direct à tous les clients de la session.
export const renameParticipantSelf = async (req: Request, res: Response) => {
  const sessionId = parseSessionId(req);
  const participantId = Number(req.params.participantId);
  const requesterUserId = extractOptionalUserId(req);
  const requesterGuestToken = typeof req.body?.guestToken === "string" ? req.body.guestToken : null;
  const { pseudo } = req.body;

  const participant = await renameParticipant({
    sessionId,
    participantId,
    displayName: pseudo,
    requesterUserId,
    requesterGuestToken,
  });
  await emitParticipantsUpdated(sessionId);

  const token = signResumeToken({
    sessionId: participant.sessionId,
    participantId: participant.id,
    displayName: participant.displayName,
    guestToken: requesterGuestToken,
  });
  res.cookie(RESUME_COOKIE_NAME, token, resumeCookieOptions);

  return res.status(200).json({ success: true, data: participant });
};

// Vérification de reprise depuis l'accueil : valide l'identité invitée sans
// remettre le participant en ligne (contrairement à /resume).
export const resumeCheck = async (req: Request, res: Response) => {
  const sessionId = parseSessionId(req);
  const { participantId, guestToken } = req.body;

  const data = await checkGuestResume(sessionId, participantId, guestToken);

  return res.status(200).json({ success: true, data });
};

// Vérification globale de reprise d'une session en cours via le cookie retro_resume
export const checkGlobalResume = async (req: Request, res: Response) => {
  const cookieToken = req.cookies?.[RESUME_COOKIE_NAME];
  if (!cookieToken) {
    return res.status(200).json({ success: true, data: null });
  }

  const payload = verifyResumeToken(cookieToken);
  if (!payload) {
    res.clearCookie(RESUME_COOKIE_NAME, clearResumeCookieOptions);
    return res.status(200).json({ success: true, data: null });
  }

  try {
    const data = await checkGuestResume(payload.sessionId, payload.participantId, payload.guestToken);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    // Si la session n'est plus accessible ou que le participant a été supprimé
    res.clearCookie(RESUME_COOKIE_NAME, clearResumeCookieOptions);
    return res.status(200).json({ success: true, data: null });
  }
};
