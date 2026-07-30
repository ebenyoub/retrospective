import SessionCardsGrid from './SessionCardsGrid';
import { useSessionCardsState, useSessionViewportState, useSessionIdentityState } from '../context/useSessionContext';
import type { VotingStepProps } from './types/VotingStep.types';

const VotingStep = ({ columns }: VotingStepProps) => {
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
      canVote={!isReadOnly && !sessionCards.isVotePending}
      canEdit={false}
      onSelectMobileColumn={viewport.setActiveMobileColumn}
      onVote={sessionCards.handleVote}
      onUpdateCard={sessionCards.handleUpdateCard}
      onDeleteCard={sessionCards.handleDeleteCard}
    />
  );
};

export default VotingStep;
