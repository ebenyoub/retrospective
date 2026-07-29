import type { ParticipantSummary } from '../../types/participant.types';

export interface WaitingScreenProps {
  sessionId: string | number;
  sessionName: string;
  sessionCode: string;
  participants: ParticipantSummary[];
  selfParticipantId: number | null;
  role: 'facilitator' | 'participant';
  formatName: string;
  stepDurationMinutes: number;
  onStart: () => void;
  onLeave: () => void;
  onSelectFormatPreset: (name: string, columns: string[]) => void;
  onUpdateStepDuration: (minutes: number) => void;
  isDesktop: boolean;
}
