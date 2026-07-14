import crypto from "crypto";
import {
  closeExpiredSessionsForOwner,
  closeActiveSessionsForOwner,
  findSessionByCode,
  findSessionsForUser,
  findSessionUserJoin,
  insertSession,
  insertSessionUserJoin,
  findSessionById,
  updateSessionStep,
  updateSessionFormat,
  type SessionRole,
} from '../models/session.model';
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { SessionType } from "../types";
import {
  DEFAULT_RETRO_FORMAT_PRESET,
  getRetroFormatColumnLabels,
  isValidRetroFormatSelection,
} from "../constants/retroFormats";

export interface SessionListItem {
  id: number;
  name: string;
  code: string;
  status: string;
  step: "waiting" | "writing" | "voting" | "results";
  expiresAt: Date;
  createdAt: Date;
  role: SessionRole;
}

interface CreateSessionInput {
  userId?: number;
  name?: unknown;
  formatName?: unknown;
  formatColumns?: unknown;
}

interface CreatedSessionResult {
  statusCode: 200 | 201;
  message: string;
  data: SessionType | {
    sessionId: number;
    name: string;
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
    name: row.name,
    code: row.code,
    status: row.status,
    step: row.step,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    role: row.role,
  }));
};

const toMysqlDateTime = (value: string): string =>
  value
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, '');

export const createSessionForUser = async ({
  userId,
  name,
  formatName,
  formatColumns,
}: CreateSessionInput): Promise<CreatedSessionResult> => {
  if (!userId) {
    throw new AppError(401, "Impossible de créer la session : utilisateur non identifié", "USER_NOT_IDENTIFIED");
  }

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new AppError(400, "Le nom de session est obligatoire.", "SESSION_NAME_REQUIRED");
  }

  const selectedFormatName = typeof formatName === "string"
    ? formatName.trim()
    : DEFAULT_RETRO_FORMAT_PRESET.name;
  const selectedFormatColumns = Array.isArray(formatColumns)
    ? formatColumns
      .filter((column): column is string => typeof column === "string")
      .map((column) => column.trim())
    : getRetroFormatColumnLabels(DEFAULT_RETRO_FORMAT_PRESET);

  if (!isValidRetroFormatSelection(selectedFormatName, selectedFormatColumns)) {
    throw new AppError(400, "Le format de rétrospective est invalide.", "FORMAT_INVALID");
  }

  const nowUtc = new Date().toISOString();
  const closeResult = await closeExpiredSessionsForOwner(userId, nowUtc);

  if (closeResult.changedRows > 0) {
    logger.info(`🧹 ${closeResult.affectedRows} session(s) expirée(s) fermée(s).`);
  }

  // Afin d'éviter la réutilisation silencieuse d'une ancienne session et d'assurer qu'une nouvelle session
  // est toujours créée avec le nom saisi, on ferme toutes les sessions actives en cours du propriétaire.
  const closeActiveResult = await closeActiveSessionsForOwner(userId);
  if (closeActiveResult.affectedRows > 0) {
    logger.info(`🧹 ${closeActiveResult.affectedRows} session(s) active(s) fermée(s) pour le propriétaire.`);
  }

  const code = crypto.randomInt(1000, 9999).toString();
  logger.info(`🔐 Nouveau code généré : ${code}`);

  try {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const sessionId = await insertSession(
      name.trim(),
      code,
      userId,
      toMysqlDateTime(expiresAt),
      selectedFormatName,
      selectedFormatColumns
    );

    logger.info(`ℹ️sessionId : ${sessionId}`);

    return {
      statusCode: 201,
      message: "Session créée.",
      data: {
        sessionId,
        name: name.trim(),
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

export interface SessionDetails {
  id: number;
  name: string;
  code: string;
  status: string;
  step: "waiting" | "writing" | "voting" | "results";
  ownerId: number;
  formatName: string;
  formatColumns: string[];
  expiresAt: Date;
  createdAt: Date;
}

export const getSessionDetails = async (sessionId: number): Promise<SessionDetails> => {
  const session = await findSessionById(sessionId);

  if (!session) {
    throw new AppError(404, "Session non trouvée.", "SESSION_NOT_FOUND");
  }

  return {
    id: session.id,
    name: session.name,
    code: session.code,
    status: session.status,
    step: session.step,
    ownerId: session.owner_id,
    formatName: session.format_name,
    formatColumns: session.format_columns,
    expiresAt: session.expires_at,
    createdAt: session.created_at,
  };
};

export const updateSessionFormatService = async (
  sessionId: number,
  userId: number,
  formatName: string,
  formatColumns: string[]
): Promise<SessionDetails> => {
  const session = await findSessionById(sessionId);

  if (!session) {
    throw new AppError(404, "Session non trouvée.", "SESSION_NOT_FOUND");
  }

  if (session.owner_id !== userId) {
    throw new AppError(403, "Seul le facilitateur peut modifier le format de la session.", "FORBIDDEN");
  }

  if (!isValidRetroFormatSelection(formatName, formatColumns)) {
    throw new AppError(400, "Le format de rétrospective est invalide.", "FORMAT_INVALID");
  }

  await updateSessionFormat(sessionId, formatName, formatColumns);

  return getSessionDetails(sessionId);
};

export const updateSessionStepService = async (
  sessionId: number,
  userId: number,
  step: "waiting" | "writing" | "voting" | "results"
): Promise<boolean> => {
  const session = await findSessionById(sessionId);

  if (!session) {
    throw new AppError(404, "Session non trouvée.", "SESSION_NOT_FOUND");
  }

  if (session.owner_id !== userId) {
    throw new AppError(403, "Seul le facilitateur peut modifier l'étape de la session.", "FORBIDDEN");
  }

  const updated = await updateSessionStep(sessionId, step);

  if (!updated) {
    throw new AppError(500, "Impossible de mettre à jour l'étape de la session.", "SESSION_STEP_UPDATE_FAILED");
  }

  return true;
};
