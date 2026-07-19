import { useEffect, useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import type { ParticipantSummary } from '../types/participant.types';
import RetroFormatSelector from './RetroFormatSelector';
import type { WaitingScreenProps } from './types/WaitingScreen.types';

const pluralize = (count: number, singular: string, plural: string): string => (count <= 1 ? singular : plural);

// Durée des étapes : saisie inline réservée au facilitateur. La valeur est
// envoyée au backend, qui reste la source de vérité du timer.
const StepDurationEditor = ({ minutes, onSubmit }: { minutes: number; onSubmit: (minutes: number) => void }) => {
  const [value, setValue] = useState(String(minutes));

  // Se resynchronise si la valeur serveur change (polling).
  useEffect(() => {
    setValue(String(minutes));
  }, [minutes]);

  const commit = () => {
    const next = Number(value);

    if (!Number.isInteger(next) || next < 1 || next > 120 || next === minutes) {
      setValue(String(minutes));
      return;
    }

    onSubmit(next);
  };

  return (
    <span className="flex items-center gap-1.5">
      <input
        type="number"
        min={1}
        max={120}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
        }}
        aria-label="Durée des étapes en minutes"
        className="w-14 rounded-[8px] border border-navy-border-med bg-navy-surface px-2 py-1 text-right font-mono text-xs font-semibold text-slate-200 outline-none transition-colors focus:border-blue-400"
      />
      <span className="font-sans text-xs text-slate-400">min</span>
    </span>
  );
};

const ParticipantAvatar = ({ name, isOnline }: { name: string; isOnline: boolean }) => (
  <div className="relative flex-shrink-0 w-10 h-10">
    <Avatar name={name} colorSeed={name} size={40} fontSize={14} />
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
      <ParticipantAvatar name={participant.displayName} isOnline={isOnline} />
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
  stepDurationMinutes,
  onStart,
  onLeave,
  onSelectFormatPreset,
  onUpdateStepDuration,
  isDesktop,
}: WaitingScreenProps) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const onlineCount = participants.filter((p) => p.status === 'online').length;
  const self = participants.find((participant) => participant.id === selfParticipantId);
  const sessionUrl = `${window.location.origin}/session/${sessionId}`;
  const isFacilitator = role === 'facilitator';

  const summaryText = `${participants.length} ${pluralize(participants.length, 'participant', 'participants')} · ${onlineCount} en ligne`;
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

  // Seul le facilitateur peut modifier la durée ; les participants la voient.
  const durationRow = (
    <div className="flex items-center justify-between py-2 border-b border-navy-border">
      <span className="font-sans text-xs text-slate-500">Durée des étapes</span>
      {isFacilitator ? (
        <StepDurationEditor minutes={stepDurationMinutes} onSubmit={onUpdateStepDuration} />
      ) : (
        <span className="font-sans text-xs font-semibold text-slate-200">{stepDurationMinutes} min</span>
      )}
    </div>
  );

  const codeRow = (
    <div className="flex items-center justify-between py-2 border-b border-navy-border">
      <span className="font-sans text-xs text-slate-500">Code session</span>
      <span className="flex items-center gap-2">
        <span className="font-sans text-xs text-slate-200 font-mono font-semibold tracking-wider">{sessionCode}</span>
        <IconButton
          onClick={handleCopyCode}
          aria-label={codeCopied ? 'Code copié' : 'Copier le code de session'}
          variant="ghost"
          size="xs"
          className="h-auto w-auto rounded border-0 p-1"
        >
          {codeCopied ? <CheckIcon /> : <CopyIcon />}
        </IconButton>
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
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onStart}
          className="w-full bg-slate-50 text-navy hover:bg-slate-200 rounded-[12px] h-[44px] px-6 text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-mid"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>Lancer la rétro</span>
        </Button>
      ) : (
        <div className="text-center bg-navy-mid border border-navy-border rounded-[12px] p-4 animate-pulse">
          <span className="font-sans text-xs text-yellow-500 font-semibold">
            En attente du lancement par le facilitateur...
          </span>
        </div>
      )}
      <Button
        type="button"
        variant="danger"
        size="md"
        onClick={onLeave}
        className="w-full bg-[#7f1d1d] border border-[#991b1b] text-[#fca5a5] hover:bg-[#991b1b] rounded-[10px] h-[36px] px-4 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-mid"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M11 11l3-3-3-3M14 8H6M6 13H3a1 1 0 01-1-1V4a1 1 0 011-1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Quitter la session</span>
      </Button>
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
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopyLink}
                aria-label={linkCopied ? 'Lien copié' : 'Copier le lien d\'invitation'}
                className="h-auto flex-shrink-0 bg-navy-surface-med border border-navy-border-med text-slate-200 hover:bg-white/10 rounded-[8px] px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                {linkCopied ? 'Copié !' : 'Copier'}
              </Button>
            </div>

            <div className="mb-8">
              {codeRow}
              {formatRow}
              {durationRow}
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
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopyLink}
            aria-label={linkCopied ? 'Lien copié' : 'Copier le lien d\'invitation'}
            className="h-auto flex-shrink-0 bg-navy-surface-med border border-navy-border-med text-slate-200 hover:bg-white/10 rounded-[8px] px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            {linkCopied ? 'Copié !' : 'Copier'}
          </Button>
        </div>

        <div className="mb-6">
          {codeRow}
          {formatRow}
          {durationRow}
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

        </div>

        {actions}
      </div>
    </div>
  );
};
