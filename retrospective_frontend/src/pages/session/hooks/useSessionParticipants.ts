import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { API_BASE } from "@/lib/api";
import { listParticipants } from "../services/participantApi";
import type { ParticipantSummary, SelfIdentity } from '../types/participant.types';

interface UseSessionParticipantsOptions {
  onSessionStarted?: (step: string, stepEndsAt: string | null) => void;
  onTimerUpdated?: (stepEndsAt: string) => void;
  onSessionClosed?: () => void;
}

// Source de vérité = backend : liste initiale par API, puis mises à jour en
// direct par socket. Un socket dédié est ouvert par montage (fermé au
// démontage) : changer de session ou fermer l'onglet nettoie proprement la
// présence côté serveur (voir realtime/socket.ts, événement "disconnect").
export const useSessionParticipants = (
  sessionId: string,
  self: SelfIdentity | null,
  options: UseSessionParticipantsOptions = {}
) => {
  const [participants, setParticipants] = useState<ParticipantSummary[]>([]);

  // Ref plutôt que dépendance d'effet : évite de rouvrir un socket à chaque
  // fois que le composant appelant recrée sa fonction de callback. La mise à
  // jour se fait dans un effet (jamais pendant le rendu).
  const onSessionStartedRef = useRef(options.onSessionStarted);
  const onTimerUpdatedRef = useRef(options.onTimerUpdated);
  const onSessionClosedRef = useRef(options.onSessionClosed);
  useEffect(() => {
    onSessionStartedRef.current = options.onSessionStarted;
    onTimerUpdatedRef.current = options.onTimerUpdated;
    onSessionClosedRef.current = options.onSessionClosed;
  });

  useEffect(() => {
    const idVal = Number(sessionId);
    if (!self || !sessionId || sessionId === "undefined" || isNaN(idVal) || idVal <= 0) return;

    let isActive = true;

    const loadInitial = async () => {
      try {
        const result = await listParticipants(sessionId);
        if (isActive && result.ok) {
          setParticipants(result.data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des participants :", error);
      }
    };

    void loadInitial();

    // withCredentials : le cookie d'authentification HttpOnly accompagne le
    // handshake, le serveur y lit le JWT de l'utilisateur connecté.
    const socket: Socket = io(API_BASE, { transports: ["websocket", "polling"], withCredentials: true });

    const handleParticipantsUpdated = (next: ParticipantSummary[]) => {
      if (isActive) setParticipants(next);
    };

    const handleSessionStarted = ({ step, stepEndsAt }: { step: string; stepEndsAt?: string | null }) => {
      if (isActive) onSessionStartedRef.current?.(step, stepEndsAt ?? null);
    };

    // Le facilitateur a redéfini le timer : nouvelle échéance pour tous.
    const handleTimerUpdated = ({ stepEndsAt }: { stepEndsAt: string }) => {
      if (isActive) onTimerUpdatedRef.current?.(stepEndsAt);
    };

    const handleConnect = () => {
      socket.emit("session:join", {
        sessionId: Number(sessionId),
        participantId: self.participantId,
        guestToken: self.guestToken,
      });
    };

    const handleSessionClosed = () => {
      if (isActive) onSessionClosedRef.current?.();
    };

    socket.on("connect", handleConnect);
    socket.on("session:participants-updated", handleParticipantsUpdated);
    socket.on("session:started", handleSessionStarted);
    socket.on("session:timer-updated", handleTimerUpdated);
    socket.on("session:closed", handleSessionClosed);

    return () => {
      isActive = false;
      socket.off("connect", handleConnect);
      socket.off("session:participants-updated", handleParticipantsUpdated);
      socket.off("session:started", handleSessionStarted);
      socket.off("session:timer-updated", handleTimerUpdated);
      socket.off("session:closed", handleSessionClosed);
      socket.disconnect();
    };
  }, [sessionId, self]);

  return { participants };
};
