import type { ParticipantSummary } from '../../types/participant.types';

export interface ParticipantsDrawerProps {
  participants: ParticipantSummary[];
  isOpen: boolean;
  isDesktop: boolean;
  onClose: () => void;
}
