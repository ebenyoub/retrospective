import type { ParticipantSummary } from '../../types/participant.types';
import type { SessionRole } from '../../types/session.types';

export interface WaitingStepProps {
  sessionId: string;
  sessionName: string;
  sessionCode: string;
  participants: ParticipantSummary[];
  selfParticipantId: number | null;
  role: SessionRole | null;
  formatName: string;
  stepDurationMinutes: number;
  isDesktop: boolean;
  onStart: () => void;
  onLeave: () => void | Promise<void>;
  onSelectFormatPreset: (nextName: string, nextColumns: string[]) => void | Promise<void>;
  onUpdateStepDuration: (minutes: number) => void;
}
