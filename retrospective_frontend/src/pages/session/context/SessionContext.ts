import { createContext } from 'react';

export interface SessionContextType {
  sessionId: string;
  actorHeaders: Record<string, string>;
  selfParticipantId: number | null;
  onCommentsChanged?: () => void;
}

export const SessionContext = createContext<SessionContextType | null>(null);
