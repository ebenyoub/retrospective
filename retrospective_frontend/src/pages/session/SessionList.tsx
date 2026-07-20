import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { getApiErrorMessage, NETWORK_ERROR_MESSAGE } from '@/lib/apiError';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listSessions, updateSessionName, deleteSession } from './services/sessionApi';
import type { SessionListItem } from './types/session.types';
import { useToast } from '@/context/toast/useToast';
import Modal, { ModalHeader, ModalTitle, ModalContent, ModalFooter } from '@/components/ui/Modal';
import { SessionTable } from './components/SessionTable';
import { SessionGrid } from './components/SessionGrid';

const SessionList = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // États d'édition en ligne
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingSessionName, setEditingSessionName] = useState('');
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  // La page est derrière RequireAuth : le cookie authentifie l'appel.
  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const result = await listSessions();

        if (result.ok) {
          setSessions(result.data);
        } else {
          setErrorMessage(getApiErrorMessage(result.payload, "Impossible de charger les sessions."));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des sessions :', error);
        setErrorMessage(NETWORK_ERROR_MESSAGE);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleStartEdit = (session: SessionListItem) => {
    setEditingSessionId(String(session.id));
    setEditingSessionName(session.name || `Session #${session.id}`);
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingSessionName("");
  };

  const handleSaveName = async (sessionId: string) => {
    if (!editingSessionName.trim()) {
      addToast('error', 'Le nom de la session ne peut pas être vide.');
      return;
    }

    try {
      const result = await updateSessionName(sessionId, editingSessionName.trim());
      if (result.ok) {
        addToast('success', 'Nom de la session mis à jour.');
        setSessions((prev) =>
          prev.map((s) => (String(s.id) === sessionId ? { ...s, name: editingSessionName.trim() } : s))
        );
        handleCancelEdit();
      } else {
        addToast('error', getApiErrorMessage(result.payload, 'Impossible de renommer la session.'));
      }
    } catch (error) {
      console.error('Erreur lors du renommage :', error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    }
  };

  const handleRequestDelete = (sessionId: string) => {
    setDeletingSessionId(sessionId);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSessionId) return;

    try {
      const result = await deleteSession(deletingSessionId);
      if (result.ok) {
        addToast('success', 'La session a été supprimée avec succès.');
        setSessions((prev) => prev.filter((s) => String(s.id) !== deletingSessionId));
      } else {
        addToast('error', getApiErrorMessage(result.payload, 'Impossible de supprimer la session.'));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression :', error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    } finally {
      setDeletingSessionId(null);
    }
  };

  return (
    <Container className="flex flex-col gap-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-50">Mes sessions</h1>
        <Button size="sm" onClick={() => navigate('/session')}>
          Nouvelle session +
        </Button>
      </div>

      <Button
        unstyled
        onClick={() => navigate('/')}
        className="w-fit text-slate-400 hover:text-slate-200 transition-colors text-xs font-medium select-none cursor-pointer"
      >
        ← Retour à l'accueil
      </Button>

      {isLoading ? (
        <p className="text-sm text-slate-400">Chargement des sessions...</p>
      ) : errorMessage ? (
        <p className="rounded border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{errorMessage}</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-slate-500">Aucune session pour l'instant.</p>
      ) : (
        <>
          <SessionGrid
            sessions={sessions}
            editingSessionId={editingSessionId}
            editingSessionName={editingSessionName}
            onStartEdit={handleStartEdit}
            onCancelEdit={handleCancelEdit}
            onSessionNameChange={setEditingSessionName}
            onSaveName={handleSaveName}
            onRequestDelete={handleRequestDelete}
            onNavigateToSession={(id) => navigate(`/session/${id}`)}
          />

          <SessionTable
            sessions={sessions}
            editingSessionId={editingSessionId}
            editingSessionName={editingSessionName}
            onStartEdit={handleStartEdit}
            onCancelEdit={handleCancelEdit}
            onSessionNameChange={setEditingSessionName}
            onSaveName={handleSaveName}
            onRequestDelete={handleRequestDelete}
            onNavigateToSession={(id) => navigate(`/session/${id}`)}
          />
        </>
      )}

      <Modal
        isOpen={deletingSessionId !== null}
        onClose={() => setDeletingSessionId(null)}
      >
        <ModalHeader>
          <ModalTitle>Confirmer la suppression</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <p>
            Êtes-vous sûr de vouloir supprimer cette rétrospective ?
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Cette action est irréversible. Les cartes et les votes associés seront définitivement effacés de la base de données.
          </p>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDeletingSessionId(null)}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirmDelete}
          >
            Supprimer
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default SessionList;
