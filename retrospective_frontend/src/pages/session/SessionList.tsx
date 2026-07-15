import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/auth/useAuth';
import { getApiErrorMessage, NETWORK_ERROR_MESSAGE } from '@/lib/apiError';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE_LABEL } from './sessionRole';
import { listSessions } from './services/sessionApi';
import type { SessionListItem } from './types/session.types';

const SessionList = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchSessions = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const result = await listSessions(token);

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
  }, [token]);

  return (
    <Container className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-50">Mes sessions</h1>

      {isLoading ? (
        <p className="text-sm text-slate-400">Chargement des sessions...</p>
      ) : errorMessage ? (
        <p className="rounded border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{errorMessage}</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-slate-500">Aucune session pour l'instant.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => navigate(`/session/${session.id}`)}
              className="flex flex-col items-start justify-between gap-3 bg-slate-800 border border-white/10 rounded-lg p-4 text-left hover:bg-slate-700 cursor-pointer sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-sm font-semibold text-slate-100">{session.name || `Session ${session.code}`}</span>
                <span className="text-xs text-slate-400">
                  Code : {session.code} · {ROLE_LABEL[session.role]} · {new Date(session.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <Badge className="shrink-0">{session.status}</Badge>
            </button>
          ))}
        </div>
      )}

      <Button unstyled onClick={() => navigate('/')} className="w-fit">
        Retour
      </Button>
    </Container>
  );
};

export default SessionList;
