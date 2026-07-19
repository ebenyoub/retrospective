import crypto from "crypto";
import {
  countParticipants,
  deleteParticipant,
  findParticipantByGuestToken,
  findParticipantById,
  findParticipantByName,
  findParticipantByUserId,
  findParticipantsBySession,
  insertParticipant,
  touchParticipant,
  updateParticipantName,
} from "../models/participant.model";
import type { ParticipantRole, ParticipantRow } from "../models/types/participant.model.types";
import { findSessionByCode, findSessionById } from "../models/session.model";
import { AppError } from "../utils/AppError";
import type { GuestJoinResult, ParticipantSummary } from "./types/participant.service.types";

const toSummary = (row: ParticipantRow): ParticipantSummary => ({
  id: row.id,
  sessionId: row.session_id,
  displayName: row.display_name,
  role: row.role,
  status: row.status,
  joinedAt: row.joined_at,
  lastSeenAt: row.last_seen_at,
});

const assertSessionExists = async (sessionId: number) => {
  const session = await findSessionById(sessionId);
  if (!session) {
    throw new AppError(404, "Session non trouvée.", "SESSION_NOT_FOUND");
  }
  return session;
};



const assertNameAvailable = async (sessionId: number, displayName: string) => {
  const existing = await findParticipantByName(sessionId, displayName);
  if (existing) {
    throw new AppError(409, "Ce pseudo est déjà utilisé dans cette session.", "PARTICIPANT_NAME_TAKEN");
  }
};

export const getParticipantsForSession = async (sessionId: number): Promise<ParticipantSummary[]> => {
  const rows = await findParticipantsBySession(sessionId);
  return rows.map(toSummary);
};

// Le facilitateur (ou tout utilisateur authentifié visitant le lien) obtient
// sa propre ligne dans la même table que les invités, de façon idempotente :
// un refresh ne crée jamais de deuxième ligne pour le même user_id.
export const ensureAuthenticatedParticipant = async ({
  sessionId,
  userId,
  displayName,
  role,
}: {
  sessionId: number;
  userId: number;
  displayName: string;
  role: ParticipantRole;
}): Promise<ParticipantSummary> => {
  await assertSessionExists(sessionId);

  const existing = await findParticipantByUserId(sessionId, userId);

  if (existing) {
    await touchParticipant(existing.id, "online");
    return toSummary({ ...existing, status: "online" });
  }



  // Le nom peut déjà être pris par un invité de cette session : rejoindre
  // est une action automatique, donc on désambiguïse le pseudo.
  const nameTaken = await findParticipantByName(sessionId, displayName);
  const finalName = nameTaken
    ? `${displayName.slice(0, 50)}-${crypto.randomBytes(2).toString("hex")}`
    : displayName;

  try {
    const participantId = await insertParticipant({
      sessionId,
      userId,
      guestToken: null,
      displayName: finalName,
      role,
    });

    const created = await findParticipantById(participantId);

    if (!created) {
      throw new AppError(
        500,
        "Impossible de rejoindre la session.",
        "PARTICIPANT_CREATE_FAILED"
      );
    }

    return toSummary(created);
  } catch (error) {
    const isDuplicateEntry =
      (error as { code?: string }).code === "ER_DUP_ENTRY";

    if (!isDuplicateEntry) {
      throw error;
    }

    // Un autre appel concurrent a probablement créé la participation
    // entre la vérification initiale et l'insertion.
    const participantCreatedConcurrently =
      await findParticipantByUserId(sessionId, userId);

    if (!participantCreatedConcurrently) {
      throw error;
    }

    await touchParticipant(participantCreatedConcurrently.id, "online");

    return toSummary({
      ...participantCreatedConcurrently,
      status: "online",
    });
  }
};

// Participant invité : aucun compte créé. Le pseudo est conservé tel quel
// (pas de suffixe automatique) ; s'il est déjà pris dans CETTE session, on
// renvoie une erreur claire pour que l'utilisateur en choisisse un autre.
export const joinSessionAsGuestParticipant = async (
  sessionId: number,
  displayName: string
): Promise<GuestJoinResult> => {
  await assertSessionExists(sessionId);

  await assertNameAvailable(sessionId, displayName);

  const guestToken = crypto.randomBytes(24).toString("hex");

  let participantId: number;
  try {
    participantId = await insertParticipant({
      sessionId,
      userId: null,
      guestToken,
      displayName,
      role: "participant",
    });
  } catch (error) {
    const isDuplicateName = (error as { code?: string }).code === "ER_DUP_ENTRY";
    if (isDuplicateName) {
      throw new AppError(409, "Ce pseudo est déjà utilisé dans cette session.", "PARTICIPANT_NAME_TAKEN");
    }
    throw error;
  }

  const created = await findParticipantById(participantId);
  if (!created) {
    throw new AppError(500, "Impossible de rejoindre la session.", "PARTICIPANT_CREATE_FAILED");
  }

  return { participant: toSummary(created), guestToken };
};

