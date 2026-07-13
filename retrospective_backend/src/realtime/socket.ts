import type { Server as HttpServer } from "http";
import { Server as SocketIOServer, type Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { getParticipantsForSession, markParticipantOffline, findParticipantForGuestToken } from "../services/participant.service";
import { logger } from "../utils/logger";

let io: SocketIOServer | null = null;

const roomName = (sessionId: number): string => `session:${sessionId}`;

interface JoinPayload {
  sessionId: number;
  participantId: number;
  guestToken?: string;
  token?: string;
}

// Un socket ne peut représenter qu'un seul participant à la fois : on vérifie
// qu'il connaît soit le jeton invité, soit un JWT valide, avant de le laisser
// rejoindre la room. Sans cette vérification, n'importe qui pourrait se
// faire passer pour un autre participant (et le faire passer "hors ligne").
const canRepresentParticipant = async (payload: JoinPayload): Promise<boolean> => {
  const { sessionId, participantId, guestToken, token } = payload;
  if (!sessionId || !participantId) return false;

  if (guestToken) {
    const participant = await findParticipantForGuestToken(sessionId, guestToken);
    return participant !== null && participant.id === participantId;
  }

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
    },
  });

  io.on("connection", (socket: Socket) => {
    let currentSessionId: number | null = null;
    let currentParticipantId: number | null = null;

    socket.on("session:join", async (payload: JoinPayload) => {
      try {
        const allowed = await canRepresentParticipant(payload);
        if (!allowed) return;

        currentSessionId = payload.sessionId;
        currentParticipantId = payload.participantId;
        socket.join(roomName(payload.sessionId));

        await emitParticipantsUpdated(payload.sessionId);
      } catch (error) {
        logger.error(`❌ socket session:join : ${error}`);
      }
    });

    socket.on("disconnect", async () => {
      if (currentSessionId === null || currentParticipantId === null) return;

      try {
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

export const emitSessionStarted = (sessionId: number, step: string): void => {
  if (!io) return;
  io.to(roomName(sessionId)).emit("session:started", { step });
};
