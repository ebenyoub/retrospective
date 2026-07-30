import SessionCardsGrid from './SessionCardsGrid';
import { useSessionCardsState, useSessionViewportState, useSessionIdentityState } from '../context/useSessionContext';
import type { WritingStepProps } from './types/WritingStep.types';

const WritingStep = ({ columns }: WritingStepProps) => {
  const sessionCards = useSessionCardsState();
  const viewport = useSessionViewportState();
  const { identity, isReadOnly } = useSessionIdentityState();

  return (
    <SessionCardsGrid
      cards={sessionCards.cards}
      columns={columns}
      activeMobileColumn={viewport.activeMobileColumn}
      isMobileViewport={viewport.isMobileViewport}
      currentUserId={identity.selfParticipantId}
      canVote={false}
      canEdit={!isReadOnly}
      onSelectMobileColumn={viewport.setActiveMobileColumn}
      onAddCard={isReadOnly ? undefined : sessionCards.handleAddCard}
      onVote={sessionCards.handleVote}
      onUpdateCard={sessionCards.handleUpdateCard}
      onDeleteCard={sessionCards.handleDeleteCard}
    />
  );
};

export default WritingStep;
