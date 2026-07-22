import crypto from "crypto";
import {
  closeExpiredSessionsForOwner,
  closeActiveSessionsForOwner,
  closeInactiveSessions,
  closeSessionIfExpiredByCode,
  findSessionByCode,
  findSessionsForUser,
  findSessionUserJoin,
  insertSession,
  insertSessionUserJoin,
  findSessionById,
  updateSessionStep,
  updateSessionStepDeadline,
  updateSessionStepDuration,
  updateSessionFormat,
  closeSessionById,
  updateSessionName,
  deleteSessionById,
} from '../models/session.model';
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import {
  DEFAULT_RETRO_FORMAT_PRESET,
  getRetroFormatColumnLabels,
  isValidRetroFormatSelection,
} from "../constants/retroFormats";
import type {
  CreatedSessionResult,
  CreateSessionInput,
  JoinSessionInput,
  JoinSessionResult,
  SessionDetails,
  SessionListItem,
} from "./types/session.service.types";

// Bornes de la durée d'une étape (en minutes), partagées par la création
// et l'ajustement du timer.
export const STEP_DURATION_MIN = 1;
export const STEP_DURATION_MAX = 120;
export const STEP_DURATION_DEFAULT = 5;

// Une session ouverte sans la moindre activité pendant cette durée est
// considérée abandonnée et clôturée au prochain passage de sweepInactiveSessions
// (ménage opportuniste, pas une tâche planifiée — voir son commentaire).
export const SESSION_INACTIVITY_DAYS = 30;

const isValidStepDuration = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= STEP_DURATION_MIN &&
  value <= STEP_DURATION_MAX;

// L'échéance est calculée par le serveur : c'est la seule horloge de référence.
const computeStepEndsAtIso = (minutes: number): string =>
  new Date(Date.now() + minutes * 60 * 1000).toISOString();

// Ménage OPPORTUNISTE, pas une tâche planifiée : il ne s'exécute que lorsqu'un
// de ces points d'entrée est appelé. Si personne ne crée ni ne consulte "Mes
// sessions" pendant des mois, aucune session abandonnée n'est libérée entre
// temps — c'est une limite assumée (pas de vrai cron dans ce projet), pas une
// expiration au sens strict d'une tâche de fond garantie.
const sweepInactiveSessions = async (): Promise<void> => {
  const nowUtc = toMysqlDateTime(new Date().toISOString());
  const inactivityCutoff = toMysqlDateTime(
    new Date(Date.now() - SESSION_INACTIVITY_DAYS * 24 * 60 * 60 * 1000).toISOString()
  );
  const result = await closeInactiveSessions(nowUtc, inactivityCutoff);

  if (result.affectedRows > 0) {
    logger.info(`🧹 ${result.affectedRows} session(s) inactive(s) depuis plus de ${SESSION_INACTIVITY_DAYS} jours clôturée(s).`);
  }
};

export const getSessionsForUser = async (userId: number): Promise<SessionListItem[]> => {
  // Déclenché ici aussi (pas seulement à la création) : consulter "Mes
  // sessions" est une action bien plus fréquente que créer une session.
  await sweepInactiveSessions();

  const rows = await findSessionsForUser(userId);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    joinCode: row.join_code,
    status: row.status,
    step: row.step,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    role: row.role,
  }));
};

export const toMysqlDateTime = (value: string): string =>
  value
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, '');

