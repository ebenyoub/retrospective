import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import type { ParticipantSummary } from '../hooks/useSessionParticipants';

interface ParticipantsDrawerProps {
  participants: ParticipantSummary[];
  isOpen: boolean;
  isDesktop: boolean;
  onClose: () => void;
}

const statusLabel: Record<ParticipantSummary['status'], string> = {
  online: 'En ligne',
  offline: 'Hors ligne',
};

const statusClassName: Record<ParticipantSummary['status'], string> = {
  online: 'bg-green-400',
  offline: 'bg-slate-600',
};

const AVATAR_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];

const colorForName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const initialsForName = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

const ParticipantsDrawer = ({ participants, isOpen, isDesktop, onClose }: ParticipantsDrawerProps) => {
  const [isMounted, setIsMounted] = useState(isOpen);
  const onlineCount = participants.filter((participant) => participant.status === 'online').length;

  useEffect(() => {
    let timeoutId: number;

    if (isOpen) {
      timeoutId = window.setTimeout(() => setIsMounted(true), 0);
      return () => window.clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => setIsMounted(false), 220);
    return () => window.clearTimeout(timeoutId);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  const panelPosition = isDesktop
    ? 'right-0 top-0 h-full w-[280px] translate-x-0 rounded-none border-l'
    : 'inset-x-0 bottom-0 max-h-[70vh] translate-y-0 rounded-t-2xl border-t';
  const closedPanelPosition = isDesktop ? 'translate-x-full' : 'translate-y-full';

  return (
    <div
      className="fixed inset-0 z-50"
      role="presentation"
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Fermer le panneau Participants"
        onClick={onClose}
        className={`absolute inset-0 cursor-default bg-black/45 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="participants-drawer-title"
        className={`absolute flex flex-col overflow-hidden border-navy-border bg-navy-mid shadow-2xl transition-transform duration-200 ease-out ${panelPosition} ${
          isOpen ? '' : closedPanelPosition
        }`}
      >
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-navy-border px-4">
          <div className="min-w-0">
            <h2 id="participants-drawer-title" className="font-sans text-sm font-bold text-slate-50">
              Participants ({participants.length})
            </h2>
            <p className="mt-0.5 font-sans text-[11px] text-slate-500">
              {onlineCount} en ligne
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-navy-border-med bg-navy-surface text-slate-400 transition-colors hover:bg-navy-surface-med hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          {participants.length === 0 ? (
            <p className="px-3 py-4 font-sans text-sm text-slate-500">
              Aucun participant pour le moment.
            </p>
          ) : (
            <ul className="space-y-1">
              {participants.map((participant) => (
                <li key={participant.id}>
                  <div className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.03]">
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-sans text-xs font-bold text-white"
                      style={{ backgroundColor: colorForName(participant.displayName) }}
                      aria-hidden="true"
                    >
                      {initialsForName(participant.displayName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-sans text-sm font-medium text-slate-200">
                        {participant.displayName}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="font-sans text-[10px] font-semibold text-slate-500">
                          {participant.role === 'facilitator' ? 'Facilitateur' : 'Participant'}
                        </span>
                        {participant.role === 'facilitator' && (
                          <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-1.5 py-0.5 font-sans text-[10px] font-semibold leading-none text-amber-300">
                            Hôte
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${statusClassName[participant.status]}`} aria-hidden="true" />
                      <span className="font-sans text-[11px] text-slate-500">
                        {statusLabel[participant.status]}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
};

export default ParticipantsDrawer;
