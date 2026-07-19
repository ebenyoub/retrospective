import { useAuth } from '@/context/auth/useAuth';
import { useToast } from '@/context/toast/useToast';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getRetroFormatById, DEFAULT_RETRO_FORMAT_ID } from '@/lib/retroFormats';
import { SessionContext } from './context/SessionContext';
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

// Référence stable pour éviter de recréer un objet à chaque rendu tant que
// l'identité (auth ou invité) n'est pas encore résolue.
const EMPTY_HEADERS: Record<string, string> = {};

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
  const { isAuthenticated, userId, username } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isSessionCodeCopied, setIsSessionCodeCopied] = useState(false);
  const hasShownClosedToastRef = useRef(false);
  const { activeMobileColumn, isMobileViewport, setActiveMobileColumn } = useSessionViewport();
  const panels = useSessionPanels();
  const details = useSessionDetails({ sessionId });
  const identity = useSessionIdentity({
    sessionId,
    isSessionReady: details.hasLoadedSession,
    isAuthenticated,
    userId,
    ownerId: details.ownerId,
  });
  const sessionCards = useSessionCards({ sessionId, actorHeaders: identity.actorHeaders, addToast });
  const activeStep = details.status === 'closed' ? 'results' : details.step;
  const isLoading = useSessionPolling({
    sessionId,
    isAuthenticated,
    navigate,
    addToast,
    fetchSessionDetails: details.fetchSessionDetails,
    fetchCards: sessionCards.fetchCards,
  });
  const {
    handleLeaveSession,
    handleTransitionStep,
    handleUpdateFormat,
    handleUpdateTimer,
    handleCloseSession,
  } = useSessionActions({
    sessionId,
    isAuthenticated,
    navigate,
    addToast,
    leaveParticipation: identity.leaveParticipation,
    clearGuestIdentity: identity.clearGuestIdentity,
    setStep: details.setStep,
    setFormatName: details.setFormatName,
    setFormatColumns: details.setFormatColumns,
    setStepDurationMinutes: details.setStepDurationMinutes,
    setStepEndsAt: details.setStepEndsAt,
  });

  useEffect(() => {
    if (details.hasLoadedSession && details.status === 'closed' && !hasShownClosedToastRef.current) {
      addToast('success', 'Cette rétrospective est terminée. Vous consultez ses résultats.');
      hasShownClosedToastRef.current = true;
    }
  }, [details.hasLoadedSession, details.status, addToast]);
  const writingColumns = useMemo(() => {
    const labels = details.formatColumns.length === 3
      ? details.formatColumns
      : defaultFormatColumns;

    return COLUMNS.map((column, index) => ({
      ...column,
      title: labels[index],
      emptyTitle: `Aucune carte ${labels[index].toLowerCase()}`,
    }));
  }, [details.formatColumns]);

  // `setStep`/`setStepEndsAt`/`setStatus` sont extraits seuls : useCallback exige des
  // dépendance stables, ce que `details.xxx` ne garantit pas pour le
  // compilateur React.
  const { setStep, setStepEndsAt, setStatus } = details;
  const handleSessionStarted = useCallback((nextStep: string, stepEndsAt: string | null) => {
    setStep(nextStep as SessionStep);
    setStepEndsAt(stepEndsAt);
  }, [setStep, setStepEndsAt]);

  // L'échéance redéfinie par le facilitateur arrive en direct par socket.
  const handleTimerUpdated = useCallback((stepEndsAt: string) => {
    setStepEndsAt(stepEndsAt);
  }, [setStepEndsAt]);

  const handleSessionClosedBySocket = useCallback(() => {
    addToast('success', 'Le facilitateur a mis fin à la session. Redirection vers les résultats.');
    setStatus('closed');
    hasShownClosedToastRef.current = true;
  }, [addToast, setStatus]);

  const { participants } = useSessionParticipants(sessionId, identity.selfIdentityForSocket, {
    onSessionStarted: handleSessionStarted,
    onTimerUpdated: handleTimerUpdated,
    onSessionClosed: handleSessionClosedBySocket,
  });

  // Retour = quitter l'écran SANS perdre sa participation : l'identité
  // (invitée ou compte) est conservée pour permettre la reprise depuis
  // l'accueil. "Quitter la session" (menu du badge) reste l'action qui
  // supprime réellement la participation.
  const handleGoHome = () => {
    navigate('/');
  };

  // Le badge participant n'est affiché que pour les non-facilitateurs :
  // le facilitateur a déjà son menu de compte dans la barre.
  const selfDisplayName = identity.role === 'participant'
    ? (identity.guestIdentity?.displayName ?? (isAuthenticated ? username : null))
    : null;

  const handleCopySessionCode = async () => {
    if (!details.sessionCode) return;

    try {
      await navigator.clipboard.writeText(details.sessionCode);
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
  if (!isAuthenticated && !identity.guestIdentity) {
    return <JoinSessionModal sessionId={sessionId} sessionName={details.sessionName} onJoined={identity.handleGuestJoined} />;
  }

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        actorHeaders: identity.actorHeaders ?? EMPTY_HEADERS,
        selfParticipantId: identity.selfParticipantId,
        onCommentsChanged: sessionCards.fetchCards,
      }}
    >
      <div className="flex flex-col flex-1 overflow-hidden">
      <SessionContextBar
        sessionName={details.sessionName}
        sessionId={sessionId}
        sessionCode={details.sessionCode}
        step={activeStep}
        participantCount={participants.filter((participant) => participant.status === 'online').length}
        isSessionCodeCopied={isSessionCodeCopied}
        isParticipantsOpen={panels.isParticipantsDrawerOpen}
        isDiscussionOpen={panels.isDiscussionDrawerOpen}
        selfDisplayName={selfDisplayName}
        canRenameSelf={!isAuthenticated}
        onRenameSelf={identity.renameSelf}
        onLeaveSession={handleLeaveSession}
        onBack={handleGoHome}
        onCopySessionCode={handleCopySessionCode}
        onToggleParticipants={panels.toggleParticipantsDrawer}
        onToggleDiscussion={panels.toggleDiscussionDrawer}
      />
      {activeStep === 'waiting' ? (
        <WaitingStep
          sessionId={sessionId}
          sessionName={details.sessionName}
          sessionCode={details.sessionCode}
          participants={participants}
          selfParticipantId={identity.selfParticipantId}
          role={identity.role}
          formatName={details.formatName}
          stepDurationMinutes={details.stepDurationMinutes}
          onStart={() => handleTransitionStep('writing')}
          onLeave={handleLeaveSession}
          onSelectFormatPreset={handleUpdateFormat}
          onUpdateStepDuration={handleUpdateTimer}
          isDesktop={!isMobileViewport}
        />
      ) : (
        <>
          <SessionActionBar
            step={activeStep}
            cardsCount={sessionCards.cards.length}
            votesLeft={sessionCards.votesLeft}
            isFacilitator={identity.role === 'facilitator' && details.status !== 'closed'}
            stepEndsAt={details.stepEndsAt}
            onTransitionStep={handleTransitionStep}
            onUpdateTimer={handleUpdateTimer}
            onCloseSession={handleCloseSession}
          />
          <ParticipantsDrawer
            participants={participants}
            isOpen={panels.isParticipantsDrawerOpen}
            isDesktop={!isMobileViewport}
            onClose={panels.closeParticipantsDrawer}
          />
          <DiscussionDrawer
            isOpen={panels.isDiscussionDrawerOpen}
            isDesktop={!isMobileViewport}
            onClose={panels.closeDiscussionDrawer}
          />

          {activeStep === 'results' ? (
            <ResultsStep cards={sessionCards.cards} formatColumns={details.formatColumns} isDesktop={!isMobileViewport} />
          ) : activeStep === 'voting' ? (
            <VotingStep
              cards={sessionCards.cards}
              columns={writingColumns}
              activeMobileColumn={activeMobileColumn}
              isMobileViewport={isMobileViewport}
              currentUserId={identity.selfParticipantId}
              onSelectMobileColumn={setActiveMobileColumn}
              onVote={sessionCards.handleVote}
              onOpenComments={panels.openComments}
              onUpdateCard={sessionCards.handleUpdateCard}
              onDeleteCard={sessionCards.handleDeleteCard}
            />
          ) : (
            <WritingStep
              cards={sessionCards.cards}
              columns={writingColumns}
              activeMobileColumn={activeMobileColumn}
              isMobileViewport={isMobileViewport}
              currentUserId={identity.selfParticipantId}
              onSelectMobileColumn={setActiveMobileColumn}
              onAddCard={sessionCards.handleAddCard}
              onVote={sessionCards.handleVote}
              onOpenComments={panels.openComments}
              onUpdateCard={sessionCards.handleUpdateCard}
              onDeleteCard={sessionCards.handleDeleteCard}
            />
          )}
        </>
      )}
    </div>
    </SessionContext.Provider>
  );
};

export default SessionDashboard;