export const createSessionForUser = async (data: CreateSessionInput): Promise<CreatedSessionResult> => {
  const { userId, name, formatName, formatColumns, stepDurationMinutes } = data;

  if (!userId) {
    throw new AppError(401, "Impossible de créer la session : utilisateur non identifié", "USER_NOT_IDENTIFIED");
  }

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new AppError(400, "Le nom de session est obligatoire.", "SESSION_NAME_REQUIRED");
  }

  const selectedFormatName = typeof formatName === "string" ? formatName.trim() : DEFAULT_RETRO_FORMAT_PRESET.name;

  const selectedFormatColumns = Array.isArray(formatColumns)
    ? formatColumns
      .filter((column): column is string => typeof column === "string")
      .map((column) => column.trim())
    : getRetroFormatColumnLabels(DEFAULT_RETRO_FORMAT_PRESET);

  if (!isValidRetroFormatSelection(selectedFormatName, selectedFormatColumns)) {
    throw new AppError(400, "Le format de rétrospective est invalide.", "FORMAT_INVALID");
  }

  // Absente (anciens clients), la durée retombe sur la valeur par défaut.
  const selectedStepDuration = isValidStepDuration(stepDurationMinutes)
    ? stepDurationMinutes
    : STEP_DURATION_DEFAULT;

  // Converti au format MySQL : les colonnes expires_at/closed_at sont des
  // DATETIME, une comparaison fiable exige le même format qu'à l'insertion.
  const nowUtc = toMysqlDateTime(new Date().toISOString());
  const closeResult = await closeExpiredSessionsForOwner(userId, nowUtc);

  if (closeResult.changedRows > 0) {
    logger.info(`🧹 ${closeResult.affectedRows} session(s) expirée(s) fermée(s).`);
  }

  // Afin d'éviter la réutilisation silencieuse d'une ancienne session et d'assurer qu'une nouvelle session
  // est toujours créée avec le nom saisi, on ferme toutes les sessions actives en cours du propriétaire.
  const closeActiveResult = await closeActiveSessionsForOwner(userId, nowUtc);
  if (closeActiveResult.affectedRows > 0) {
    logger.info(`🧹 ${closeActiveResult.affectedRows} session(s) active(s) fermée(s) pour le propriétaire.`);
  }

  // Ménage global (pas seulement pour ce propriétaire), voir sweepInactiveSessions.
  await sweepInactiveSessions();

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  // Le code doit être unique parmi les sessions actuellement ouvertes (contrainte
  // UNIQUE en base sur join_code, NULL autorisé en plusieurs exemplaires pour les
  // sessions closes). Collision extrêmement rare vu l'espace 1000-9999 : on retente
  // simplement avec un nouveau tirage plutôt que d'échouer.
  const MAX_CODE_ATTEMPTS = 8;

  for (let attempt = 1; attempt <= MAX_CODE_ATTEMPTS; attempt++) {
    const code = crypto.randomInt(1000, 9999).toString();

    try {
      const sessionId = await insertSession(
        name.trim(),
        code,
        userId,
        toMysqlDateTime(expiresAt),
        selectedFormatName,
        selectedFormatColumns,
        selectedStepDuration
      );

      logger.info(`🔐 Nouveau code généré : ${code} (sessionId : ${sessionId})`);

      return {
        statusCode: 201,
        message: "Session créée.",
        data: {
          sessionId,
          name: name.trim(),
          joinCode: code,
          expiresAt,
        },
      };
    } catch (error) {
      const isDuplicateCode = (error as { code?: string }).code === "ER_DUP_ENTRY";

      if (isDuplicateCode && attempt < MAX_CODE_ATTEMPTS) {
        logger.warn(`⚠️ Code ${code} déjà pris par une session active, nouvel essai (${attempt}/${MAX_CODE_ATTEMPTS}).`);
        continue;
      }

      logger.error(`❌ Erreur lors de la création de session : ${error}`);
      throw new AppError(500, "Une erreur est survenue lors de la création de la session.", "SESSION_CREATE_FAILED");
    }
  }

  throw new AppError(500, "Une erreur est survenue lors de la création de la session.", "SESSION_CREATE_FAILED");
};

