import type { RetroCard } from '../../types/card.types';

export interface ResultsStepProps {
  cards: RetroCard[];
  formatColumns: string[];
  isDesktop: boolean;
}
