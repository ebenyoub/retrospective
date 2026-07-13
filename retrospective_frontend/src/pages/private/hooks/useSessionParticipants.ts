import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { isApiSuccess, readJsonSafely } from "@/lib/apiError";

const API_BASE = "http://localhost:8000";

export interface ParticipantSummary {
  id: number;
  sessionId: number;
  displayName: string;
  role: "facilitator" | "participant";
  status: "online" | "offline";
  joinedAt: string;
  lastSeenAt: string;
}

export interface SelfIdentity {
  participantId: number;
  guestToken?: string;
  token?: string;
}

interface UseSessionParticipantsOptions {
  onSessionStarted?: (step: string) => void;
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
  useEffect(() => {
    onSessionStartedRef.current = options.onSessionStarted;
  });

  useEffect(() => {
    if (!self) return;

    let isActive = true;

    const loadInitial = async () => {
      try {
        const response = await fetch(`${API_BASE}/session/${sessionId}/participants`);
        const data = await readJsonSafely(response);
        if (isActive && response.ok && isApiSuccess<ParticipantSummary[]>(data)) {
          setParticipants(data.data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des participants :", error);
      }
    };

    void loadInitial();

    const socket: Socket = io(API_BASE, { transports: ["websocket", "polling"] });

    const handleParticipantsUpdated = (next: ParticipantSummary[]) => {
      if (isActive) setParticipants(next);
    };

    const handleSessionStarted = ({ step }: { step: string }) => {
      if (isActive) onSessionStartedRef.current?.(step);
    };

    const handleConnect = () => {
      socket.emit("session:join", {
        sessionId: Number(sessionId),
        participantId: self.participantId,
        guestToken: self.guestToken,
        token: self.token,
      });
    };

    socket.on("connect", handleConnect);
    socket.on("session:participants-updated", handleParticipantsUpdated);
    socket.on("session:started", handleSessionStarted);

    return () => {
      isActive = false;
      socket.off("connect", handleConnect);
      socket.off("session:participants-updated", handleParticipantsUpdated);
      socket.off("session:started", handleSessionStarted);
      socket.disconnect();
    };
  }, [sessionId, self]);

  return { participants };
};
