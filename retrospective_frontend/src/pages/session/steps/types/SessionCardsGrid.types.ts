import type { SessionBoardColumn } from '../../types/board.types';
import type { RetroCard } from '../../types/card.types';

export interface SessionCardsGridProps {
  cards: RetroCard[];
  columns: SessionBoardColumn[];
  activeMobileColumn: RetroCard['columnType'];
  isMobileViewport: boolean;
  currentUserId: number | null;
  canVote: boolean;
  canEdit: boolean;
  onSelectMobileColumn: (columnType: RetroCard['columnType']) => void;
  onAddCard?: (columnType: RetroCard['columnType'], content: string) => Promise<void> | void;
  onVote: (cardId: number) => Promise<void> | void;
  onOpenComments: (card: RetroCard) => void;
  onUpdateCard: (cardId: number, content: string) => Promise<boolean> | boolean;
  onDeleteCard: (cardId: number) => Promise<void> | void;
}
