import { useAuth } from '@/context/auth/useAuth';
import { useToast } from '@/context/toast/useToast';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getApiErrorMessage, isApiSuccess, NETWORK_ERROR_MESSAGE, readJsonSafely } from '@/lib/apiError';
import RetroColumn from './components/RetroColumn';
import SessionResults from './components/SessionResults';
import type { RetroCard } from './components/RetroCardItem';
import { ROLE_LABEL, type SessionRole } from './sessionRole';
import { WaitingScreen } from './components/WaitingScreen';
import CustomFormatModal from './components/CustomFormatModal';
import JoinSessionModal, { type GuestJoinResponse } from './components/JoinSessionModal';
import { useGuestParticipant } from './hooks/useGuestParticipant';
import { useSessionParticipants, type SelfIdentity } from './hooks/useSessionParticipants';
import TimerChip from './components/TimerChip';

import { API_BASE } from '@/lib/api';

type SessionStep = 'waiting' | 'writing' | 'voting' | 'results';

interface SessionDetails {
  id: number;
  name: string;
  code: string;
  step?: SessionStep;
  ownerId: number;
  formatName?: string;
}

const guestHeaders = (participantId: number, guestToken: string): Record<string, string> => ({
  'x-participant-id': String(participantId),
  'x-guest-token': guestToken,
});

