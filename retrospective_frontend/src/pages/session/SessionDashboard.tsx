import { useAuth } from '@/context/auth/useAuth';
import { useToast } from '@/context/toast/useToast';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getApiErrorMessage, isApiSuccess, NETWORK_ERROR_MESSAGE, readJsonSafely } from '@/lib/apiError';
import RetroColumn from './components/RetroColumn';
import type { RetroCard } from './components/RetroCardItem';
import { ROLE_LABEL, type SessionRole } from './sessionRole';
import { WaitingScreen } from './components/WaitingScreen';
import CustomFormatModal from './components/CustomFormatModal';
import JoinSessionModal, { type GuestJoinResponse } from './components/JoinSessionModal';
import { useGuestParticipant } from './hooks/useGuestParticipant';
import { useSessionParticipants, type SelfIdentity } from './hooks/useSessionParticipants';

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
  color: string;
  dotClassName: string;
  accentClassName: string;
  tabActiveClassName: string;
  emptyMessage: string;
}[] = [
  {
    key: 'continue',
    title: 'Positif',
    color: '#16a34a',
    dotClassName: 'bg-green-500',
    accentClassName: 'border-l-green-500',
    tabActiveClassName: 'border-green-500',
    emptyMessage: "Aucun retour positif pour l'instant.",
  },
  {
    key: 'stop',
    title: 'Négatif',
    color: '#dc2626',
    dotClassName: 'bg-red-500',
    accentClassName: 'border-l-red-500',
    tabActiveClassName: 'border-red-500',
    emptyMessage: "Aucun retour négatif pour l'instant.",
  },
  {
    key: 'start',
    title: 'Idées',
    color: '#d97706',
    dotClassName: 'bg-yellow-500',
    accentClassName: 'border-l-yellow-500',
    tabActiveClassName: 'border-yellow-500',
    emptyMessage: "Aucune idée pour l'instant.",
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
    if (!sessionId || !actorHeaders) return;

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
    if (!sessionId) return;

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
  }, [fetchSessionDetails, fetchCards]);

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

  const handleLeaveWaitingRoom = async () => {
    await leaveParticipation();
    clearGuestIdentity();
    navigate('/');
  };

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

  const resultsCards = [...cards].sort((a, b) => b.votesCount - a.votesCount);

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
          onLeave={handleLeaveWaitingRoom}
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
        </div>
        {role === 'facilitator' && (
          <div className="flex items-center gap-2">
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
            {step === 'results' && (
              <Button variant="secondary" size="sm" onClick={() => navigate('/sessions')}>
                Quitter la session
              </Button>
            )}
          </div>
        )}
      </div>

      {step === 'results' ? (
        /* Vue résultats : colonne unique scrollable centrée */
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <RetroColumn
            title="Résultats"
            dotClassName="bg-slate-400"
            accentClassName="border-l-slate-400"
            color="#94a3b8"
            emptyMessage="Aucune carte pour l'instant."
            cards={resultsCards}
            currentUserId={selfParticipantId}
            onVote={handleVote}
            onUpdateCard={handleUpdateCard}
            onDeleteCard={handleDeleteCard}
            canVote={false}
            canEdit={false}
          />
        </div>
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
                    <span className={`h-2 w-2 rounded-full ${column.dotClassName}`} />
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

          {/* Grille 3 colonnes Figma Make : gap:0, fond navy-border = séparateurs 1px */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden" style={{ gap: 1, background: 'rgba(255,255,255,0.08)' }}>
            {COLUMNS.map((column) => (
              <RetroColumn
                key={column.key}
                className={isMobileViewport
                  ? (activeMobileColumn === column.key ? '' : 'hidden')
                  : ''}
                title={column.title}
                color={column.color}
                dotClassName={column.dotClassName}
                accentClassName={column.accentClassName}
                emptyMessage={column.emptyMessage}
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
