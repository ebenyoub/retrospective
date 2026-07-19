import type { SessionListItem } from '../../types/session.types';

export interface SessionTableProps {
  sessions: SessionListItem[];
  editingSessionId: string | null;
  editingSessionName: string;
  onStartEdit: (session: SessionListItem) => void;
  onCancelEdit: () => void;
  onSessionNameChange: (name: string) => void;
  onSaveName: (sessionId: string) => void;
  onRequestDelete: (sessionId: string) => void;
  onNavigateToSession: (sessionId: number) => void;
}
