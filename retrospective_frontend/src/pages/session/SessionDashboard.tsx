import { useAuth } from '@/context/auth/useAuth';
import { useToast } from '@/context/toast/useToast';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getRetroFormatById, DEFAULT_RETRO_FORMAT_ID } from '@/lib/retroFormats';
import CardCommentsModal from './components/CardCommentsModal';
import DiscussionDrawer from './components/DiscussionDrawer';
import ParticipantsDrawer from './components/ParticipantsDrawer';
import SessionActionBar from './components/SessionActionBar';
import SessionContextBar from './components/SessionContextBar';
import JoinSessionModal from './components/JoinSessionModal';
import { useSessionActions } from './hooks/useSessionActions';
import { useSessionCards } from './hooks/useSessionCards';
import { useSessionDetails } from './hooks/useSessionDetails';
import { useSessionIdentity } from './hooks/useSessionIdentity';
import { useSessionPanels } from './hooks/useSessionPanels';
import { useSessionParticipants } from './hooks/useSessionParticipants';
import { useSessionPolling } from './hooks/useSessionPolling';
import { useSessionViewport } from './hooks/useSessionViewport';
import type { SessionBoardColumn } from './types/board.types';
import type { SessionStep } from './types/session.types';
import ResultsStep from './steps/ResultsStep';
import VotingStep from './steps/VotingStep';
import WaitingStep from './steps/WaitingStep';
import WritingStep from './steps/WritingStep';

const COLUMNS: Omit<SessionBoardColumn, 'title'>[] = [
  {
    key: 'start',
    emoji: '💡',
    color: '#d97706',
    dotClassName: 'bg-yellow-500',
    accentClassName: 'border-l-yellow-500',
    tabActiveClassName: 'border-yellow-500',
    emptyTitle: 'Aucune carte',
    emptyDescription: 'Ajoutez une première idée dans cette colonne…',
  }, {
    key: 'stop',
    emoji: '🚧',
    color: '#dc2626',
    dotClassName: 'bg-red-500',
    accentClassName: 'border-l-red-500',
    tabActiveClassName: 'border-red-500',
    emptyTitle: 'Aucune carte',
    emptyDescription: 'Ajoutez une première idée dans cette colonne…',
  },
  {
    key: 'continue',
    emoji: '✅',
    color: '#16a34a',
    dotClassName: 'bg-green-500',
    accentClassName: 'border-l-green-500',
    tabActiveClassName: 'border-green-500',
    emptyTitle: 'Aucune carte',
    emptyDescription: 'Ajoutez une première idée dans cette colonne…',
  },
];

