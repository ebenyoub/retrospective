import { useAuth } from '@/context/auth/useAuth';
import { useToast } from '@/context/toast/useToast';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
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
  const { isAuthenticated, token, userId } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [cards, setCards] = useState<RetroCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<SessionRole | null>(null);
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

  useEffect(() => {
    if (!id || !token) return;

    const fetchRole = async () => {
      try {
        const response = await fetch('http://localhost:8000/session', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const currentSession = (data.data as { id: number; role: SessionRole }[]).find(
            (session) => String(session.id) === id
          );
          setRole(currentSession?.role ?? null);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du rôle :', error);
      }
    };

    fetchRole();
  }, [id, token]);

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

  const handleDeleteCard = async (cardId: number) => {
    if (!id || !token) return;

    try {
      const response = await fetch(`http://localhost:8000/session/${id}/cards/${cardId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchCards();
      } else {
        addToast('error', data.message || 'Impossible de supprimer la carte.');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la carte :', error);
      addToast('error', 'Erreur de connexion au serveur.');
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

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchCards();
        return true;
      }

      addToast('error', data.message || 'Impossible de modifier la carte.');
      return false;
    } catch (error) {
      console.error('Erreur lors de la modification de la carte :', error);
      addToast('error', 'Erreur de connexion au serveur.');
      return false;
    }
  };

  const resultsCards = [...cards].sort((a, b) => b.votesCount - a.votesCount);

  return (
    <Container className="flex flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-slate-50 break-words">
              Tableau de rétrospective{id ? ` — session ${id}` : ''}
            </h1>
            {role && <Badge>{ROLE_LABEL[role]}</Badge>}
          </div>
          <Button onClick={() => setView(view === 'board' ? 'results' : 'board')} className="w-full sm:w-fit">
            {view === 'board' ? 'Voir les résultats' : 'Voir le tableau'}
          </Button>
        </div>

      {isLoading ? (
        <p className="text-sm text-slate-400">Chargement des cartes...</p>
      ) : view === 'board' ? (
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
              onAddCard={(content) => handleAddCard(column.key, content)}
              onVote={handleVote}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
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
          currentUserId={userId}
          onVote={handleVote}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
        />
      )}
    </Container>
  );
};

export default SessionDashboard;