export const joinSessionAsGuestParticipantByCode = async (
  code: string,
  displayName: string
): Promise<GuestJoinResult> => {
  const session = await findSessionByCode(code);

  if (!session) {
    throw new AppError(404, "Aucune session ne correspond à ce code.", "SESSION_CODE_NOT_FOUND");
  }

  return joinSessionAsGuestParticipant(session.id, displayName);
};

// Reprise après refresh/reconnexion : le navigateur présente l'identifiant de
// participant + le jeton reçu au premier join, sans recréer de ligne.
export const resumeGuestParticipant = async (
  sessionId: number,
  participantId: number,
  guestToken: string
): Promise<ParticipantSummary> => {
  const participant = await findParticipantById(participantId);

  if (!participant || participant.session_id !== sessionId || participant.guest_token !== guestToken) {
    throw new AppError(404, "Participant introuvable.", "PARTICIPANT_NOT_FOUND");
  }

  await touchParticipant(participant.id, "online");
  return toSummary({ ...participant, status: "online" });
};

export const markParticipantOffline = async (participantId: number): Promise<void> => {
  await touchParticipant(participantId, "offline");
};

// Changement de pseudo : seul le propriétaire de la ligne (invité via son
// jeton, utilisateur via son compte) peut renommer SA participation.
export const renameParticipant = async ({
  sessionId,
  participantId,
  displayName,
  requesterUserId,
  requesterGuestToken,
}: {
  sessionId: number;
  participantId: number;
  displayName: string;
  requesterUserId: number | null;
  requesterGuestToken: string | null;
}): Promise<ParticipantSummary> => {
  const participant = await findParticipantById(participantId);

  if (!participant || participant.session_id !== sessionId) {
    throw new AppError(404, "Participant introuvable.", "PARTICIPANT_NOT_FOUND");
  }

  const isOwnerOfRow =
    (requesterUserId !== null && participant.user_id === requesterUserId) ||
    (requesterGuestToken !== null && participant.guest_token === requesterGuestToken);

  if (!isOwnerOfRow) {
    throw new AppError(403, "Vous ne pouvez modifier que votre propre pseudo.", "PARTICIPANT_FORBIDDEN");
  }

  // Pseudo inchangé : rien à faire (et pas de conflit avec soi-même).
  if (participant.display_name === displayName) {
    return toSummary(participant);
  }

  await assertNameAvailable(sessionId, displayName);
  await updateParticipantName(participantId, displayName);

  return toSummary({ ...participant, display_name: displayName });
};

// Vérification de reprise depuis l'accueil : valide l'identité invitée SANS
// remettre le participant "en ligne" (il n'est pas dans la session).
export const checkGuestResume = async (
  sessionId: number,
  participantId: number,
  guestToken: string | null
): Promise<{ sessionId: number; sessionName: string; displayName: string }> => {
  const session = await findSessionById(sessionId);

  if (!session || session.status !== "open") {
    throw new AppError(404, "Cette session n'est plus disponible.", "SESSION_UNAVAILABLE");
  }

  const participant = await findParticipantById(participantId);

  if (!participant || participant.session_id !== sessionId || participant.guest_token !== guestToken) {
    throw new AppError(404, "Participant introuvable.", "PARTICIPANT_NOT_FOUND");
  }

  return {
    sessionId: session.id,
    sessionName: session.name,
    displayName: participant.display_name,
  };
};

// Quitter explicitement : supprime la ligne (contrairement à une simple
// déconnexion socket, qui ne fait que passer le statut à "offline").
export const leaveSession = async ({
  sessionId,
  participantId,
  requesterUserId,
  requesterGuestToken,
}: {
  sessionId: number;
  participantId: number;
  requesterUserId: number | null;
  requesterGuestToken: string | null;
}): Promise<void> => {
  const participant = await findParticipantById(participantId);

  if (!participant || participant.session_id !== sessionId) {
    throw new AppError(404, "Participant introuvable.", "PARTICIPANT_NOT_FOUND");
  }

  const isOwnerOfRow =
    (requesterUserId !== null && participant.user_id === requesterUserId) ||
    (requesterGuestToken !== null && participant.guest_token === requesterGuestToken);

  if (!isOwnerOfRow) {
    throw new AppError(403, "Vous ne pouvez quitter que votre propre participation.", "PARTICIPANT_FORBIDDEN");
  }

  await deleteParticipant(participantId);
};

export const findParticipantForGuestToken = async (
  sessionId: number,
  guestToken: string
): Promise<ParticipantSummary | null> => {
  const participant = await findParticipantByGuestToken(sessionId, guestToken);
  return participant ? toSummary(participant) : null;
};
