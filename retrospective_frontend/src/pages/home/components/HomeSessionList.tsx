import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Badge from '@/components/ui/Badge';
import { getApiErrorMessage, NETWORK_ERROR_MESSAGE } from '@/lib/apiError';
import { listSessions } from '../../session/services/sessionApi';
import Card, { CardTitle } from '@/components/ui/Card';
import type { SessionListItem } from '../../session/types/session.types';

const HomeSessionList = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const result = await listSessions();

        if (result.ok) {
          // On garde les 5 sessions les plus récentes pour la page d'accueil
          setSessions(result.data.slice(0, 5));
        } else {
          setErrorMessage(getApiErrorMessage(result.payload, 'Impossible de charger les sessions.'));
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

  return (
    <Card className="p-6 shadow-xl flex flex-col gap-5 min-h-[300px] bg-navy-surface/60 border-navy-border">
      <div className="flex items-center justify-between border-b border-navy-border pb-3">
        <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
          <span className="text-blue-400 select-none">🗓️</span> Mes sessions récentes
        </CardTitle>
        {sessions.length > 0 && (
          <button
            onClick={() => navigate('/sessions')}
            className="text-xs text-blue-400 font-semibold hover:text-blue-300 transition-colors cursor-pointer"
          >
            Voir tout
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-grow items-center justify-center py-12">
          <p className="text-sm text-slate-400 animate-pulse">Chargement de vos sessions...</p>
        </div>
      ) : errorMessage ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-200">{errorMessage}</p>
      ) : sessions.length === 0 ? (
        <div className="flex flex-grow flex-col items-center justify-center text-center p-6 border border-dashed border-navy-border rounded-xl bg-navy-mid/20 py-10">
          <p className="text-sm text-slate-500 mb-3">Aucune session pour le moment.</p>
          <button
            onClick={() => navigate('/session')}
            className="text-xs text-blue-400 font-bold hover:underline cursor-pointer"
          >
            Créer ma première session
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => navigate(`/session/${session.id}`)}
              className="group flex items-center justify-between gap-4 rounded-xl border border-navy-border bg-navy-mid/40 p-3.5 text-left hover:border-blue-500/50 hover:bg-navy-mid/80 transition-all duration-300 transform hover:translate-x-[2px] cursor-pointer"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-sm font-semibold text-slate-100 truncate group-hover:text-blue-400 transition-colors">
                  {session.name || `Session #${session.id}`}
                </span>
                <span className="text-[11px] text-slate-400">
                  {session.joinCode ? (
                    <>Code : <span className="font-mono text-slate-300">{session.joinCode}</span> · </>
                  ) : (
                    'Session clôturée · '
                  )}
                  {session.role === 'facilitator' ? 'Facilitateur' : 'Participant'} · {new Date(session.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge className="text-[10px] py-0 px-2 font-semibold">
                  {session.status === 'open' ? 'Active' : 'Close'}
                </Badge>
                <span className="text-slate-500 group-hover:text-blue-400 transition-colors transform group-hover:translate-x-[2px] duration-300 text-sm">
                  →
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
};

export default HomeSessionList;
