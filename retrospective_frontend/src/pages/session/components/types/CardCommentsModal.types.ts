import type { RetroCard } from '../../types/card.types';

export interface CardCommentsModalProps {
  card: RetroCard;
  isDesktop: boolean;
  onClose: () => void;
}
