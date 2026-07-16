import Badge from '@/components/ui/Badge';
import Card, { CardContent, CardFooter } from '@/components/ui/Card';
import { ROLE_LABEL } from '../sessionRole';
import type { SessionListItem } from '../../types/session.types';

interface SessionGridProps {
  sessions: SessionListItem[];
  editingSessionId: string | null;
  editingSessionName: string;
  onStartEdit: (session: SessionListItem) => void;
  onCancelEdit: () => void;
  onSessionNameChange: (name: string) => void;
  onSaveName: (sessionId: string) => void;
  onRequestDelete: (sessionId: string) => void;
  onNavigateToSession: (sessionId: number) => void;
}

export const SessionGrid = ({
  sessions,
  editingSessionId,
  editingSessionName,
  onStartEdit,
  onCancelEdit,
  onSessionNameChange,
  onSaveName,
  onRequestDelete,
  onNavigateToSession,
}: SessionGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
      {sessions.map((session) => (
        <Card key={session.id} className="flex flex-col h-full justify-between">
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="flex justify-between items-start gap-2">
              {editingSessionId === String(session.id) ? (
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    value={editingSessionName}
                    onChange={(e) => onSessionNameChange(e.target.value)}
                    className="bg-navy-mid border border-navy-border-med text-slate-100 text-xs rounded-lg px-2.5 py-1.5 flex-1 focus:outline-none focus:border-blue-500"
                    maxLength={50}
                    autoFocus
                  />
                  <button
                    onClick={() => onSaveName(String(session.id))}
                    className="text-xs font-bold text-green-400 hover:text-green-300 transition-colors cursor-pointer shrink-0"
                  >
                    OK
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="text-xs font-bold text-slate-400 hover:text-slate-300 transition-colors cursor-pointer shrink-0"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <div className="flex flex-col min-w-0">
                  <span
                    onClick={() => onNavigateToSession(session.id)}
                    className="text-sm font-semibold text-slate-100 truncate hover:text-blue-400 cursor-pointer transition-colors"
                  >
                    {session.name || `Session ${session.code}`}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Code : <span className="font-mono text-slate-300">{session.code}</span> · {ROLE_LABEL[session.role]}
                  </span>
                </div>
              )}
              {editingSessionId !== String(session.id) && (
                <Badge
                  variant={session.status === 'open' ? 'success' : 'default'}
                  className="shrink-0 text-[10px]"
                >
                  {session.status === 'open' ? 'Active' : 'Close'}
                </Badge>
              )}
            </div>

            <div className="text-[10px] text-slate-500">
              Créée le {new Date(session.createdAt).toLocaleDateString('fr-FR')}
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-end gap-2 border-t border-white/5 p-4 pt-2.5">
            {session.role === 'facilitator' && editingSessionId !== String(session.id) && (
              <>
                <button
                  onClick={() => onStartEdit(session)}
                  className="text-xs text-blue-400 hover:underline px-2 py-1 cursor-pointer"
                >
                  Renommer
                </button>
                <button
                  onClick={() => onRequestDelete(String(session.id))}
                  className="text-xs text-red-400 hover:underline px-2 py-1 cursor-pointer"
                >
                  Supprimer
                </button>
              </>
            )}
            <button
              onClick={() => onNavigateToSession(session.id)}
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
            >
              Rejoindre →
            </button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
