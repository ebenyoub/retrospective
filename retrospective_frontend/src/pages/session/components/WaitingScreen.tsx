import { useState } from 'react';
import type { ParticipantSummary } from '../hooks/useSessionParticipants';
import RetroFormatSelector from './RetroFormatSelector';

export const MAX_PARTICIPANTS = 25;

const pluralize = (count: number, singular: string, plural: string): string => (count <= 1 ? singular : plural);

interface WaitingScreenProps {
  sessionId: string | number;
  sessionName: string;
  sessionCode: string;
  participants: ParticipantSummary[];
  selfParticipantId: number | null;
  role: 'facilitator' | 'participant';
  formatName: string;
  onStart: () => void;
  onLeave: () => void;
  onSelectFormatPreset: (name: string, columns: string[]) => void;
  isDesktop: boolean;
}

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

const Avatar = ({ name, isOnline }: { name: string; isOnline: boolean }) => (
  <div className="relative flex-shrink-0 w-10 h-10">
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold select-none"
      style={{ background: colorForName(name) }}
    >
      {initialsForName(name)}
    </div>
    <span
      aria-hidden="true"
      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-navy-mid ${
        isOnline ? 'bg-green-500' : 'bg-slate-600'
      }`}
    />
  </div>
);

const ParticipantCard = ({ participant, isSelf }: { participant: ParticipantSummary; isSelf: boolean }) => {
  const isOnline = participant.status === 'online';

  return (
    <div className="cursor-default bg-navy-mid border border-white/10 rounded-[12px] px-4 py-3.5 flex items-center gap-3 shadow-[0_1px_0_rgba(255,255,255,0.04)]">
      <Avatar name={participant.displayName} isOnline={isOnline} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-sans text-sm font-medium text-slate-100 truncate m-0">
            {participant.displayName}
            {isSelf && <span className="text-slate-500 font-normal"> (vous)</span>}
          </p>
          {participant.role === 'facilitator' && (
            <span className="font-sans text-[10px] font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/25 rounded-full px-1.5 py-0.5 leading-none whitespace-nowrap">
              Facilitateur
            </span>
          )}
        </div>
        {/* Le statut n'est jamais porté par la seule couleur du point : le texte le dit explicitement. */}
        <p className={`font-sans text-xs mt-1 flex items-center gap-1.5 ${isOnline ? 'text-green-300' : 'text-slate-500'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-green-400' : 'bg-slate-600'}`} />
          {isOnline ? 'En ligne' : 'Hors ligne'}
        </p>
      </div>
    </div>
  );
};

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect x="5" y="5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 5V4a2 2 0 00-2-2H4a2 2 0 00-2 2v5a2 2 0 002 2h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const WaitingScreen = ({
  sessionId,
  sessionName,
  sessionCode,
  participants,
  selfParticipantId,
  role,
  formatName,
  onStart,
  onLeave,
  onSelectFormatPreset,
  isDesktop,
}: WaitingScreenProps) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const onlineCount = participants.filter((p) => p.status === 'online').length;
  const self = participants.find((participant) => participant.id === selfParticipantId);
  const sessionUrl = `${window.location.origin}/session/${sessionId}`;
  const isFacilitator = role === 'facilitator';

  const remainingSeats = MAX_PARTICIPANTS - participants.length;
  const capacityMessage =
    remainingSeats <= 0
      ? 'La session a atteint sa capacité maximale.'
      : `Vous pouvez inviter jusqu'à ${remainingSeats} ${pluralize(remainingSeats, 'participant supplémentaire', 'participants supplémentaires')}.`;

  const summaryText = `${participants.length} ${pluralize(participants.length, 'participant', 'participants')} sur ${MAX_PARTICIPANTS} · ${onlineCount} en ligne`;
  const statusLabel = isFacilitator ? 'Prêt à lancer' : 'En attente du facilitateur';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(sessionUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1800);
    } catch (err) {
      console.error('Échec de la copie du lien', err);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 1800);
    } catch (err) {
      console.error('Échec de la copie du code', err);
    }
  };

  const formatRow = (
    <div className="flex items-center justify-between py-2 border-b border-navy-border">
      <span className="font-sans text-xs text-slate-500">Format</span>
      <RetroFormatSelector
        formatName={formatName}
        isFacilitator={isFacilitator}
        onSelectPreset={onSelectFormatPreset}
      />
    </div>
  );

  const codeRow = (
    <div className="flex items-center justify-between py-2 border-b border-navy-border">
      <span className="font-sans text-xs text-slate-500">Code session</span>
      <span className="flex items-center gap-2">
        <span className="font-sans text-xs text-slate-200 font-mono font-semibold tracking-wider">{sessionCode}</span>
        <button
          type="button"
          onClick={handleCopyCode}
          aria-label={codeCopied ? 'Code copié' : 'Copier le code de session'}
          className="text-slate-500 hover:text-slate-200 cursor-pointer transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          {codeCopied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </span>
    </div>
  );

  const participantInfo = (
    <div className="rounded-[14px] border border-green-400/20 bg-green-400/10 p-4 mb-5">
      <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-green-300 mb-2">Votre accès</p>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-slate-400 mb-1">Pseudo</p>
          <p className="truncate text-base font-bold text-slate-50">{self?.displayName || 'Participant'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 mb-1">Code</p>
          <p className="font-mono text-4xl font-black leading-none tracking-wider text-slate-50">{sessionCode}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-navy-surface-med px-2.5 py-1 font-semibold text-slate-200">{statusLabel}</span>
        <span className="text-slate-400">{onlineCount} en ligne maintenant</span>
      </div>
    </div>
  );

  const participantsList = (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5">
      {participants.map((participant) => (
        <ParticipantCard key={participant.id} participant={participant} isSelf={participant.id === selfParticipantId} />
      ))}
    </div>
  );

  const actions = (
    <div className="flex flex-col gap-2.5">
      {isFacilitator ? (
        <button
          type="button"
          onClick={onStart}
          className="w-full bg-slate-50 text-navy hover:bg-slate-200 rounded-[12px] h-[44px] px-6 text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-mid"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>Lancer la rétro</span>
        </button>
      ) : (
        <div className="text-center bg-navy-mid border border-navy-border rounded-[12px] p-4 animate-pulse">
          <span className="font-sans text-xs text-yellow-500 font-semibold">
            En attente du lancement par le facilitateur...
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={onLeave}
        className="w-full bg-[#7f1d1d] border border-[#991b1b] text-[#fca5a5] hover:bg-[#991b1b] rounded-[10px] h-[36px] px-4 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-mid"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M11 11l3-3-3-3M14 8H6M6 13H3a1 1 0 01-1-1V4a1 1 0 011-1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Quitter la session</span>
      </button>
    </div>
  );

  if (isDesktop) {
    return (
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[400px] flex-shrink-0 border-r border-navy-border overflow-y-auto p-8 flex flex-col justify-between">
          <div>
            <h2 className="font-sans font-extrabold text-[28px] text-slate-50 mb-1 leading-tight tracking-tight">
              {sessionName || 'Chargement...'}
            </h2>
            {/* Résumé principal unique — remplace l'ancien badge + la ligne "Participants" redondants. */}
            <p className="font-sans text-sm text-slate-400 mb-6">{summaryText}</p>
            {participantInfo}

            <div className="bg-navy-mid border border-navy-border rounded-[12px] p-3 flex items-center justify-between gap-3 mb-7">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-slate-500 flex-shrink-0"><CopyIcon /></span>
                <span className="font-mono text-xs text-slate-400 truncate">{sessionUrl.replace(/^https?:\/\//, '')}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                aria-label={linkCopied ? 'Lien copié' : 'Copier le lien d\'invitation'}
                className="flex-shrink-0 bg-navy-surface-med border border-navy-border-med text-slate-200 hover:bg-white/10 rounded-[8px] px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                {linkCopied ? 'Copié !' : 'Copier'}
              </button>
            </div>

            <div className="mb-8">
              {codeRow}
              {formatRow}
            </div>
          </div>

          {actions}
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-5">
            <span className="font-sans text-[11px] font-bold text-slate-500 tracking-wider uppercase">Participants</span>
            <span className="font-mono text-[11px] text-slate-500 font-bold">{participants.length}</span>
          </div>
          {participantsList}
          <p className="mt-5 font-sans text-[11px] text-slate-600 select-none">{capacityMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col items-center">
      <div className="w-full max-w-[100%]">
        <div className="text-center mb-8">
          <h2 className="font-sans font-bold text-[22px] text-slate-50 mb-1 leading-tight tracking-tight">
            {sessionName || 'Chargement...'}
          </h2>
          <p className="font-sans text-[13px] text-slate-400 leading-normal">{summaryText}</p>
        </div>

        {participantInfo}

        <div className="bg-navy-mid border border-navy-border rounded-[12px] p-3 flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-slate-500 flex-shrink-0"><CopyIcon /></span>
            <span className="font-mono text-xs text-slate-400 truncate">{sessionUrl.replace(/^https?:\/\//, '')}</span>
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            aria-label={linkCopied ? 'Lien copié' : 'Copier le lien d\'invitation'}
            className="flex-shrink-0 bg-navy-surface-med border border-navy-border-med text-slate-200 hover:bg-white/10 rounded-[8px] px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            {linkCopied ? 'Copié !' : 'Copier'}
          </button>
        </div>

        <div className="mb-6">
          {codeRow}
          {formatRow}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-[11px] font-bold text-slate-500 tracking-wider uppercase">Participants</span>
            <span className="font-mono text-[11px] text-slate-500 font-bold">{participants.length}</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {participants.map((participant) => (
              <ParticipantCard key={participant.id} participant={participant} isSelf={participant.id === selfParticipantId} />
            ))}
          </div>
          <p className="mt-3 font-sans text-[11px] text-slate-600 select-none">{capacityMessage}</p>
        </div>

        {actions}
      </div>
    </div>
  );
};
