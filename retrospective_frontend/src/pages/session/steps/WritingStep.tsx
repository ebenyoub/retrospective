import type { SessionBoardColumn } from '../types/board.types';
import type { RetroCard } from '../types/card.types';
import SessionCardsGrid from './SessionCardsGrid';

interface WritingStepProps {
  cards: RetroCard[];
  columns: SessionBoardColumn[];
  activeMobileColumn: RetroCard['columnType'];
  isMobileViewport: boolean;
  currentUserId: number | null;
  onSelectMobileColumn: (columnType: RetroCard['columnType']) => void;
  onAddCard: (columnType: RetroCard['columnType'], content: string) => Promise<void> | void;
  onVote: (cardId: number) => Promise<void> | void;
  onOpenComments: (card: RetroCard) => void;
  onUpdateCard: (cardId: number, content: string) => Promise<boolean> | boolean;
  onDeleteCard: (cardId: number) => Promise<void> | void;
}

const WritingStep = ({
  cards,
  columns,
  activeMobileColumn,
  isMobileViewport,
  currentUserId,
  onSelectMobileColumn,
  onAddCard,
  onVote,
  onOpenComments,
  onUpdateCard,
  onDeleteCard,
}: WritingStepProps) => (
  <SessionCardsGrid
    cards={cards}
    columns={columns}
    activeMobileColumn={activeMobileColumn}
    isMobileViewport={isMobileViewport}
    currentUserId={currentUserId}
    canVote={false}
    canEdit
    onSelectMobileColumn={onSelectMobileColumn}
    onAddCard={onAddCard}
    onVote={onVote}
    onOpenComments={onOpenComments}
    onUpdateCard={onUpdateCard}
    onDeleteCard={onDeleteCard}
  />
);

export default WritingStep;
