import type { RetroCard } from '../../types/card.types';

// Catégories affichées dans les résultats. Les clés restent techniques
// (`start` / `stop` / `continue`) mais les libellés viennent du format choisi.
export interface ResultCategory {
  key: RetroCard['columnType'];
  label: string;
  emoji: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export interface SessionResultsProps {
  cards: RetroCard[];
  formatColumns: string[];
  isDesktop: boolean;
}
