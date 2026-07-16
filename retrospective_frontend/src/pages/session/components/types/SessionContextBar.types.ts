import type { SessionStep } from '../../types/session.types';

export interface SessionContextBarProps {
  sessionName: string;
  sessionId: string;
  sessionCode: string;
  step: SessionStep;
  participantCount: number;
  isSessionCodeCopied: boolean;
  // Badge du participant (pseudo + menu) : absent pour le facilitateur,
  // qui a déjà son menu de compte.
  selfDisplayName?: string | null;
  canRenameSelf?: boolean;
  onRenameSelf?: (pseudo: string) => Promise<boolean>;
  onLeaveSession?: () => void | Promise<void>;
  onBack: () => void | Promise<void>;
  onCopySessionCode: () => void;
  onToggleParticipants?: () => void;
  onToggleDiscussion?: () => void;
  isParticipantsOpen?: boolean;
  isDiscussionOpen?: boolean;
}
