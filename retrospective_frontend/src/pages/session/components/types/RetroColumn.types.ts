import type { RetroCard } from '../../types/card.types';

export interface RetroColumnProps {
  className?: string;
  title: string;
  emoji: string;
  dotClassName: string;
  accentClassName: string;
  /** Couleur hexadécimale de la colonne (ex: '#16a34a') pour le formulaire d'ajout. */
  color: string;
  cards: RetroCard[];
  emptyTitle: string;
  emptyDescription: string;
  currentUserId: number | null;
  onAddCard?: (content: string) => Promise<void> | void;
  onVote: (cardId: number) => Promise<void> | void;
  onOpenComments?: (card: RetroCard) => void;
  onUpdateCard?: (cardId: number, content: string) => Promise<boolean> | boolean;
  onDeleteCard?: (cardId: number) => Promise<void> | void;
  canVote?: boolean;
  canEdit?: boolean;
}