export const joinSessionForUser = async ({ userId, code }: JoinSessionInput): Promise<JoinSessionResult> => {
  if (!code || typeof code !== "string" || !userId) {
    throw new AppError(401, "Le code de session et l'ID utilisateur sont requis.", "SESSION_CODE_AND_USER_REQUIRED");
  }

  const nowUtc = toMysqlDateTime(new Date().toISOString());
  await closeSessionIfExpiredByCode(code, nowUtc);

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

export const getSessionDetails = async (sessionId: number): Promise<SessionDetails> => {
  const session = await findSessionById(sessionId);

  if (!session) {
    throw new AppError(404, "Session non trouvée.", "SESSION_NOT_FOUND");
  }

  return {
    id: session.id,
    name: session.name,
    joinCode: session.join_code,
    status: session.status,
    step: session.step,
    ownerId: session.owner_id,
    formatName: session.format_name,
    formatColumns: session.format_columns,
    stepDurationMinutes: session.step_duration_minutes,
    stepEndsAt: session.step_ends_at,
    expiresAt: session.expires_at,
    closedAt: session.closed_at,
    createdAt: session.created_at,
  };
};

// Salle d'attente publique (GET /:sessionId, sans middleware `auth`) : une
// session ouverte reste lisible par n'importe qui (invité potentiel). Une
// session clôturée n'a plus vocation à être "une salle d'attente" — on exige
// alors une identité (facilitateur ou ancien participant), sinon 404 pour ne
// pas révéler qu'elle a existé.
export const getSessionDetailsForViewer = async (
  sessionId: number,
  viewerUserId: number | null
): Promise<SessionDetails> => {
  const session = await getSessionDetails(sessionId);

  if (session.status !== "closed") {
    return session;
  }

  const isOwner = viewerUserId !== null && session.ownerId === viewerUserId;
  const wasParticipant = viewerUserId !== null && (await findSessionUserJoin(viewerUserId, sessionId)) !== null;

  if (!isOwner && !wasParticipant) {
    throw new AppError(404, "Session non trouvée.", "SESSION_NOT_FOUND");
  }

  return session;
};

// Une session clôturée est en lecture seule : plus aucune écriture (étape,
// timer, format, nom, cartes, votes, commentaires, messages, actions,
// nouvelles participations) n'est acceptée une fois `status` passé à "closed".
export const assertSessionOpen = (session: { status: string }): void => {
  if (session.status !== "open") {
    throw new AppError(400, "Cette session est clôturée : elle est désormais en lecture seule.", "SESSION_CLOSED");
  }
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

  assertSessionOpen(session);

  if (!isValidRetroFormatSelection(formatName, formatColumns)) {
    throw new AppError(400, "Le format de rétrospective est invalide.", "FORMAT_INVALID");
  }

  await updateSessionFormat(sessionId, formatName, formatColumns);

  return getSessionDetails(sessionId);
};

export const updateSessionStepService = async (
  sessionId: number,
  userId: number,
  step: "waiting" | "writing" | "voting" | "results" | "action" | "summary"
): Promise<{ stepEndsAt: string | null }> => {
  const session = await findSessionById(sessionId);

  if (!session) {
    throw new AppError(404, "Session non trouvée.", "SESSION_NOT_FOUND");
  }

  if (session.owner_id !== userId) {
    throw new AppError(403, "Seul le facilitateur peut modifier l'étape de la session.", "FORBIDDEN");
  }

  assertSessionOpen(session);

  // Seules les étapes chronométrées reçoivent une échéance : le timer
  // démarre ici, une seule fois, pour tous les participants.
  const stepEndsAt = (step === "writing" || step === "voting")
    ? computeStepEndsAtIso(session.step_duration_minutes)
    : null;

  const updated = await updateSessionStep(sessionId, step, stepEndsAt ? toMysqlDateTime(stepEndsAt) : null);

  if (!updated) {
    throw new AppError(500, "Impossible de mettre à jour l'étape de la session.", "SESSION_STEP_UPDATE_FAILED");
  }

  return { stepEndsAt };
};

// Réglage du timer par le facilitateur :
// - en salle d'attente, la valeur devient la nouvelle durée par défaut ;
// - pendant une étape chronométrée, elle redéfinit le temps restant.
export const updateSessionTimerService = async (
  sessionId: number,
  userId: number,
  minutes: number
): Promise<{ stepEndsAt: string | null; stepDurationMinutes: number }> => {
  const session = await findSessionById(sessionId);

  if (!session) {
    throw new AppError(404, "Session non trouvée.", "SESSION_NOT_FOUND");
  }

  if (session.owner_id !== userId) {
    throw new AppError(403, "Seul le facilitateur peut modifier le timer de la session.", "FORBIDDEN");
  }

  assertSessionOpen(session);

  if (!isValidStepDuration(minutes)) {
    throw new AppError(400, `La durée doit être un nombre entier entre ${STEP_DURATION_MIN} et ${STEP_DURATION_MAX} minutes.`, "TIMER_DURATION_INVALID");
  }

  if (session.step === "waiting") {
    const updated = await updateSessionStepDuration(sessionId, minutes);

    if (!updated) {
      throw new AppError(500, "Impossible de mettre à jour la durée des étapes.", "TIMER_UPDATE_FAILED");
    }

    return { stepEndsAt: null, stepDurationMinutes: minutes };
  }

  if (session.step === "writing" || session.step === "voting") {
    const stepEndsAt = computeStepEndsAtIso(minutes);
    const updated = await updateSessionStepDeadline(sessionId, toMysqlDateTime(stepEndsAt));

    if (!updated) {
      throw new AppError(500, "Impossible de mettre à jour le timer.", "TIMER_UPDATE_FAILED");
    }

    return { stepEndsAt, stepDurationMinutes: session.step_duration_minutes };
  }

  throw new AppError(400, "Le timer ne peut pas être modifié sur l'écran des résultats.", "TIMER_STEP_INVALID");
};

export const closeSessionService = async (
  sessionId: number,
  userId: number
): Promise<void> => {
  const session = await findSessionById(sessionId);

  if (!session) {
    throw new AppError(404, "Session non trouvée.", "SESSION_NOT_FOUND");
  }

  if (session.owner_id !== userId) {
    throw new AppError(403, "Seul le facilitateur peut fermer la session.", "FORBIDDEN");
  }

  if (session.status === "closed") {
    throw new AppError(400, "Cette session est déjà clôturée.", "SESSION_ALREADY_CLOSED");
  }

  const nowUtc = toMysqlDateTime(new Date().toISOString());
  const closed = await closeSessionById(sessionId, userId, nowUtc);
  if (!closed) {
    throw new AppError(500, "Impossible de fermer la session.", "SESSION_CLOSE_FAILED");
  }
};

export const updateSessionNameService = async (
  sessionId: number,
  userId: number,
  name: string
): Promise<void> => {
  const session = await findSessionById(sessionId);

  if (!session) {
    throw new AppError(404, "Session non trouvée.", "SESSION_NOT_FOUND");
  }

  if (session.owner_id !== userId) {
    throw new AppError(403, "Seul le facilitateur peut modifier le nom de la session.", "FORBIDDEN");
  }

  assertSessionOpen(session);

  if (!name || name.trim().length === 0) {
    throw new AppError(400, "Le nom de la session ne peut pas être vide.", "SESSION_NAME_REQUIRED");
  }

  if (session.name === name.trim()) {
    return;
  }

  const updated = await updateSessionName(sessionId, userId, name.trim());
  if (!updated) {
    throw new AppError(500, "Impossible de renommer la session.", "SESSION_RENAME_FAILED");
  }
};

export const deleteSessionService = async (
  sessionId: number,
  userId: number
): Promise<void> => {
  const session = await findSessionById(sessionId);

  if (!session) {
    throw new AppError(404, "Session non trouvée.", "SESSION_NOT_FOUND");
  }

  if (session.owner_id !== userId) {
    throw new AppError(403, "Seul le facilitateur peut supprimer la session.", "FORBIDDEN");
  }

  assertSessionOpen(session);

  const deleted = await deleteSessionById(sessionId, userId);
  if (!deleted) {
    throw new AppError(500, "Impossible de supprimer la session.", "SESSION_DELETE_FAILED");
  }
};
