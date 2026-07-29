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
import { closeSessionIfExpiredByCode, findSessionByCode, findSessionById } from "../models/session.model";
import { assertSessionOpen, toMysqlDateTime } from "./session.service";
import { AppError } from "../utils/AppError";
import { RESUME_COOKIE_MAX_AGE_MS } from "../utils/authCookie";
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

// Un invité ne peut jamais rejoindre une session clôturée (contrairement à
// assertSessionExists, réservée à ensureAuthenticatedParticipant, qui doit
// rester permissive : elle est aussi appelée pour de simples lectures via
// resolveSessionActor, qui gère elle-même la vérification d'ouverture).
const assertSessionJoinable = async (sessionId: number) => {
  const session = await assertSessionExists(sessionId);
  assertSessionOpen(session);
  return session;
};



const assertNameAvailable = async (sessionId: number, displayName: string) => {
  const existing = await findParticipantByName(sessionId, displayName);
  if (existing) {
    throw new AppError(409, "Ce pseudo est déjà utilisé dans cette session.", "PARTICIPANT_NAME_TAKEN");
  }
};

// Un jeton invité n'est valable que 24h après la jointure (même durée que le
// cookie de reprise, voir authCookie.ts) : au-delà, il faut rejoindre à
// nouveau. Sans cette limite, un jeton stocké en localStorage resterait
// utilisable indéfiniment tant que la session reste ouverte (T-PART-02).
const assertGuestTokenNotExpired = (participant: ParticipantRow): void => {
  const joinedAtMs = new Date(participant.joined_at).getTime();
  if (Date.now() - joinedAtMs > RESUME_COOKIE_MAX_AGE_MS) {
    throw new AppError(401, "Votre session invitée a expiré, veuillez rejoindre à nouveau.", "GUEST_TOKEN_EXPIRED");
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
  // Existence seulement (pas d'ouverture) : réutilisée pour de simples
  // lectures via resolveSessionActor. Le blocage d'une vraie nouvelle
  // jointure sur session close est fait explicitement par joinAsSelf
  // (controller) et par resolveSessionActor (options.requireOpen).
  const session = await assertSessionExists(sessionId);
  assertSessionOpen(session);

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
  await assertSessionJoinable(sessionId);

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
  const nowUtc = toMysqlDateTime(new Date().toISOString());
  await closeSessionIfExpiredByCode(code, nowUtc);

  const session = await findSessionByCode(code);

  if (!session) {
    throw new AppError(404, "Aucune session ne correspond à ce code.", "SESSION_CODE_NOT_FOUND");
  }

  return joinSessionAsGuestParticipant(session.id, displayName);
};

// Reprise après refresh/reconnexion : le navigateur présente l'identifiant de
// participant + le jeton reçu au premier join, sans recréer de ligne.
// Existence seulement (pas d'ouverture) : réutilisée pour de simples lectures
// via resolveSessionActor (options.requireOpen gère le blocage en écriture).
// Le blocage d'une vraie reprise explicite (POST /participants/resume) sur
// une session close est fait par le contrôleur participant.controller.ts.
export const resumeGuestParticipant = async (
  sessionId: number,
  participantId: number,
  guestToken: string
): Promise<ParticipantSummary> => {
  const participant = await findParticipantById(participantId);

  if (!participant || participant.session_id !== sessionId || participant.guest_token !== guestToken) {
    throw new AppError(404, "Participant introuvable.", "PARTICIPANT_NOT_FOUND");
  }

  assertGuestTokenNotExpired(participant);

  await touchParticipant(participant.id, "online");
  return toSummary({ ...participant, status: "online" });
};

// Résolution destinée exclusivement aux lectures. Contrairement à une reprise,
// elle ne modifie ni le statut ni `last_seen_at`.
export const getGuestParticipantForRead = async (
  sessionId: number,
  participantId: number,
  guestToken: string
): Promise<ParticipantSummary> => {
  const participant = await findParticipantById(participantId);
  if (!participant || participant.session_id !== sessionId || participant.guest_token !== guestToken) {
    throw new AppError(404, "Participant introuvable.", "PARTICIPANT_NOT_FOUND");
  }
  assertGuestTokenNotExpired(participant);
  return toSummary(participant);
};

// Même principe pour un compte : un GET ne doit jamais créer ou remettre en
// ligne une participation.
export const getAuthenticatedParticipantForRead = async (
  sessionId: number,
  userId: number
): Promise<ParticipantSummary> => {
  const participant = await findParticipantByUserId(sessionId, userId);
  if (!participant) {
    throw new AppError(403, "Vous n'êtes pas autorisé à consulter cette session.", "PARTICIPANT_FORBIDDEN");
  }
  return toSummary(participant);
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
  const session = await assertSessionExists(sessionId);
  assertSessionOpen(session);
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

  // Un jeton invité périmé ne doit pas non plus permettre de renommer la
  // participation (même limite que la lecture/écriture, voir T-PART-02).
  if (requesterGuestToken !== null && participant.guest_token === requesterGuestToken) {
    assertGuestTokenNotExpired(participant);
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

  assertGuestTokenNotExpired(participant);

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
  const session = await assertSessionExists(sessionId);
  assertSessionOpen(session);
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

  // Cohérence avec les autres usages du jeton invité (T-PART-02) : même un
  // simple "quitter" ne doit pas rester actionnable indéfiniment avec un
  // jeton périmé. Un invité dans ce cas peut rejoindre à nouveau pour partir
  // proprement ; sinon le ménage par inactivité (US-14) nettoie la ligne.
  if (requesterGuestToken !== null && participant.guest_token === requesterGuestToken) {
    assertGuestTokenNotExpired(participant);
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
