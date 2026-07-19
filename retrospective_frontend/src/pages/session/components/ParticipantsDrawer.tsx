import { X } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Drawer from '@/components/ui/Drawer';
import IconButton from '@/components/ui/IconButton';

import type { ParticipantSummary } from '../types/participant.types';
import type { ParticipantsDrawerProps } from './types/ParticipantsDrawer.types';

const statusLabel: Record<ParticipantSummary['status'], string> = {
  online: 'En ligne',
  offline: 'Hors ligne',
};

const statusClassName: Record<ParticipantSummary['status'], string> = {
  online: 'bg-green-400',
  offline: 'bg-slate-600',
};

const ParticipantsDrawer = ({ participants, isOpen, isDesktop, onClose }: ParticipantsDrawerProps) => {
  const onlineCount = participants.filter((participant) => participant.status === 'online').length;

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      labelledBy="participants-drawer-title"
      overlayLabel="Fermer le panneau Participants"
      side={isDesktop ? 'right' : 'bottom'}
      size="sm"
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
        <IconButton onClick={onClose} aria-label="Fermer">
          <X size={16} aria-hidden="true" />
        </IconButton>
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
                  <Avatar
                    name={participant.displayName}
                    colorSeed={participant.displayName}
                    size={32}
                    fontSize={12}
                  />
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
    </Drawer>
  );
};

export default ParticipantsDrawer;
