import Badge from '@/components/ui/Badge';
import { ROLE_LABEL } from '../sessionRole';
import type { SessionTableProps } from './types/SessionTable.types';

export const SessionTable = ({
  sessions,
  editingSessionId,
  editingSessionName,
  onStartEdit,
  onCancelEdit,
  onSessionNameChange,
  onSaveName,
  onRequestDelete,
  onNavigateToSession,
}: SessionTableProps) => {
  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-navy-border bg-navy-surface/40 backdrop-blur-md">
      <table className="w-full border-collapse text-left text-sm text-slate-200">
        <thead>
          <tr className="border-b border-navy-border bg-navy-mid/60 text-xs font-semibold uppercase tracking-wider text-slate-400 select-none">
            <th className="px-6 py-4">Nom de la rétrospective</th>
            <th className="px-6 py-4">Code</th>
            <th className="px-6 py-4">Rôle</th>
            <th className="px-6 py-4">Création</th>
            <th className="px-6 py-4">Statut</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-border">
          {sessions.map((session) => (
            <tr key={session.id} className="hover:bg-navy-mid/20 transition-colors group">
              <td className="px-6 py-4 font-medium text-slate-100 max-w-[340px]">
                {editingSessionId === String(session.id) ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingSessionName}
                      onChange={(e) => onSessionNameChange(e.target.value)}
                      className="bg-navy-mid border border-navy-border-med text-slate-100 text-xs rounded-lg px-2.5 py-1.5 flex-1 focus:outline-none focus:border-blue-500 min-w-0"
                      maxLength={50}
                      autoFocus
                    />
                    <button
                      onClick={() => onSaveName(String(session.id))}
                      className="text-xs font-bold text-green-400 hover:text-green-300 transition-colors cursor-pointer shrink-0"
                    >
                      Sauver
                    </button>
                    <button
                      onClick={onCancelEdit}
                      className="text-xs font-bold text-slate-400 hover:text-slate-300 transition-colors cursor-pointer shrink-0"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <span
                    onClick={() => onNavigateToSession(session.id)}
                    className="hover:text-blue-400 cursor-pointer transition-colors block truncate"
                  >
                    {session.name || `Session #${session.id}`}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 font-mono text-xs text-slate-300 select-all">
                {session.joinCode ?? <span className="text-slate-500 italic">Clôturée</span>}
              </td>
              <td className="px-6 py-4 text-xs text-slate-400">
                {ROLE_LABEL[session.role]}
              </td>
              <td className="px-6 py-4 text-xs text-slate-400">
                {new Date(session.createdAt).toLocaleDateString('fr-FR')}
              </td>
              <td className="px-6 py-4">
                <Badge
                  variant={session.status === 'open' ? 'success' : 'default'}
                  className="uppercase text-[9px] py-0.5 px-2 font-semibold"
                >
                  {session.status === 'open' ? 'Active' : 'Close'}
                </Badge>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  {session.role === 'facilitator' && editingSessionId !== String(session.id) && (
                    <>
                      <button
                        onClick={() => onStartEdit(session)}
                        className="text-xs text-blue-400 hover:text-blue-300 border border-transparent hover:border-blue-500/30 rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
                        title="Modifier le nom de la session"
                      >
                        Renommer
                      </button>
                      <button
                        onClick={() => onRequestDelete(String(session.id))}
                        className="text-xs text-red-400 hover:text-red-300 border border-transparent hover:border-red-500/30 rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
                        title="Supprimer la session"
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                  {editingSessionId !== String(session.id) && (
                    <button
                      onClick={() => onNavigateToSession(session.id)}
                      className="text-xs font-semibold bg-blue-600/90 hover:bg-blue-600 text-white rounded-lg px-3 py-1.5 transition-all transform group-hover:translate-x-1 cursor-pointer"
                    >
                      Rejoindre →
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