const COLUMNS: {
  key: RetroCard['columnType'];
  title: string;
  emoji: string;
  color: string;
  dotClassName: string;
  accentClassName: string;
  tabActiveClassName: string;
  emptyTitle: string;
  emptyDescription: string;
}[] = [
  {
    key: 'continue',
    title: 'Positif',
    emoji: '✅',
    color: '#16a34a',
    dotClassName: 'bg-green-500',
    accentClassName: 'border-l-green-500',
    tabActiveClassName: 'border-green-500',
    emptyTitle: 'Aucune carte positif',
    emptyDescription: "Écrivez ce qui s'est bien passé…",
  },
  {
    key: 'stop',
    title: 'Négatif',
    emoji: '🚧',
    color: '#dc2626',
    dotClassName: 'bg-red-500',
    accentClassName: 'border-l-red-500',
    tabActiveClassName: 'border-red-500',
    emptyTitle: 'Aucune carte négatif',
    emptyDescription: 'Écrivez ce qui a moins bien marché…',
  },
  {
    key: 'start',
    title: 'Idées',
    emoji: '💡',
    color: '#d97706',
    dotClassName: 'bg-yellow-500',
    accentClassName: 'border-l-yellow-500',
    tabActiveClassName: 'border-yellow-500',
    emptyTitle: 'Aucune carte idées',
    emptyDescription: "Proposez des pistes d'amélioration…",
  },
];

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
  const [formatName, setFormatName] = useState<string>('Start / Stop / Continue');
  const [activeMobileColumn, setActiveMobileColumn] = useState<RetroCard['columnType']>('continue');
  const [isMobileViewport, setIsMobileViewport] = useState(() => (
    typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(max-width: 767px)').matches
  ));

  // Salle d'attente : identité du participant courant (compte ou invité).
  const { identity: guestIdentity, setIdentity: setGuestIdentity, clearIdentity: clearGuestIdentity } = useGuestParticipant(sessionId);
  const [selfParticipantId, setSelfParticipantId] = useState<number | null>(null);
  const [isCustomFormatModalOpen, setIsCustomFormatModalOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);

  const votesUsed = useMemo(() => cards.filter((card) => card.votedByMe).length, [cards]);
  const votesLeft = useMemo(() => Math.max(0, 5 - votesUsed), [votesUsed]);

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
        setFormatName(data.data.formatName);

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
      setIsLoading(false);
      addToast('error', 'Session invalide ou non spécifiée.');
      navigate(isAuthenticated ? '/sessions' : '/');
      return;
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
          onOpenCustomFormatModal={() => setIsCustomFormatModalOpen(true)}
          isDesktop={!isMobileViewport}
        />
        {isCustomFormatModalOpen && (
          <CustomFormatModal
            initialName={formatName}
            onValidate={(name, columns) => {
              handleUpdateFormat(name, columns);
              setIsCustomFormatModalOpen(false);
            }}
            onCancel={() => setIsCustomFormatModalOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Sub-toolbar — collé sous le header global, aligné Figma Make */}
      <div className="flex flex-shrink-0 flex-wrap items-center justify-between w-full bg-navy-mid border-b border-navy-border px-5 py-2.5 gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className="text-sm font-bold text-slate-50 break-words truncate">
            {sessionName ? sessionName : `Session ${sessionId}`}
          </h1>
          {role && <Badge>{ROLE_LABEL[role]}</Badge>}
          <span className="text-xs font-semibold text-green-figma uppercase bg-green-figma/10 px-2 py-0.5 rounded">
            {step === 'writing' ? 'Écriture' : step === 'voting' ? 'Vote' : 'Résultats'}
          </span>
          {sessionCode && (
            <span className="text-xs font-mono font-semibold text-slate-400 tracking-wider">
              Code : {sessionCode}
            </span>
          )}
          {step === 'writing' && (
            <span className="text-xs text-slate-400 font-sans hidden sm:inline select-none">
              {cards.length} carte{cards.length !== 1 ? 's' : ''} au total
            </span>
          )}
          {step === 'voting' && (
            <div
              role="status"
              aria-label={`${votesLeft} votes restants sur 5`}
              className="flex items-center gap-2 bg-navy-surface border border-navy-border-med rounded-lg px-3 py-1 flex-shrink-0"
            >
              <span className="font-sans text-[13px] font-bold text-slate-200 select-none">
                {votesLeft} vote{votesLeft !== 1 ? 's' : ''} restant{votesLeft !== 1 ? 's' : ''}
              </span>
              <div className="flex gap-1" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                      i < votesLeft ? 'bg-amber-400' : 'bg-navy-border-med'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 relative">
          {step === 'writing' && <TimerChip value="05:00" />}
          {step === 'voting' && <TimerChip value="04:30" />}

          {role === 'facilitator' && (
            <>
              {step === 'writing' && (
                <Button variant="primary" size="sm" onClick={() => handleTransitionStep('voting')}>
                  Passer au vote →
                </Button>
              )}
              {step === 'voting' && (
                <Button variant="success" size="sm" onClick={() => handleTransitionStep('results')}>
                  Voir les résultats →
                </Button>
              )}
            </>
          )}

          {step === 'results' && (
            <Button variant="secondary" size="sm" onClick={handleLeaveSession}>
              Quitter la session
            </Button>
          )}

          {/* Bouton de menu à trois points (menu `…`) visible uniquement à l'écriture et au vote */}
          {step !== 'results' && (
            <>
              <button
                type="button"
                onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
                aria-label="Actions de session"
                aria-expanded={isActionsMenuOpen}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-surface-med border border-navy-border-med text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer select-none"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>

              {/* Dropdown Menu pour les actions */}
              {isActionsMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsActionsMenuOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-1.5 w-44 rounded-lg bg-navy-mid border border-navy-border shadow-lg py-1 z-50 animate-fade-in">
                    <button
                      type="button"
                      onClick={async () => {
                        setIsActionsMenuOpen(false);
                        await handleLeaveSession();
                      }}
                      className="w-full text-left font-sans text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 transition-all cursor-pointer border-none bg-transparent"
                    >
                      Quitter la session
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {step === 'results' ? (
        /* Vue résultats : stats, Top 3 et colonnes par catégorie (fidèle Figma) */
        <SessionResults cards={cards} isDesktop={!isMobileViewport} />
      ) : (
        <>
          {/* Onglets mobiles */}
          {isMobileViewport && (
            <div className="flex flex-shrink-0 border-b border-navy-border px-1">
              {COLUMNS.map((column) => {
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

          {/* Grille 3 colonnes Figma Make : gap:1px (gap-px), fond navy-border = séparateurs 1px */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden bg-navy-border gap-px">
            {COLUMNS.map((column) => (
              <RetroColumn
                key={column.key}
                className={isMobileViewport
                  ? (activeMobileColumn === column.key ? '' : 'hidden')
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
                onUpdateCard={handleUpdateCard}
                onDeleteCard={handleDeleteCard}
                canVote={step === 'voting'}
                canEdit={step === 'writing'}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SessionDashboard;
