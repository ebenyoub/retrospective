import { useAuth } from '@/context/auth/useAuth';
import { useToast } from '@/context/toast/useToast';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { API_BASE } from '@/lib/api';
import { getApiErrorMessage, isApiSuccess, NETWORK_ERROR_MESSAGE, readJsonSafely } from '@/lib/apiError';
import { getRetroFormatById, DEFAULT_RETRO_FORMAT_ID } from '@/lib/retroFormats';
import CardCommentsModal from './components/CardCommentsModal';
import DiscussionDrawer from './components/DiscussionDrawer';
import ParticipantsDrawer from './components/ParticipantsDrawer';
import RetroColumn from './components/RetroColumn';
import SessionActionBar from './components/SessionActionBar';
import SessionContextBar from './components/SessionContextBar';
import SessionResults from './components/SessionResults';
import type { RetroCard } from './components/RetroCardItem';
import type { SessionRole } from './sessionRole';
import { WaitingScreen } from './components/WaitingScreen';
import JoinSessionModal, { type GuestJoinResponse } from './components/JoinSessionModal';
import { useGuestParticipant } from './hooks/useGuestParticipant';
import { useSessionParticipants, type SelfIdentity } from './hooks/useSessionParticipants';
import type { SessionStep } from './sessionStep';

interface SessionDetails {
  id: number;
  name: string;
  code: string;
  step?: SessionStep;
  ownerId: number;
  formatName?: string;
  formatColumns?: string[] | string;
}

const guestHeaders = (participantId: number, guestToken: string): Record<string, string> => ({
  'x-participant-id': String(participantId),
  'x-guest-token': guestToken,
});

