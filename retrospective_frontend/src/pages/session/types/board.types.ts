import type { RetroCard } from './card.types';

export interface SessionBoardColumn {
  key: RetroCard['columnType'];
  emoji: string;
  color: string;
  dotClassName: string;
  accentClassName: string;
  tabActiveClassName: string;
  title: string;
  emptyTitle: string;
  emptyDescription: string;
}
