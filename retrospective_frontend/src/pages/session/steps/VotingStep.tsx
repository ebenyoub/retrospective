import SessionCardsGrid from './SessionCardsGrid';
import type { VotingStepProps } from './types/VotingStep.types';

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
