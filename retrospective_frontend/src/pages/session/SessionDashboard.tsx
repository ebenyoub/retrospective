import { useAuth } from '@/context/auth/useAuth';
import { useToast } from '@/context/toast/useToast';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getApiErrorMessage, NETWORK_ERROR_MESSAGE } from '@/lib/apiError';
import { getRetroFormatById, DEFAULT_RETRO_FORMAT_ID } from '@/lib/retroFormats';
import { SessionContext } from './context/SessionContext';
import SessionDashboardLayout from './components/SessionDashboardLayout';
import JoinSessionModal from './components/JoinSessionModal';
import { useSessionActions } from './hooks/useSessionActions';
import { useSessionCards } from './hooks/useSessionCards';
import { useSessionDetails } from './hooks/useSessionDetails';
import { useSessionIdentity } from './hooks/useSessionIdentity';
import { useSessionPanels } from './hooks/useSessionPanels';
import { useSessionParticipants } from './hooks/useSessionParticipants';
import { useSessionPolling } from './hooks/useSessionPolling';
import { useSessionSocketHandlers } from './hooks/useSessionSocketHandlers';
import { useSessionViewport } from './hooks/useSessionViewport';
import { useSoundPreference } from './hooks/useSoundPreference';
import { createAction } from './services/actionApi';
import type { CreateActionPayload } from './services/actionApi';
import { COLUMNS } from './sessionBoardColumns';

// Référence stable pour éviter de recréer un objet à chaque rendu tant que
// l'identité (auth ou invité) n'est pas encore résolue.
const EMPTY_HEADERS: Record<string, string> = {};

const defaultFormatColumns = getRetroFormatById(DEFAULT_RETRO_FORMAT_ID).columns;

