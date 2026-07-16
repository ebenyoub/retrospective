import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  joinAsSelf,
  leaveParticipant,
  resumeGuestParticipant,
} from '../services/participantApi';
import type { GuestJoinResponse, SelfIdentity } from '../types/participant.types';
import type { SessionRole } from '../types/session.types';
import { useGuestParticipant } from './useGuestParticipant';

interface UseSessionIdentityOptions {
  sessionId: string;
  isSessionReady: boolean;
  isAuthenticated: boolean;
  token: string;
  userId: number | null;
  ownerId: number | null;
}

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
  token,
  userId,
  ownerId,
}: UseSessionIdentityOptions) => {
  const {
    identity: guestIdentity,
    setIdentity: setGuestIdentity,
    clearIdentity: clearGuestIdentity,
  } = useGuestParticipant(sessionId);
  const [selfParticipantId, setSelfParticipantId] = useState<number | null>(null);
  const [participantRole, setParticipantRole] = useState<SessionRole | null>(null);

  const actorHeaders = useMemo((): Record<string, string> | null => {
    if (isAuthenticated && token) {
      return {
        Authorization: `Bearer ${token}`,
        ...(selfParticipantId ? { 'x-participant-id': String(selfParticipantId) } : {}),
      };
    }

    if (guestIdentity && selfParticipantId) {
      return createGuestHeaders(selfParticipantId, guestIdentity.guestToken);
    }

    return null;
  }, [isAuthenticated, token, selfParticipantId, guestIdentity]);

  const selfIdentityForSocket = useMemo((): SelfIdentity | null => {
    if (!selfParticipantId) return null;
    if (isAuthenticated && token) return { participantId: selfParticipantId, token };
    if (guestIdentity) return { participantId: selfParticipantId, guestToken: guestIdentity.guestToken };
    return null;
  }, [selfParticipantId, isAuthenticated, token, guestIdentity]);

  const role = useMemo((): SessionRole | null => {
    if (isAuthenticated && userId && ownerId !== null) {
      return ownerId === userId ? 'facilitator' : 'participant';
    }

    return participantRole;
  }, [isAuthenticated, userId, ownerId, participantRole]);

  useEffect(() => {
    if (!isValidSessionId(sessionId)) return;
    if (!isSessionReady || !isAuthenticated || !token || selfParticipantId) return;

    let isActive = true;

    const ensureSelf = async (): Promise<void> => {
      try {
        const result = await joinAsSelf(sessionId, token);

        if (isActive && result.ok) {
          setSelfParticipantId(result.data.id);
          setParticipantRole(result.data.role);
        }
      } catch (error) {
        console.error("Erreur lors de la jointure de la salle d'attente :", error);
      }
    };

    void ensureSelf();

    return () => {
      isActive = false;
    };
  }, [isSessionReady, isAuthenticated, token, sessionId, selfParticipantId]);

  useEffect(() => {
    if (!isValidSessionId(sessionId)) return;
    if (!isSessionReady || isAuthenticated || !guestIdentity || selfParticipantId) return;

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
  }, [isSessionReady, isAuthenticated, guestIdentity, selfParticipantId, sessionId, clearGuestIdentity]);

  const handleGuestJoined = useCallback((result: GuestJoinResponse): void => {
    setGuestIdentity({
      participantId: result.id,
      guestToken: result.guestToken,
      displayName: result.displayName,
    });
    setSelfParticipantId(result.id);
    setParticipantRole(result.role);
  }, [setGuestIdentity]);

  const leaveParticipation = useCallback(async (): Promise<void> => {
    if (!selfParticipantId) return;

    try {
      await leaveParticipant(sessionId, selfParticipantId, token, guestIdentity?.guestToken);
    } catch (error) {
      console.error('Erreur lors du départ de la session :', error);
    }
  }, [sessionId, selfParticipantId, token, guestIdentity]);

  return {
    actorHeaders,
    clearGuestIdentity,
    guestIdentity,
    handleGuestJoined,
    leaveParticipation,
    role,
    selfIdentityForSocket,
    selfParticipantId,
  };
};
