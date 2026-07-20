import type { ActionItem } from '../../types/action.types';
import type { RetroCard } from '../../types/card.types';
import type { ParticipantSummary } from '../../types/participant.types';

export interface SummaryStepProps {
  sessionName: string;
  cards: RetroCard[];
  actions: ActionItem[];
  participants: ParticipantSummary[];
  formatColumns: string[];
  isDesktop: boolean;
}