const SessionDashboard = () => {
  const { id } = useParams();
  const sessionId = id || '';
  const { isAuthenticated, userId } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isSessionCodeCopied, setIsSessionCodeCopied] = useState(false);
  const hasShownClosedToastRef = useRef(false);
  const { activeMobileColumn, isMobileViewport, isDesktopViewport, setActiveMobileColumn } = useSessionViewport();
  const panels = useSessionPanels();
  const details = useSessionDetails({ sessionId });
  const identity = useSessionIdentity({
    sessionId,
    isSessionReady: details.hasLoadedSession,
    isAuthenticated,
    userId,
    ownerId: details.ownerId,
    sessionStatus: details.status,
  });
  const sessionCards = useSessionCards({ sessionId, actorHeaders: identity.actorHeaders, addToast });
  const { isSoundEnabled, toggleSound } = useSoundPreference();
  const activeStep = details.status === 'closed' ? 'results' : details.step;
  // Dérivés calculés une seule fois ici plutôt que recalculés dans chaque
  // composant consommateur (SessionContext expose isFacilitator/isDesktop).
  const isFacilitator = identity.role === 'facilitator' && details.status !== 'closed';
  const isDesktop = !isMobileViewport;
  // Un ancien invité (pas de compte, pas de cookie) doit pouvoir rouvrir une
  // session close en lecture seule sous son pseudo déjà connu : sans jeton,
  // getSessionDetailsForViewer (backend) la traite comme inexistante (404) et
  // redemande un pseudo à tort (bug remonté).
  // `fetchSessionDetails`/`guestIdentity` extraits seuls : useCallback exige
  // des dépendances stables, ce que `details.xxx`/`identity.xxx` ne
  // garantissent pas pour le compilateur React.
  const { fetchSessionDetails } = details;
  const { guestIdentity } = identity;
  const fetchSessionDetailsWithGuestToken = useCallback(
    (): Promise<void> => fetchSessionDetails(guestIdentity?.guestToken),
    [fetchSessionDetails, guestIdentity]
  );
  const isLoading = useSessionPolling({
    sessionId,
    isAuthenticated,
    navigate,
    addToast,
    fetchSessionDetails: fetchSessionDetailsWithGuestToken,
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
    fetchCards: sessionCards.fetchCards,
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

  const { handleSessionStarted, handleTimerUpdated, handleSessionClosedBySocket } = useSessionSocketHandlers({
    setStep: details.setStep,
    setStepEndsAt: details.setStepEndsAt,
    setStatus: details.setStatus,
    addToast,
    hasShownClosedToastRef,
  });

  const { participants, messages, setMessages, actions, setActions, lastCommentAdded, isDiscussionBlinking, clearDiscussionBlinking } = useSessionParticipants(
    sessionId,
    identity.selfIdentityForSocket,
    {
      onSessionStarted: handleSessionStarted,
      onTimerUpdated: handleTimerUpdated,
      onSessionClosed: handleSessionClosedBySocket,
      actorHeaders: identity.actorHeaders ?? EMPTY_HEADERS,
      isSoundEnabled,
    }
  );

  // Un commentaire ajouté (par soi ou par un autre participant) rafraîchit le
  // compteur affiché sur la carte concernée pour tout le monde. Le panneau de
  // commentaires déjà ouvert sur cette carte se met à jour de son côté (voir
  // CardCommentsSection, qui écoute aussi lastCommentAdded).
  const { fetchCards } = sessionCards;
  useEffect(() => {
    if (!lastCommentAdded) return;
    void fetchCards();
  }, [lastCommentAdded, fetchCards]);

  const handleAddAction = useCallback(async (payload: CreateActionPayload): Promise<void> => {
    if (!sessionId || !identity.actorHeaders || details.status === 'closed') return;

    try {
      const result = await createAction(sessionId, identity.actorHeaders, payload);

      if (result.ok) {
        setActions((previous) => {
          if (previous.some((a) => a.id === result.data.id)) return previous;
          return [...previous, result.data];
        });
      } else {
        addToast('error', getApiErrorMessage(result.payload, "Impossible d'ajouter l'action."));
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'action :", error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    }
  }, [sessionId, identity.actorHeaders, setActions, addToast, details.status]);

  // Retour = quitter l'écran SANS perdre sa participation : l'identité
  // (invitée ou compte) est conservée pour permettre la reprise depuis
  // l'accueil. "Quitter la session" (menu du badge) reste l'action qui
  // supprime réellement la participation.
  const handleGoHome = () => {
    navigate('/');
  };

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
  if (
    details.status !== 'closed' &&
    !isAuthenticated &&
    !identity.guestIdentity &&
    !identity.isResumingFromCookie
  ) {
    return <JoinSessionModal sessionId={sessionId} sessionName={details.sessionName} onJoined={identity.handleGuestJoined} />;
  }

  if (details.status === 'closed' && !identity.actorHeaders) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center">
        <p className="max-w-md text-sm text-slate-400">
          Cette rétrospective est terminée. Ses résultats sont accessibles uniquement aux participants déjà autorisés.
        </p>
      </div>
    );
  }

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        actorHeaders: identity.actorHeaders ?? EMPTY_HEADERS,
        selfParticipantId: identity.selfParticipantId,
        isReadOnly: details.status === 'closed',
        onCommentsChanged: sessionCards.fetchCards,

        viewport: {
          activeMobileColumn,
          isMobileViewport,
          isDesktop,
          isDesktopViewport,
          setActiveMobileColumn,
        },
        panels,
        // `step` reflète l'étape réellement affichée (une session clôturée
        // reste sur "results" quelle que soit l'étape enregistrée côté
        // backend) : c'est la même valeur que l'ancienne `activeStep`.
        details: { ...details, step: activeStep },
        identity: { ...identity, isFacilitator },
        sessionCards,

        participants,
        messages,
        setMessages,
        actions,
        setActions,
        lastCommentAdded,
        isDiscussionBlinking,
        clearDiscussionBlinking,
        isSoundEnabled,
        toggleSound,

        votesLeft: sessionCards.votesLeft,
        stepEndsAt: details.stepEndsAt,
        handleTransitionStep,
        handleUpdateFormat,
        handleUpdateTimer,
        handleCloseSession,
        handleLeaveSession,
      }}
    >
      <SessionDashboardLayout
        isSessionCodeCopied={isSessionCodeCopied}
        onCopySessionCode={handleCopySessionCode}
        onBack={handleGoHome}
        writingColumns={writingColumns}
        onAddAction={handleAddAction}
      />
    </SessionContext.Provider>
  );
};

export default SessionDashboard;