const defaultFormatColumns = getRetroFormatById(DEFAULT_RETRO_FORMAT_ID).columns;
const SessionDashboard = () => {
  const { id } = useParams();
  const sessionId = id || '';
  const { isAuthenticated, token, userId } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isSessionCodeCopied, setIsSessionCodeCopied] = useState(false);
  const {
    activeMobileColumn,
    isMobileViewport,
    setActiveMobileColumn,
  } = useSessionViewport();
  const {
    closeComments,
    closeDiscussionDrawer,
    closeParticipantsDrawer,
    commentsCard,
    isDiscussionDrawerOpen,
    isParticipantsDrawerOpen,
    openComments,
    toggleDiscussionDrawer,
    toggleParticipantsDrawer,
  } = useSessionPanels();

  const {
    fetchSessionDetails,
    formatColumns,
    formatName,
    hasLoadedSession,
    ownerId,
    sessionCode,
    sessionName,
    setFormatColumns,
    setFormatName,
    setStep,
    step,
  } = useSessionDetails({ sessionId, token });
  const {
    actorHeaders,
    clearGuestIdentity,
    guestIdentity,
    handleGuestJoined,
    leaveParticipation,
    role,
    selfIdentityForSocket,
    selfParticipantId,
  } = useSessionIdentity({
    sessionId,
    isSessionReady: hasLoadedSession,
    isAuthenticated,
    token,
    userId,
    ownerId,
  });
  const {
    cards,
    fetchCards,
    handleAddCard,
    handleDeleteCard,
    handleUpdateCard,
    handleVote,
    votesLeft,
  } = useSessionCards({ sessionId, actorHeaders, addToast });
  const isLoading = useSessionPolling({
    sessionId,
    isAuthenticated,
    navigate,
    addToast,
    fetchSessionDetails,
    fetchCards,
  });
  const {
    handleLeaveSession,
    handleTransitionStep,
    handleUpdateFormat,
  } = useSessionActions({
    sessionId,
    token,
    isAuthenticated,
    navigate,
    addToast,
    leaveParticipation,
    clearGuestIdentity,
    setStep,
    setFormatName,
    setFormatColumns,
  });
  const writingColumns = useMemo(() => {
    const labels = formatColumns.length === 3
      ? formatColumns
      : defaultFormatColumns;

    return COLUMNS.map((column, index) => ({
      ...column,
      title: labels[index],
      emptyTitle: `Aucune carte ${labels[index].toLowerCase()}`,
    }));
  }, [formatColumns]);

  const handleSessionStarted = useCallback((nextStep: string) => {
    setStep(nextStep as SessionStep);
  }, [setStep]);

  const { participants } = useSessionParticipants(sessionId, selfIdentityForSocket, {
    onSessionStarted: handleSessionStarted,
  });

  const handleCopySessionCode = async () => {
    if (!sessionCode) return;

    try {
      await navigator.clipboard.writeText(sessionCode);
      setIsSessionCodeCopied(true);
      setTimeout(() => setIsSessionCodeCopied(false), 1800);
    } catch (error) {
      console.error('Échec de la copie du code', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-slate-400">Chargement de la session...</p>
      </div>
    );
  }

  // Visiteur sans compte et sans identité invitée pour cette session (ex :
  // ouverture directe du lien d'invitation) : on lui demande un pseudo sur
  // place, jamais de redirection vers l'accueil ou vers la connexion.
  if (!isAuthenticated && !guestIdentity) {
    return <JoinSessionModal sessionId={sessionId} sessionName={sessionName} onJoined={handleGuestJoined} />;
  }

  if (step === 'waiting') {
    return (
      <WaitingStep
        sessionId={sessionId}
        sessionName={sessionName}
        sessionCode={sessionCode}
        participants={participants}
        selfParticipantId={selfParticipantId}
        role={role}
        formatName={formatName}
        onStart={() => handleTransitionStep('writing')}
        onLeave={handleLeaveSession}
        onSelectFormatPreset={handleUpdateFormat}
        isDesktop={!isMobileViewport}
      />
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <SessionContextBar
        sessionName={sessionName}
        sessionId={sessionId}
        sessionCode={sessionCode}
        step={step}
        participantCount={participants.filter((participant) => participant.status === 'online').length}
        isSessionCodeCopied={isSessionCodeCopied}
        isParticipantsOpen={isParticipantsDrawerOpen}
        isDiscussionOpen={isDiscussionDrawerOpen}
        onBack={handleLeaveSession}
        onCopySessionCode={handleCopySessionCode}
        onToggleParticipants={toggleParticipantsDrawer}
        onToggleDiscussion={toggleDiscussionDrawer}
      />
      <SessionActionBar
        step={step}
        cardsCount={cards.length}
        votesLeft={votesLeft}
        isFacilitator={role === 'facilitator'}
        onTransitionStep={handleTransitionStep}
      />
      <ParticipantsDrawer
        participants={participants}
        isOpen={isParticipantsDrawerOpen}
        isDesktop={!isMobileViewport}
        onClose={closeParticipantsDrawer}
      />
      <DiscussionDrawer
        isOpen={isDiscussionDrawerOpen}
        isDesktop={!isMobileViewport}
        onClose={closeDiscussionDrawer}
      />
      {commentsCard && (
        <CardCommentsModal
          card={commentsCard}
          isDesktop={!isMobileViewport}
          onClose={closeComments}
        />
      )}

      {step === 'results' ? (
        <ResultsStep cards={cards} formatColumns={formatColumns} isDesktop={!isMobileViewport} />
      ) : step === 'voting' ? (
        <VotingStep
          cards={cards}
          columns={writingColumns}
          activeMobileColumn={activeMobileColumn}
          isMobileViewport={isMobileViewport}
          currentUserId={selfParticipantId}
          onSelectMobileColumn={setActiveMobileColumn}
          onVote={handleVote}
          onOpenComments={openComments}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
        />
      ) : (
        <WritingStep
          cards={cards}
          columns={writingColumns}
          activeMobileColumn={activeMobileColumn}
          isMobileViewport={isMobileViewport}
          currentUserId={selfParticipantId}
          onSelectMobileColumn={setActiveMobileColumn}
          onAddCard={handleAddCard}
          onVote={handleVote}
          onOpenComments={openComments}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
        />
      )}
    </div>
  );
};

export default SessionDashboard;
