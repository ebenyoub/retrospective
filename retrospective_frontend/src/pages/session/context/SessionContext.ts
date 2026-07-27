import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { useSessionDetails } from '../hooks/useSessionDetails';
import { useSessionIdentity } from '../hooks/useSessionIdentity';
import { useSessionPanels } from '../hooks/useSessionPanels';
import { useSessionCards } from '../hooks/useSessionCards';
import type { RetroCard } from '../types/card.types';
import type { ParticipantSummary } from '../types/participant.types';
import type { SessionMessage } from '../types/message.types';
import type { ActionItem } from '../types/action.types';
import type { CardComment } from '../types/comment.types';
import type { SessionStep } from '../types/session.types';

// Fil d'eau (viewport) : dérivé une seule fois par SessionDashboard, plutôt
// que recalculé (`!isMobileViewport`) dans chaque composant consommateur.
export interface SessionViewportContext {
  activeMobileColumn: RetroCard['columnType'];
  isMobileViewport: boolean;
  isDesktop: boolean;
  setActiveMobileColumn: (column: RetroCard['columnType']) => void;
}

// Identité de session : reprend useSessionIdentity et y ajoute isFacilitator,
// dérivé une seule fois (role + statut de la session), plutôt que recalculé
// dans chaque composant consommateur.
export interface SessionIdentityContext extends ReturnType<typeof useSessionIdentity> {
  isFacilitator: boolean;
}

export interface SessionContextType {
  sessionId: string;
  actorHeaders: Record<string, string>;
  selfParticipantId: number | null;
  isReadOnly: boolean;
  onCommentsChanged?: () => void;

  viewport: SessionViewportContext;
  panels: ReturnType<typeof useSessionPanels>;
  details: ReturnType<typeof useSessionDetails>;
  identity: SessionIdentityContext;
  sessionCards: ReturnType<typeof useSessionCards>;

  participants: ParticipantSummary[];
  messages: SessionMessage[];
  setMessages: Dispatch<SetStateAction<SessionMessage[]>>;
  actions: ActionItem[];
  setActions: Dispatch<SetStateAction<ActionItem[]>>;
  lastCommentAdded: { cardId: number; comment: CardComment } | null;

  // Champs directs pratiques pour la barre d'actions (SessionActionBar) :
  // évite de faire traverser sessionCards/details/useSessionActions à chaque
  // composant qui n'a besoin que de ces valeurs précises.
  votesLeft: number;
  stepEndsAt: string | null;
  handleTransitionStep: (nextStep: SessionStep) => Promise<void>;
  handleUpdateFormat: (nextName: string, nextColumns: string[]) => Promise<void>;
  handleUpdateTimer: (minutes: number) => Promise<boolean>;
  handleCloseSession: () => Promise<void>;
  handleLeaveSession: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextType | null>(null);
