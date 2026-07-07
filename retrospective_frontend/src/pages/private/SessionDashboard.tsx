import { useAuth } from '@/context/auth/useAuth';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Container from '@/components/ui/Container';
import RetroColumn from './components/RetroColumn';
import type { RetroCard } from './components/RetroCardItem';

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
  const navigate = useNavigate();
  const [cards, setCards] = useState<RetroCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <Container className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-50">
        Tableau de rétrospective{id ? ` — session ${id}` : ''}
      </h1>

      {isLoading ? (
        <p className="text-sm text-slate-400">Chargement des cartes...</p>
      ) : (
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
            />
          ))}
        </div>
      )}
    </Container>
  );
};

export default SessionDashboard;
