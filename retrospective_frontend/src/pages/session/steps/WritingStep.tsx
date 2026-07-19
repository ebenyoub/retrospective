import SessionCardsGrid from './SessionCardsGrid';
import type { WritingStepProps } from './types/WritingStep.types';

const WritingStep = ({
  cards,
  columns,
  activeMobileColumn,
  isMobileViewport,
  currentUserId,
  onSelectMobileColumn,
  onAddCard,
  onVote,
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
    onUpdateCard={onUpdateCard}
    onDeleteCard={onDeleteCard}
  />
);

export default WritingStep;
