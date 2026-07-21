import SessionCardsGrid from './SessionCardsGrid';
import { useSessionContext } from '../context/useSessionContext';
import type { WritingStepProps } from './types/WritingStep.types';

const WritingStep = ({ columns }: WritingStepProps) => {
  const { sessionCards, viewport, identity } = useSessionContext();

  return (
    <SessionCardsGrid
      cards={sessionCards.cards}
      columns={columns}
      activeMobileColumn={viewport.activeMobileColumn}
      isMobileViewport={viewport.isMobileViewport}
      currentUserId={identity.selfParticipantId}
      canVote={false}
      canEdit
      onSelectMobileColumn={viewport.setActiveMobileColumn}
      onAddCard={sessionCards.handleAddCard}
      onVote={sessionCards.handleVote}
      onUpdateCard={sessionCards.handleUpdateCard}
      onDeleteCard={sessionCards.handleDeleteCard}
    />
  );
};

export default WritingStep;
