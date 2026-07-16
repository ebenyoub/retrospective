import type { RetroCard } from '../../types/card.types';

export interface RetroCardItemProps {
  card: RetroCard;
  accentClassName: string;
  currentUserId: number | null;
  onVote: (cardId: number) => Promise<void> | void;
  onUpdateCard?: (cardId: number, content: string) => Promise<boolean> | boolean;
  onDeleteCard?: (cardId: number) => Promise<void> | void;
  onOpenComments?: (card: RetroCard) => void;
  canVote?: boolean;
  canEdit?: boolean;
}
