import { useCallback, useState } from "react";
import type { GuestIdentity } from '../types/participant.types';

const storageKey = (sessionId: string): string => `retro:guest:${sessionId}`;

const readStoredIdentity = (sessionId: string): GuestIdentity | null => {
  try {
    const raw = localStorage.getItem(storageKey(sessionId));
    return raw ? (JSON.parse(raw) as GuestIdentity) : null;
  } catch {
    return null;
  }
};

// Identité d'un participant invité pour UNE session, isolée du compte du
// facilitateur (context Auth) : un simple jeton d'appartenance à la salle
// d'attente, pas un secret de connexion, stocké tant que la session dure.
export const useGuestParticipant = (sessionId: string) => {
  const [identity, setIdentityState] = useState<GuestIdentity | null>(() => readStoredIdentity(sessionId));

  const setIdentity = useCallback(
    (next: GuestIdentity) => {
      localStorage.setItem(storageKey(sessionId), JSON.stringify(next));
      setIdentityState(next);
    },
    [sessionId]
  );

  const clearIdentity = useCallback(() => {
    localStorage.removeItem(storageKey(sessionId));
    setIdentityState(null);
  }, [sessionId]);

  return { identity, setIdentity, clearIdentity };
};
