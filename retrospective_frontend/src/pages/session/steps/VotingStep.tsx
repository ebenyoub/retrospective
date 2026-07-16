import type { SessionBoardColumn } from '../types/board.types';
import type { RetroCard } from '../types/card.types';
import SessionCardsGrid from './SessionCardsGrid';

interface VotingStepProps {
  cards: RetroCard[];
  columns: SessionBoardColumn[];
  activeMobileColumn: RetroCard['columnType'];
  isMobileViewport: boolean;
  currentUserId: number | null;
  onSelectMobileColumn: (columnType: RetroCard['columnType']) => void;
  onVote: (cardId: number) => Promise<void> | void;
  onOpenComments: (card: RetroCard) => void;
  onUpdateCard: (cardId: number, content: string) => Promise<boolean> | boolean;
  onDeleteCard: (cardId: number) => Promise<void> | void;
}

const VotingStep = ({
  cards,
  columns,
  activeMobileColumn,
  isMobileViewport,
  currentUserId,
  onSelectMobileColumn,
  onVote,
  onOpenComments,
  onUpdateCard,
  onDeleteCard,
}: VotingStepProps) => (
  <SessionCardsGrid
    cards={cards}
    columns={columns}
    activeMobileColumn={activeMobileColumn}
    isMobileViewport={isMobileViewport}
    currentUserId={currentUserId}
    canVote
    canEdit={false}
    onSelectMobileColumn={onSelectMobileColumn}
    onVote={onVote}
    onOpenComments={onOpenComments}
    onUpdateCard={onUpdateCard}
    onDeleteCard={onDeleteCard}
  />
);

export default VotingStep;
