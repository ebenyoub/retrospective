import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { API_BASE } from "@/lib/api";
import { playCommentNotificationSound, playMessageNotificationSound } from "@/lib/notificationSound";
import { listParticipants } from "../services/participantApi";
import { getMessages } from "../services/messageApi";
import { getActions } from "../services/actionApi";
import type { ParticipantSummary, SelfIdentity } from '../types/participant.types';
import type { SessionMessage } from "../types/message.types";
import type { ActionItem } from "../types/action.types";
import type { CardComment } from "../types/comment.types";
import type { UseSessionParticipantsOptions } from './types/useSessionParticipants.types';

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
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  // Les commentaires restent gérés localement par carte (CardCommentsSection) :
  // on ne fait que relayer le dernier événement reçu, pas de liste agrégée ici.
  const [lastCommentAdded, setLastCommentAdded] = useState<{ cardId: number; comment: CardComment } | null>(null);
  // Clignotement du bouton Discussion à la réception d'un message d'un autre
  // participant, indépendamment du son (mute ou pas). Persiste tant que la
  // Discussion n'a pas été ouverte (pas de délai fixe : un badge "non lu"
  // qu'on manque en 2-3 secondes ne sert à rien).
  const [isDiscussionBlinking, setIsDiscussionBlinking] = useState(false);
  const actorHeaders = options.actorHeaders ?? {};

  const clearDiscussionBlinking = useCallback((): void => {
    setIsDiscussionBlinking(false);
  }, []);

  // Ref plutôt que dépendance d'effet : évite de rouvrir un socket à chaque
  // fois que le composant appelant recrée sa fonction de callback. La mise à
  // jour se fait dans un effet (jamais pendant le rendu).
  const onSessionStartedRef = useRef(options.onSessionStarted);
  const onTimerUpdatedRef = useRef(options.onTimerUpdated);
  const onSessionClosedRef = useRef(options.onSessionClosed);
  const isSoundEnabledRef = useRef(options.isSoundEnabled ?? true);

  useEffect(() => {
    onSessionStartedRef.current = options.onSessionStarted;
    onTimerUpdatedRef.current = options.onTimerUpdated;
    onSessionClosedRef.current = options.onSessionClosed;
    isSoundEnabledRef.current = options.isSoundEnabled ?? true;
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

    const loadMessages = async () => {
      try {
        const result = await getMessages(sessionId, actorHeaders);
        if (isActive && result.ok) {
          setMessages(result.data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des messages :", error);
      }
    };

    const loadActions = async () => {
      try {
        const result = await getActions(sessionId, actorHeaders);
        if (isActive && result.ok) {
          setActions(result.data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des actions :", error);
      }
    };

    void loadInitial();
    void loadMessages();
    void loadActions();

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

    const handleMessageAdded = (message: SessionMessage) => {
      if (!isActive) return;

      setMessages((previous) => {
        if (previous.some((m) => m.id === message.id)) return previous;
        return [...previous, message];
      });

      // Ni son ni clignotement pour son propre message (déjà visible à l'envoi).
      if (message.authorId !== self.participantId) {
        setIsDiscussionBlinking(true);
        if (isSoundEnabledRef.current) playMessageNotificationSound();
      }
    };

    const handleActionAdded = (action: ActionItem) => {
      if (isActive) {
        setActions((previous) => {
          if (previous.some((a) => a.id === action.id)) return previous;
          return [...previous, action];
        });
      }
    };

    const handleCommentAdded = (payload: { cardId: number; comment: CardComment }) => {
      if (!isActive) return;

      setLastCommentAdded(payload);

      // Le clignotement du bouton "Commentaires" de la carte concernée est
      // géré par RetroCardItem lui-même (déjà abonné à lastCommentAdded) :
      // ici, on ne joue que le son, différent de celui de Discussion.
      if (payload.comment.authorId !== self.participantId && isSoundEnabledRef.current) {
        playCommentNotificationSound();
      }
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);
    socket.on("session:participants-updated", handleParticipantsUpdated);
    socket.on("session:started", handleSessionStarted);
    socket.on("session:timer-updated", handleTimerUpdated);
    socket.on("session:closed", handleSessionClosed);
    socket.on("session:message-added", handleMessageAdded);
    socket.on("session:action-added", handleActionAdded);
    socket.on("session:comment-added", handleCommentAdded);

    return () => {
      isActive = false;
      socket.off("connect", handleConnect);
      socket.off("session:participants-updated", handleParticipantsUpdated);
      socket.off("session:started", handleSessionStarted);
      socket.off("session:timer-updated", handleTimerUpdated);
      socket.off("session:closed", handleSessionClosed);
      socket.off("session:message-added", handleMessageAdded);
      socket.off("session:action-added", handleActionAdded);
      socket.off("session:comment-added", handleCommentAdded);
      socket.disconnect();
    };
  }, [sessionId, self, options.actorHeaders]);

  return { participants, messages, setMessages, actions, setActions, lastCommentAdded, isDiscussionBlinking, clearDiscussionBlinking };
};
