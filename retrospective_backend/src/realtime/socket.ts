import type { Server as HttpServer } from "http";
import { Server as SocketIOServer, type Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { getParticipantsForSession, markParticipantOffline, markParticipantOnline, findParticipantForGuestToken } from "../services/participant.service";
import { findSessionById } from "../models/session.model";
import { readTokenFromCookieHeader } from "../utils/authCookie";
import { logger } from "../utils/logger";
import type { JoinPayload } from "./types/socket.types";

let io: SocketIOServer | null = null;

const roomName = (sessionId: number): string => `session:${sessionId}`;

// Un socket ne peut représenter qu'un seul participant à la fois : on vérifie
// qu'il connaît soit le jeton invité, soit un JWT valide, avant de le laisser
// rejoindre la room. Sans cette vérification, n'importe qui pourrait se
// faire passer pour un autre participant (et le faire passer "hors ligne").
// Le JWT vient du cookie HttpOnly transporté par le handshake (le JavaScript
// du navigateur ne peut plus le lire) ; le payload reste accepté en secours.
const canRepresentParticipant = async (payload: JoinPayload, cookieHeader: string | undefined): Promise<boolean> => {
  const { sessionId, participantId, guestToken } = payload;
  if (!sessionId || !participantId) return false;

  if (guestToken) {
    const participant = await findParticipantForGuestToken(sessionId, guestToken);
    return participant !== null && participant.id === participantId;
  }

  const token = readTokenFromCookieHeader(cookieHeader) ?? payload.token;
  if (token) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return false;
    try {
      jwt.verify(token, jwtSecret);
      return true;
    } catch {
      return false;
    }
  }

  return false;
};

export const initSocket = (
  server: HttpServer,
  originCheck: (origin: string | undefined) => boolean
): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        callback(originCheck(origin) ? null : new Error("Not allowed by CORS"), true);
      },
      // Le navigateur n'envoie le cookie d'authentification au handshake
      // que si le serveur accepte les credentials.
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    let currentSessionId: number | null = null;
    let currentParticipantId: number | null = null;

    socket.on("session:join", async (payload: JoinPayload) => {
      try {
        const allowed = await canRepresentParticipant(payload, socket.handshake.headers.cookie);
        if (!allowed) return;

        const session = await findSessionById(payload.sessionId);
        if (!session || session.status === "closed") return;

        currentSessionId = payload.sessionId;
        currentParticipantId = payload.participantId;
        socket.join(roomName(payload.sessionId));

        await markParticipantOnline(payload.participantId);

        await emitParticipantsUpdated(payload.sessionId);
      } catch (error) {
        logger.error(`❌ socket session:join : ${error}`);
      }
    });

    socket.on("disconnect", async () => {
      if (currentSessionId === null || currentParticipantId === null) return;

      try {
        const session = await findSessionById(currentSessionId);
        if (!session || session.status === "closed") return;
        await markParticipantOffline(currentParticipantId);
        await emitParticipantsUpdated(currentSessionId);
      } catch (error) {
        logger.error(`❌ socket disconnect : ${error}`);
      }
    });
  });

  return io;
};

export const emitParticipantsUpdated = async (sessionId: number): Promise<void> => {
  if (!io) return;
  const participants = await getParticipantsForSession(sessionId);
  io.to(roomName(sessionId)).emit("session:participants-updated", participants);
};

export const emitSessionStarted = (sessionId: number, step: string, stepEndsAt: string | null): void => {
  if (!io) return;
  io.to(roomName(sessionId)).emit("session:started", { step, stepEndsAt });
};

// Le facilitateur a redéfini le timer : tous les clients reçoivent
// immédiatement la nouvelle échéance absolue.
export const emitSessionTimerUpdated = (sessionId: number, stepEndsAt: string): void => {
  if (!io) return;
  io.to(roomName(sessionId)).emit("session:timer-updated", { stepEndsAt });
};

export const emitSessionClosed = (sessionId: number): void => {
  if (!io) return;
  io.to(roomName(sessionId)).emit("session:closed");
};

export const emitMessageAdded = (sessionId: number, message: any): void => {
  if (!io) return;
  io.to(roomName(sessionId)).emit("session:message-added", message);
};

export const emitActionAdded = (sessionId: number, action: any): void => {
  if (!io) return;
  io.to(roomName(sessionId)).emit("session:action-added", action);
};

export const emitCommentAdded = (sessionId: number, cardId: number, comment: any): void => {
  if (!io) return;
  io.to(roomName(sessionId)).emit("session:comment-added", { cardId, comment });
};
