import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  joinAsSelf,
  leaveParticipant,
  renameParticipant,
  resumeGuestParticipant,
} from '../services/participantApi';
import type { GuestJoinResponse, SelfIdentity } from '../types/participant.types';
import type { SessionRole } from '../types/session.types';
import { useGuestParticipant } from './useGuestParticipant';
import type { UseSessionIdentityOptions } from './types/useSessionIdentity.types';

const isValidSessionId = (sessionId: string): boolean => {
  const sessionIdNumber = Number(sessionId);
  return Boolean(sessionId && sessionId !== 'undefined' && !isNaN(sessionIdNumber) && sessionIdNumber > 0);
};

const createGuestHeaders = (participantId: number, guestToken: string): Record<string, string> => ({
  'x-participant-id': String(participantId),
  'x-guest-token': guestToken,
});

export const useSessionIdentity = ({
  sessionId,
  isSessionReady,
  isAuthenticated,
  userId,
  ownerId,
  sessionStatus,
}: UseSessionIdentityOptions) => {
  const {
    identity: guestIdentity,
    setIdentity: setGuestIdentity,
    clearIdentity: clearGuestIdentity,
  } = useGuestParticipant(sessionId);
  const [selfParticipantId, setSelfParticipantId] = useState<number | null>(null);
  const [participantRole, setParticipantRole] = useState<SessionRole | null>(null);

  // L'utilisateur connecté est identifié par son cookie HttpOnly (envoyé
  // automatiquement) : ses "headers d'acteur" se limitent à son numéro de
  // participant. L'invité, lui, prouve son identité avec son jeton.
  const actorHeaders = useMemo((): Record<string, string> | null => {
    if (isAuthenticated) {
      return selfParticipantId ? { 'x-participant-id': String(selfParticipantId) } : {};
    }

    if (guestIdentity && selfParticipantId) {
      return createGuestHeaders(selfParticipantId, guestIdentity.guestToken);
    }

    return null;
  }, [isAuthenticated, selfParticipantId, guestIdentity]);

  const selfIdentityForSocket = useMemo((): SelfIdentity | null => {
    if (!selfParticipantId) return null;
    if (isAuthenticated) return { participantId: selfParticipantId };
    if (guestIdentity) return { participantId: selfParticipantId, guestToken: guestIdentity.guestToken };
    return null;
  }, [selfParticipantId, isAuthenticated, guestIdentity]);

  const role = useMemo((): SessionRole | null => {
    if (isAuthenticated && userId && ownerId !== null) {
      return ownerId === userId ? 'facilitator' : 'participant';
    }

    return participantRole;
  }, [isAuthenticated, userId, ownerId, participantRole]);

  useEffect(() => {
    if (!isValidSessionId(sessionId)) return;
    if (!isSessionReady || !isAuthenticated || selfParticipantId || sessionStatus === 'closed') return;

    let isActive = true;

    const ensureSelf = async (): Promise<void> => {
      try {
        const result = await joinAsSelf(sessionId);

        if (!isActive) return;

        if (result.ok) {
          setSelfParticipantId(result.data.id);
          setParticipantRole(result.data.role);
          return;
        }

        // Session clôturée : ce n'est pas une erreur à signaler ici, le toast
        // dédié de SessionDashboard (basé sur details.status) informe déjà
        // l'utilisateur. Toute AUTRE cause d'échec reste, elle, tracée.
        const errorCode = (result.payload as { code?: string } | null)?.code;
        if (errorCode !== "SESSION_CLOSED") {
          console.error("Erreur lors de la jointure de la salle d'attente :", result.payload);
        }
      } catch (error) {
        console.error("Erreur lors de la jointure de la salle d'attente :", error);
      }
    };

    void ensureSelf();

    return () => {
      isActive = false;
    };
  }, [isSessionReady, isAuthenticated, sessionId, selfParticipantId, sessionStatus]);

  useEffect(() => {
    if (!isValidSessionId(sessionId)) return;
    if (!isSessionReady || isAuthenticated || !guestIdentity || selfParticipantId) return;

    if (sessionStatus === 'closed') {
      setSelfParticipantId(guestIdentity.participantId);
      setParticipantRole('participant');
      return;
    }

    let isActive = true;

    const resume = async (): Promise<void> => {
      try {
        const result = await resumeGuestParticipant(
          sessionId,
          guestIdentity.participantId,
          guestIdentity.guestToken
        );

        if (!isActive) return;

        if (result.ok) {
          setSelfParticipantId(result.data.id);
          setParticipantRole('participant');
        } else {
          clearGuestIdentity();
        }
      } catch (error) {
        console.error('Erreur lors de la reprise de participation :', error);
      }
    };

    void resume();

    return () => {
      isActive = false;
    };
  }, [isSessionReady, isAuthenticated, guestIdentity, selfParticipantId, sessionId, clearGuestIdentity, sessionStatus]);

  const handleGuestJoined = useCallback((result: GuestJoinResponse): void => {
    setGuestIdentity({
      participantId: result.id,
      guestToken: result.guestToken,
      displayName: result.displayName,
    });
    setSelfParticipantId(result.id);
    setParticipantRole(result.role);
  }, [setGuestIdentity]);

  // Changement de pseudo par le participant lui-même : le backend valide et
  // diffuse la nouvelle liste ; l'identité invitée locale est mise à jour
  // pour que la reprise (F5, retour) garde le nouveau pseudo.
  const renameSelf = useCallback(async (pseudo: string): Promise<boolean> => {
    if (!selfParticipantId) return false;

    try {
      const result = await renameParticipant(sessionId, selfParticipantId, pseudo, guestIdentity?.guestToken);

      if (!result.ok) return false;

      if (guestIdentity) {
        setGuestIdentity({ ...guestIdentity, displayName: result.data.displayName });
      }

      return true;
    } catch (error) {
      console.error('Erreur lors du changement de pseudo :', error);
      return false;
    }
  }, [sessionId, selfParticipantId, guestIdentity, setGuestIdentity]);

  const leaveParticipation = useCallback(async (): Promise<void> => {
    if (!selfParticipantId) return;

    try {
      await leaveParticipant(sessionId, selfParticipantId, guestIdentity?.guestToken);
    } catch (error) {
      console.error('Erreur lors du départ de la session :', error);
    }
  }, [sessionId, selfParticipantId, guestIdentity]);

  return {
    actorHeaders,
    clearGuestIdentity,
    guestIdentity,
    handleGuestJoined,
    leaveParticipation,
    renameSelf,
    role,
    selfIdentityForSocket,
    selfParticipantId,
  };
};
