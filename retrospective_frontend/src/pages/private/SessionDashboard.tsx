import { useAuth } from '@/context/auth/useAuth';
import { useToast } from '@/context/toast/useToast';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getApiErrorMessage, isApiSuccess, NETWORK_ERROR_MESSAGE, readJsonSafely } from '@/lib/apiError';
import RetroColumn from './components/RetroColumn';
import type { RetroCard } from './components/RetroCardItem';
import { ROLE_LABEL, type SessionRole } from './sessionRole';

type DashboardView = 'board' | 'results';

const COLUMNS: {
  key: RetroCard['columnType'];
  title: string;
  dotClassName: string;
  accentClassName: string;
  emptyMessage: string;
}[] = [
  {
    key: 'continue',
    title: 'Positif',
    dotClassName: 'bg-green-500',
    accentClassName: 'border-l-green-500',
    emptyMessage: "Aucun retour positif pour l'instant.",
  },
  {
    key: 'stop',
    title: 'Négatif',
    dotClassName: 'bg-red-500',
    accentClassName: 'border-l-red-500',
    emptyMessage: "Aucun retour négatif pour l'instant.",
  },
  {
    key: 'start',
    title: 'Idées',
    dotClassName: 'bg-yellow-500',
    accentClassName: 'border-l-yellow-500',
    emptyMessage: "Aucune idée pour l'instant.",
  },
];

const SessionDashboard = () => {
  const { id } = useParams();
  const { isAuthenticated, token, userId } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [cards, setCards] = useState<RetroCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<SessionRole | null>(null);
  const [sessionName, setSessionName] = useState<string>('');
  const [step, setStep] = useState<'waiting' | 'writing' | 'voting' | 'results'>('waiting');
  const [view, setView] = useState<DashboardView>('board');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const fetchCards = useCallback(async () => {
    if (!id || !token) return;

    try {
      const response = await fetch(`http://localhost:8000/session/${id}/cards`, {
        headers: { Authorization: `Bearer ${token}` },
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
  }, [addToast, id, token]);

  const fetchSessionDetails = useCallback(async () => {
    if (!id || !token) return;

    try {
      const response = await fetch(`http://localhost:8000/session/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await readJsonSafely(response);

      if (response.ok && isApiSuccess<any>(data)) {
        setSessionName(data.data.name);
        setStep(data.data.step || 'writing');
        setRole(data.data.ownerId === userId ? 'facilitator' : 'participant');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la session :', error);
    }
  }, [id, token, userId]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchSessionDetails(), fetchCards()]).finally(() => setIsLoading(false));

    const interval = setInterval(() => {
      fetchSessionDetails();
      fetchCards();
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchSessionDetails, fetchCards]);

  const handleAddCard = async (columnType: RetroCard['columnType'], content: string) => {
    if (!id || !token) return;

    try {
      const response = await fetch(`http://localhost:8000/session/${id}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
    if (!id || !token) return;

    try {
      const response = await fetch(`http://localhost:8000/session/${id}/cards/${cardId}/vote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
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
    if (!id || !token) return;

    try {
      const response = await fetch(`http://localhost:8000/session/${id}/cards/${cardId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
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
    if (!id || !token) return false;

    try {
      const response = await fetch(`http://localhost:8000/session/${id}/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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

  const handleTransitionStep = async (nextStep: 'waiting' | 'writing' | 'voting' | 'results') => {
    if (!id || !token) return;

    try {
      const response = await fetch(`http://localhost:8000/session/${id}/step`, {
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

  if (isLoading) {
    return (
      <Container className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-slate-400">Chargement de la session...</p>
      </Container>
    );
  }

  if (step === 'waiting') {
    return (
      <Container className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-6">
        <div className="bg-slate-800 border border-white/10 p-8 rounded-xl max-w-md w-full shadow-lg">
          <h2 className="text-2xl font-bold text-slate-50 mb-2">Salle d'attente</h2>
          <p className="text-sm text-slate-400 mb-6">
            Partagez le code ou l'accès à cette session avec vos collaborateurs.
          </p>
          <div className="flex flex-col gap-4">
            <div className="bg-slate-900 border border-white/5 p-4 rounded-lg">
              <span className="text-xs text-slate-500 uppercase block mb-1">Session</span>
              <span className="text-xl font-extrabold text-green-500 tracking-wider block">{sessionName || '...'}</span>
              <span className="text-xs text-slate-500 uppercase block mt-2 mb-1">Code de session</span>
              <span className="text-3xl font-extrabold text-white font-mono tracking-widest">
                {id ? cards[0]?.sessionId || id : '...'}
              </span>
            </div>
            {role === 'facilitator' ? (
              <Button onClick={() => handleTransitionStep('writing')} className="w-full mt-4 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold">
                Démarrer la session →
              </Button>
            ) : (
              <p className="text-sm text-yellow-500 font-medium animate-pulse mt-4">
                En attente du lancement par le facilitateur...
              </p>
            )}
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between w-full bg-slate-800/50 border border-white/10 p-4 rounded-xl gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-slate-50 break-words">
            {sessionName ? sessionName : `Tableau de rétrospective — session ${id}`}
          </h1>
          {role && <Badge>{ROLE_LABEL[role]}</Badge>}
          <span className="text-sm font-semibold text-green-500 uppercase bg-green-500/10 px-2.5 py-1 rounded">
            {step === 'writing' ? 'Écriture' : step === 'voting' ? 'Vote' : 'Résultats'}
          </span>
        </div>
        {role === 'facilitator' && (
          <div className="flex items-center gap-2">
            {step === 'writing' && (
              <Button onClick={() => handleTransitionStep('voting')} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2">
                Passer au vote →
              </Button>
            )}
            {step === 'voting' && (
              <Button onClick={() => handleTransitionStep('results')} className="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2">
                Voir les résultats →
              </Button>
            )}
            {step === 'results' && (
              <Button onClick={() => navigate('/profile')} className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold px-4 py-2">
                Quitter la session
              </Button>
            )}
          </div>
        )}
      </div>

      {step === 'results' ? (
        <RetroColumn
          title="Résultats"
          dotClassName="bg-slate-400"
          accentClassName="border-l-slate-400"
          emptyMessage="Aucune carte pour l'instant."
          cards={resultsCards}
          currentUserId={userId}
          onVote={handleVote}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
          canVote={false}
          canEdit={false}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {COLUMNS.map((column) => (
            <RetroColumn
              key={column.key}
              title={column.title}
              dotClassName={column.dotClassName}
              accentClassName={column.accentClassName}
              emptyMessage={column.emptyMessage}
              cards={cards.filter((card) => card.columnType === column.key)}
              currentUserId={userId}
              onAddCard={step === 'writing' ? (content) => handleAddCard(column.key, content) : undefined}
              onVote={handleVote}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
              canVote={step === 'voting'}
              canEdit={step === 'writing'}
            />
          ))}
        </div>
      )}
    </Container>
  );
};

export default SessionDashboard;
