import SessionCardsGrid from './SessionCardsGrid';
import { useSessionContext } from '../context/useSessionContext';
import type { VotingStepProps } from './types/VotingStep.types';

const VotingStep = ({ columns }: VotingStepProps) => {
  const { sessionCards, viewport, identity } = useSessionContext();

  return (
    <SessionCardsGrid
      cards={sessionCards.cards}
      columns={columns}
      activeMobileColumn={viewport.activeMobileColumn}
      isMobileViewport={viewport.isMobileViewport}
      currentUserId={identity.selfParticipantId}
      canVote
      canEdit={false}
      onSelectMobileColumn={viewport.setActiveMobileColumn}
      onVote={sessionCards.handleVote}
      onUpdateCard={sessionCards.handleUpdateCard}
      onDeleteCard={sessionCards.handleDeleteCard}
    />
  );
};

export default VotingStep;