const COLUMNS: {
  key: RetroCard['columnType'];
  emoji: string;
  color: string;
  dotClassName: string;
  accentClassName: string;
  tabActiveClassName: string;
  emptyTitle: string;
  emptyDescription: string;
}[] = [
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
const legacyDefaultFormatColumns = ['Start', 'Stop', 'Continue'];

const normalizeLegacyDefaultColumns = (columns: string[]): string[] => (
  columns.every((column, index) => column === legacyDefaultFormatColumns[index])
    ? defaultFormatColumns
    : columns
);

const normalizeFormatColumns = (columns: SessionDetails['formatColumns']): string[] => {
  if (Array.isArray(columns) && columns.length === 3) {
    return normalizeLegacyDefaultColumns(columns);
  }

  if (typeof columns === 'string') {
    try {
      const parsed: unknown = JSON.parse(columns);
      if (Array.isArray(parsed) && parsed.length === 3 && parsed.every((column) => typeof column === 'string')) {
        return normalizeLegacyDefaultColumns(parsed);
      }
    } catch {
      return defaultFormatColumns;
    }
  }

  return defaultFormatColumns;
};

const SessionDashboard = () => {
  const { id } = useParams();
  const sessionId = id || '';
  const { isAuthenticated, token, userId } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [cards, setCards] = useState<RetroCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<SessionRole | null>(null);
  const [sessionName, setSessionName] = useState<string>('');
  const [sessionCode, setSessionCode] = useState<string>('');
  const [step, setStep] = useState<SessionStep>('waiting');
  const [formatName, setFormatName] = useState<string>(getRetroFormatById(DEFAULT_RETRO_FORMAT_ID).name);
  const [formatColumns, setFormatColumns] = useState<string[]>(defaultFormatColumns);
  const [activeMobileColumn, setActiveMobileColumn] = useState<RetroCard['columnType']>('start');
  const [isMobileViewport, setIsMobileViewport] = useState(() => (
    typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(max-width: 767px)').matches
  ));

  // Salle d'attente : identité du participant courant (compte ou invité).
  const { identity: guestIdentity, setIdentity: setGuestIdentity, clearIdentity: clearGuestIdentity } = useGuestParticipant(sessionId);
  const [selfParticipantId, setSelfParticipantId] = useState<number | null>(null);
  const [isSessionCodeCopied, setIsSessionCodeCopied] = useState(false);
  const [isParticipantsDrawerOpen, setIsParticipantsDrawerOpen] = useState(false);
  const [isDiscussionDrawerOpen, setIsDiscussionDrawerOpen] = useState(false);
  const [commentsCard, setCommentsCard] = useState<RetroCard | null>(null);

  const votesUsed = useMemo(() => cards.filter((card) => card.votedByMe).length, [cards]);
  const votesLeft = useMemo(() => Math.max(0, 5 - votesUsed), [votesUsed]);
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

  const actorHeaders = useMemo((): Record<string, string> | null => {
    if (isAuthenticated && token) {
      return {
        Authorization: `Bearer ${token}`,
        ...(selfParticipantId ? { 'x-participant-id': String(selfParticipantId) } : {}),
      };
    }

    if (guestIdentity && selfParticipantId) {
      return guestHeaders(selfParticipantId, guestIdentity.guestToken);
    }

    return null;
  }, [isAuthenticated, token, selfParticipantId, guestIdentity]);

  const fetchCards = useCallback(async () => {
    const sessionIdNumber = Number(sessionId);
    if (!sessionId || sessionId === "undefined" || isNaN(sessionIdNumber) || sessionIdNumber <= 0 || !actorHeaders) return;

    try {
      const response = await fetch(`${API_BASE}/session/${sessionId}/cards`, {
        headers: actorHeaders,
      });

      const data = await readJsonSafely(response);

      if (response.ok && isApiSuccess<RetroCard[]>(data)) {
        setCards(data.data);
      } else {
        addToast('error', getApiErrorMessage(data, 'Impossible de charger les cartes.'));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cartes :', error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    }
  }, [actorHeaders, addToast, sessionId]);

  // Publique (pas de JWT requis) : un participant invité doit pouvoir lire le
  // nom, le code et le format de la session avant même d'avoir rejoint.
  const fetchSessionDetails = useCallback(async () => {
    const sessionIdNumber = Number(sessionId);
    if (!sessionId || sessionId === "undefined" || isNaN(sessionIdNumber) || sessionIdNumber <= 0) return;

    try {
      const response = await fetch(`${API_BASE}/session/${sessionId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = await readJsonSafely(response);

      if (response.ok && isApiSuccess<SessionDetails & { formatName: string }>(data)) {
        setSessionName(data.data.name);
        setSessionCode(data.data.code);
        setStep(data.data.step || 'writing');
        setFormatName(data.data.formatName ?? getRetroFormatById(DEFAULT_RETRO_FORMAT_ID).name);
        setFormatColumns(normalizeFormatColumns(data.data.formatColumns));

        if (isAuthenticated && userId) {
          setRole(data.data.ownerId === userId ? 'facilitator' : 'participant');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la session :', error);
    }
  }, [sessionId, token, userId, isAuthenticated]);

  useEffect(() => {
    const sessionIdNumber = Number(sessionId);
    if (!sessionId || sessionId === "undefined" || isNaN(sessionIdNumber) || sessionIdNumber <= 0) {
      const loadingTimeout = window.setTimeout(() => setIsLoading(false), 0);
      addToast('error', 'Session invalide ou non spécifiée.');
      navigate(isAuthenticated ? '/sessions' : '/');
      return () => window.clearTimeout(loadingTimeout);
    }

    let isActive = true;

    const loadSession = async () => {
      await Promise.all([fetchSessionDetails(), fetchCards()]);

      if (isActive) {
        setIsLoading(false);
      }
    };

    void loadSession();

    const interval = setInterval(() => {
      fetchSessionDetails();
      fetchCards();
    }, 4000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [fetchSessionDetails, fetchCards, sessionId, navigate, isAuthenticated, addToast]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleChange = () => setIsMobileViewport(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Rejoint automatiquement la salle d'attente pour un utilisateur authentifié
  // (facilitateur ou participant connu) : idempotent, pas de doublon au refresh.
  useEffect(() => {
    const sessionIdNumber = Number(sessionId);
    if (!sessionId || sessionId === "undefined" || isNaN(sessionIdNumber) || sessionIdNumber <= 0) return;
    // isLoading évite de se fier au step initial ('waiting' par défaut avant
    // la 1ère réponse) : sans cette garde, cet effet se déclenche à tort pour
    // une session déjà en écriture/vote/résultats le temps que le vrai step arrive.
    if (isLoading || !isAuthenticated || !token || selfParticipantId) return;

    let isActive = true;

    const ensureSelf = async () => {
      try {
        const response = await fetch(`${API_BASE}/session/${sessionId}/participants/self`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await readJsonSafely(response);

        if (isActive && response.ok && isApiSuccess<{ id: number; role: SessionRole }>(data)) {
          setSelfParticipantId(data.data.id);
          setRole(data.data.role);
        }
      } catch (error) {
        console.error("Erreur lors de la jointure de la salle d'attente :", error);
      }
    };

    void ensureSelf();

    return () => {
      isActive = false;
    };
  }, [isLoading, isAuthenticated, token, sessionId, selfParticipantId]);

  // Reprend la participation invitée après un refresh (même onglet, même
  // jeton) : ne recrée jamais une seconde ligne pour le même invité.
  useEffect(() => {
    const sessionIdNumber = Number(sessionId);
    if (!sessionId || sessionId === "undefined" || isNaN(sessionIdNumber) || sessionIdNumber <= 0) return;
    if (isLoading || isAuthenticated || !guestIdentity || selfParticipantId) return;

    let isActive = true;

    const resume = async () => {
      try {
        const response = await fetch(`${API_BASE}/session/${sessionId}/participants/resume`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantId: guestIdentity.participantId, guestToken: guestIdentity.guestToken }),
        });
        const data = await readJsonSafely(response);

        if (!isActive) return;

        if (response.ok && isApiSuccess<{ id: number }>(data)) {
          setSelfParticipantId(data.data.id);
          setRole('participant');
        } else {
          // Le jeton stocké ne correspond plus à rien côté serveur : on
          // l'oublie et on repropose le formulaire de pseudo (jamais de
          // redirection vers l'accueil ou vers la connexion).
          clearGuestIdentity();
        }
      } catch (error) {
        console.error('Erreur lors de la reprise de participation :', error);
      }
    };

    void resume();

    return () => {
      isActive = false;
    };
  }, [isLoading, isAuthenticated, guestIdentity, selfParticipantId, sessionId, clearGuestIdentity]);

  const handleSessionStarted = useCallback((nextStep: string) => {
    setStep(nextStep as SessionStep);
  }, []);

  const selfIdentityForSocket: SelfIdentity | null = useMemo(() => {
    if (!selfParticipantId) return null;
    if (isAuthenticated && token) return { participantId: selfParticipantId, token };
    if (guestIdentity) return { participantId: selfParticipantId, guestToken: guestIdentity.guestToken };
    return null;
  }, [selfParticipantId, isAuthenticated, token, guestIdentity]);

  const { participants } = useSessionParticipants(sessionId, selfIdentityForSocket, {
    onSessionStarted: handleSessionStarted,
  });

  const leaveParticipation = useCallback(async () => {
    if (!selfParticipantId) return;

    try {
      await fetch(`${API_BASE}/session/${sessionId}/participants/${selfParticipantId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ guestToken: guestIdentity?.guestToken }),
      });
    } catch (error) {
      console.error('Erreur lors du départ de la session :', error);
    }
  }, [sessionId, selfParticipantId, token, guestIdentity]);

  const handleLeaveSession = useCallback(async () => {
    await leaveParticipation();
    if (!isAuthenticated) {
      clearGuestIdentity();
    }
    navigate('/', { state: { fromSessions: true } });
  }, [leaveParticipation, isAuthenticated, clearGuestIdentity, navigate]);

  const handleUpdateFormat = async (nextName: string, nextColumns: string[]) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/session/${sessionId}/format`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ formatName: nextName, formatColumns: nextColumns }),
      });
      const data = await readJsonSafely(response);

      if (response.ok && isApiSuccess(data)) {
        setFormatName(nextName);
        setFormatColumns(nextColumns);
      } else {
        addToast('error', getApiErrorMessage(data, 'Impossible de mettre à jour le format.'));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du format :', error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    }
  };

  const handleAddCard = async (columnType: RetroCard['columnType'], content: string) => {
    if (!sessionId || !actorHeaders) return;

    try {
      const response = await fetch(`${API_BASE}/session/${sessionId}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...actorHeaders,
        },
        body: JSON.stringify({ content, columnType }),
      });

      const data = await readJsonSafely(response);

      if (response.ok && isApiSuccess(data)) {
        await fetchCards();
      } else {
        addToast('error', getApiErrorMessage(data, 'Impossible d\'ajouter la carte.'));
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la carte :", error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    }
  };

  const handleVote = async (cardId: number) => {
    if (!sessionId || !actorHeaders) return;

    try {
      const response = await fetch(`${API_BASE}/session/${sessionId}/cards/${cardId}/vote`, {
        method: 'POST',
        headers: actorHeaders,
      });

      const data = await readJsonSafely(response);

      if (response.ok && isApiSuccess(data)) {
        await fetchCards();
      } else {
        addToast('error', getApiErrorMessage(data, 'Impossible d\'enregistrer le vote.'));
      }
    } catch (error) {
      console.error('Erreur lors du vote :', error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!sessionId || !actorHeaders) return;

    try {
      const response = await fetch(`${API_BASE}/session/${sessionId}/cards/${cardId}`, {
        method: 'DELETE',
        headers: actorHeaders,
      });

      const data = await readJsonSafely(response);

      if (response.ok && isApiSuccess(data)) {
        await fetchCards();
      } else {
        addToast('error', getApiErrorMessage(data, 'Impossible de supprimer la carte.'));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la carte :', error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    }
  };

  const handleUpdateCard = async (cardId: number, content: string) => {
    if (!sessionId || !actorHeaders) return false;

    try {
      const response = await fetch(`${API_BASE}/session/${sessionId}/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...actorHeaders,
        },
        body: JSON.stringify({ content }),
      });

      const data = await readJsonSafely(response);

      if (response.ok && isApiSuccess(data)) {
        await fetchCards();
        return true;
      }

      addToast('error', getApiErrorMessage(data, 'Impossible de modifier la carte.'));
      return false;
    } catch (error) {
      console.error('Erreur lors de la modification de la carte :', error);
      addToast('error', NETWORK_ERROR_MESSAGE);
      return false;
    }
  };

  const handleTransitionStep = async (nextStep: SessionStep) => {
    if (!sessionId || !token) return;

    try {
      const response = await fetch(`${API_BASE}/session/${sessionId}/step`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ step: nextStep }),
      });

      const data = await readJsonSafely(response);

      if (response.ok && isApiSuccess(data)) {
        setStep(nextStep);
        addToast('success', `Session passée à l'étape : ${nextStep === 'writing' ? 'Écriture' : nextStep === 'voting' ? 'Vote' : 'Résultats'}`);
      } else {
        addToast('error', getApiErrorMessage(data, 'Impossible de changer d\'étape.'));
      }
    } catch (error) {
      console.error('Erreur lors du changement d\'étape :', error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    }
  };

  const handleGuestJoined = (result: GuestJoinResponse) => {
    setGuestIdentity({ participantId: result.id, guestToken: result.guestToken, displayName: result.displayName });
    setSelfParticipantId(result.id);
    setRole(result.role);
  };

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

  const handleToggleParticipantsDrawer = () => {
    setIsParticipantsDrawerOpen((isOpen) => {
      if (!isOpen) setIsDiscussionDrawerOpen(false);
      return !isOpen;
    });
  };

  const handleToggleDiscussionDrawer = () => {
    setIsDiscussionDrawerOpen((isOpen) => {
      if (!isOpen) setIsParticipantsDrawerOpen(false);
      return !isOpen;
    });
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
    if (!selfParticipantId) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-slate-400">Connexion à la salle d'attente...</p>
        </div>
      );
    }

    return (
      <>
        <WaitingScreen
          sessionId={sessionId}
          sessionName={sessionName}
          sessionCode={sessionCode}
          participants={participants}
          selfParticipantId={selfParticipantId}
          role={role || 'participant'}
          formatName={formatName}
          onStart={() => handleTransitionStep('writing')}
          onLeave={handleLeaveSession}
          onSelectFormatPreset={handleUpdateFormat}
          isDesktop={!isMobileViewport}
        />
      </>
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
        onToggleParticipants={handleToggleParticipantsDrawer}
        onToggleDiscussion={handleToggleDiscussionDrawer}
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
        onClose={() => setIsParticipantsDrawerOpen(false)}
      />
      <DiscussionDrawer
        isOpen={isDiscussionDrawerOpen}
        isDesktop={!isMobileViewport}
        onClose={() => setIsDiscussionDrawerOpen(false)}
      />
      {commentsCard && (
        <CardCommentsModal
          card={commentsCard}
          isDesktop={!isMobileViewport}
          onClose={() => setCommentsCard(null)}
        />
      )}

      {step === 'results' ? (
        /* Vue résultats : stats, Top 3 et colonnes par catégorie (fidèle Figma) */
        <SessionResults cards={cards} formatColumns={formatColumns} isDesktop={!isMobileViewport} />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Grille 3 colonnes Figma Make : gap:1px (gap-px), fond navy-border = séparateurs 1px */}
          <div className="relative flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden bg-navy-border gap-px">
            {isMobileViewport && (
              <div className="absolute inset-x-0 top-0 z-10 flex border-b border-navy-border bg-navy-mid/95 px-1 backdrop-blur">
                {writingColumns.map((column) => {
                  const isActive = activeMobileColumn === column.key;
                  const count = cards.filter((card) => card.columnType === column.key).length;
                  return (
                    <button
                      key={column.key}
                      type="button"
                      onClick={() => setActiveMobileColumn(column.key)}
                      className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-1 py-2.5 text-xs font-semibold transition-colors ${
                        isActive
                          ? `${column.tabActiveClassName} text-slate-50`
                          : 'border-transparent text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <span className="text-[14px] leading-none" role="img" aria-hidden="true">{column.emoji}</span>
                      <span>{column.title}</span>
                      <span
                        className={`rounded px-1.5 font-mono text-[10px] ${
                          isActive ? 'bg-navy-surface-med text-slate-200' : 'bg-navy-surface text-slate-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {writingColumns.map((column) => (
              <RetroColumn
                key={column.key}
                className={isMobileViewport
                  ? (activeMobileColumn === column.key ? 'pt-11' : 'hidden')
                  : ''}
                title={column.title}
                emoji={column.emoji}
                color={column.color}
                dotClassName={column.dotClassName}
                accentClassName={column.accentClassName}
                emptyTitle={column.emptyTitle}
                emptyDescription={column.emptyDescription}
                cards={cards.filter((card) => card.columnType === column.key)}
                currentUserId={selfParticipantId}
                onAddCard={step === 'writing' ? (content) => handleAddCard(column.key, content) : undefined}
                onVote={handleVote}
                onOpenComments={setCommentsCard}
                onUpdateCard={handleUpdateCard}
                onDeleteCard={handleDeleteCard}
                canVote={step === 'voting'}
                canEdit={step === 'writing'}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDashboard;
