import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import type { useSessionDetails } from '../hooks/useSessionDetails';
import type { useSessionIdentity } from '../hooks/useSessionIdentity';
import type { useSessionPanels } from '../hooks/useSessionPanels';
import type { useSessionCards } from '../hooks/useSessionCards';
import type { RetroCard } from '../types/card.types';
import type { ParticipantSummary } from '../types/participant.types';
import type { SessionMessage } from '../types/message.types';
import type { ActionItem } from '../types/action.types';
import type { CardComment } from '../types/comment.types';
import type { SessionStep } from '../types/session.types';

export interface SessionViewportState {
  activeMobileColumn: RetroCard['columnType'];
  isMobileViewport: boolean;
  isDesktop: boolean;
  isDesktopViewport: boolean;
  setActiveMobileColumn: (column: RetroCard['columnType']) => void;
}

export interface SessionIdentityState {
  identity: ReturnType<typeof useSessionIdentity> & { isFacilitator: boolean };
  actorHeaders: Record<string, string>;
  selfParticipantId: number | null;
  isReadOnly: boolean;
  isSoundEnabled: boolean;
  toggleSound: () => void;
}

export interface SessionDetailsState {
  details: ReturnType<typeof useSessionDetails> & { step: SessionStep };
  sessionId: string;
}
export type SessionPanelsState = ReturnType<typeof useSessionPanels>;
export type SessionCardsState = ReturnType<typeof useSessionCards>;

export interface SessionParticipantsState {
  participants: ParticipantSummary[];
}

export interface SessionChatState {
  messages: SessionMessage[];
  setMessages: Dispatch<SetStateAction<SessionMessage[]>>;
  isDiscussionBlinking: boolean;
  clearDiscussionBlinking: () => void;
  lastCommentAdded: { cardId: number; comment: CardComment } | null;
}

export interface SessionActionsState {
  actions: ActionItem[];
  setActions: Dispatch<SetStateAction<ActionItem[]>>;
  votesLeft: number;
  stepEndsAt: string | null;
  handleTransitionStep: (nextStep: SessionStep) => Promise<void>;
  handleUpdateFormat: (nextName: string, nextColumns: string[]) => Promise<void>;
  handleUpdateTimer: (minutes: number) => Promise<boolean>;
  handleCloseSession: () => Promise<void>;
  handleLeaveSession: () => Promise<void>;
  onCommentsChanged?: () => void;
}

export const SessionViewportContext = createContext<SessionViewportState | null>(null);
export const SessionDetailsContext = createContext<SessionDetailsState | null>(null);
export const SessionIdentityContext = createContext<SessionIdentityState | null>(null);
export const SessionPanelsContext = createContext<SessionPanelsState | null>(null);
export const SessionCardsContext = createContext<SessionCardsState | null>(null);
export const SessionParticipantsContext = createContext<SessionParticipantsState | null>(null);
export const SessionChatContext = createContext<SessionChatState | null>(null);
export const SessionActionsContext = createContext<SessionActionsState | null>(null);
