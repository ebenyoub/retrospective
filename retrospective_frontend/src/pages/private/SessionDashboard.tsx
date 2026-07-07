import { useAuth } from '@/context/auth/useAuth';
import { useToast } from '@/context/toast/useToast';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import RetroColumn from './components/RetroColumn';
import type { RetroCard } from './components/RetroCardItem';

type DashboardView = 'board' | 'results';

const COLUMNS: {
  key: RetroCard['columnType'];
  title: string;
  dotClassName: string;
  accentClassName: string;
  emptyMessage: string;
}[] = [
  {
    key: 'start',
    title: 'Start',
    dotClassName: 'bg-yellow-500',
    accentClassName: 'border-l-yellow-500',
    emptyMessage: "Aucune idée à démarrer pour l'instant.",
  },
  {
    key: 'stop',
    title: 'Stop',
    dotClassName: 'bg-red-500',
    accentClassName: 'border-l-red-500',
    emptyMessage: 'Aucun point bloquant pour l\'instant.',
  },
  {
    key: 'continue',
    title: 'Continue',
    dotClassName: 'bg-green-500',
    accentClassName: 'border-l-green-500',
    emptyMessage: 'Aucune carte pour l\'instant.',
  },
];

const SessionDashboard = () => {
  const { id } = useParams();
  const { isAuthenticated, token } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [cards, setCards] = useState<RetroCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<DashboardView>('board');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const fetchCards = useCallback(async () => {
    if (!id || !token) return;

    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/session/${id}/cards`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCards(data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cartes :', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleAddCard = async (columnType: RetroCard['columnType'], content: string) => {
    if (!id || !token) return;

    try {
      await fetch(`http://localhost:8000/session/${id}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, columnType }),
      });

      await fetchCards();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la carte :", error);
    }
  };

  const handleVote = async (cardId: number) => {
    if (!id || !token) return;

    try {
      const response = await fetch(`http://localhost:8000/session/${id}/cards/${cardId}/vote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchCards();
      } else {
        addToast('error', data.message || 'Impossible d\'enregistrer le vote.');
      }
    } catch (error) {
      console.error('Erreur lors du vote :', error);
      addToast('error', 'Erreur de connexion au serveur.');
    }
  };

  const resultsCards = [...cards].sort((a, b) => b.votesCount - a.votesCount);

  return (
    <Container className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-50">
          Tableau de rétrospective{id ? ` — session ${id}` : ''}
        </h1>
        <Button onClick={() => setView(view === 'board' ? 'results' : 'board')}>
          {view === 'board' ? 'Voir les résultats' : 'Voir le tableau'}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-400">Chargement des cartes...</p>
      ) : view === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((column) => (
            <RetroColumn
              key={column.key}
              title={column.title}
              dotClassName={column.dotClassName}
              accentClassName={column.accentClassName}
              emptyMessage={column.emptyMessage}
              cards={cards.filter((card) => card.columnType === column.key)}
              onAddCard={(content) => handleAddCard(column.key, content)}
              onVote={handleVote}
            />
          ))}
        </div>
      ) : (
        <RetroColumn
          title="Résultats"
          dotClassName="bg-slate-400"
          accentClassName="border-l-slate-400"
          emptyMessage="Aucune carte pour l'instant."
          cards={resultsCards}
          onVote={handleVote}
        />
      )}
    </Container>
  );
};

export default SessionDashboard;
