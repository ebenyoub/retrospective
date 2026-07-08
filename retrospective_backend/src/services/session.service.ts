import crypto from "crypto";
import {
  closeExpiredSessionsForOwner,
  findActiveSessionForOwner,
  findSessionByCode,
  findSessionsForUser,
  findSessionUserJoin,
  insertSession,
  insertSessionUserJoin,
  type SessionRole,
} from '../models/session.model';
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { SessionType } from "../types";

export interface SessionListItem {
  id: number;
  code: string;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  role: SessionRole;
}

interface CreateSessionInput {
  userId?: number;
}

interface CreatedSessionResult {
  statusCode: 200 | 201;
  message: string;
  data: SessionType | {
    sessionId: number;
    code: string;
    expiresAt: string;
  };
}

interface JoinSessionInput {
  userId?: number;
  code: unknown;
}

interface JoinSessionResult {
  statusCode: 200 | 201;
  message: string;
  data: {
    joinId: number;
    sessionId: number;
  };
}

export const getSessionsForUser = async (userId: number): Promise<SessionListItem[]> => {
  const rows = await findSessionsForUser(userId);

  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    status: row.status,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    role: row.role,
  }));
};

const toMysqlDateTime = (value: string): string =>
  value
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, '');

export const createSessionForUser = async ({ userId }: CreateSessionInput): Promise<CreatedSessionResult> => {
  if (!userId) {
    throw new AppError(401, "Impossible de créer la session : utilisateur non identifié", "USER_NOT_IDENTIFIED");
  }

  const nowUtc = new Date().toISOString();
  const closeResult = await closeExpiredSessionsForOwner(userId, nowUtc);

  if (closeResult.changedRows > 0) {
    logger.info(`🧹 ${closeResult.affectedRows} session(s) expirée(s) fermée(s).`);
  }

  const activeSession = await findActiveSessionForOwner(userId, nowUtc);

  if (activeSession) {
    logger.info(`✅ Session active récupérée. Code => ${activeSession.code}`);
    return {
      statusCode: 200,
      message: "Session active récupérée.",
      data: activeSession,
    };
  }

  const code = crypto.randomInt(1000, 9999).toString();
  logger.info(`🔐 Nouveau code généré : ${code}`);

  try {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const sessionId = await insertSession(code, userId, toMysqlDateTime(expiresAt));

    logger.info(`ℹ️sessionId : ${sessionId}`);

    return {
      statusCode: 201,
      message: "Session créée.",
      data: {
        sessionId,
        code,
        expiresAt,
      },
    };
  } catch (error) {
    logger.error(`❌ Erreur lors de la création de session : ${error}`);
    throw new AppError(500, "Une erreur est survenue lors de la création de la session.", "SESSION_CREATE_FAILED");
  }
};

export const joinSessionForUser = async ({ userId, code }: JoinSessionInput): Promise<JoinSessionResult> => {
  if (!code || typeof code !== "string" || !userId) {
    throw new AppError(401, "Le code de session et l'ID utilisateur sont requis.", "SESSION_CODE_AND_USER_REQUIRED");
  }

  const sessionData = await findSessionByCode(code);

  if (!sessionData) {
    throw new AppError(404, `Aucune session ne correcpond à ce code : ${code}`, "SESSION_CODE_NOT_FOUND");
  }

  const sessionId = sessionData.id;
  logger.info(`ℹ️ Session récupéré pour jointure : ${sessionId}`);

  const jointure = await findSessionUserJoin(userId, sessionId);

  if (jointure) {
    logger.warn(`⚠️ L'utilisateur ${userId} à déjà rejoint la session ${sessionId}`);

    return {
      statusCode: 200,
      message: "Vous avez déjà rejoint cette session.",
      data: { joinId: jointure.id, sessionId },
    };
  }

  const insertResult = await insertSessionUserJoin(userId, sessionId);

  if (insertResult.affectedRows === 0) {
    throw new AppError(
      500,
      "Une erreur est survenue lors de l'enregistrement de la jointure de session.",
      "SESSION_JOIN_CREATE_FAILED"
    );
  }

  logger.info(`Insertion : ${insertResult.insertId}`);

  return {
    statusCode: 201,
    message: "Session jointe avec succès.",
    data: { joinId: insertResult.insertId, sessionId },
  };
};
