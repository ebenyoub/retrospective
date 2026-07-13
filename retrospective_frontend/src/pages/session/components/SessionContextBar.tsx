import { ArrowLeft, Check, Copy, MessageCircle, Users } from 'lucide-react';

import { type SessionStep } from '../sessionStep';
import StepIndicator from './StepIndicator';

interface SessionContextBarProps {
  sessionName: string;
  sessionId: string;
  sessionCode: string;
  step: SessionStep;
  participantCount: number;
  isSessionCodeCopied: boolean;
  onBack: () => void | Promise<void>;
  onCopySessionCode: () => void;
  onToggleParticipants?: () => void;
  onToggleDiscussion?: () => void;
}

const SessionContextBar = ({
  sessionName,
  sessionId,
  sessionCode,
  step,
  participantCount,
  isSessionCodeCopied,
  onBack,
  onCopySessionCode,
  onToggleParticipants,
  onToggleDiscussion,
}: SessionContextBarProps) => {
  const displayName = sessionName || `Session ${sessionId}`;

  return (
    <nav
      aria-label="Contexte de session"
      className="grid min-h-[52px] flex-shrink-0 grid-cols-1 items-center gap-2 border-b border-navy-border bg-navy-mid px-3 py-2 md:h-14 md:min-h-14 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-stretch md:gap-2 md:px-5 md:py-0"
    >
      <div className="flex min-w-0 items-center gap-1.5 md:h-full" aria-label="Fil de contexte">
        <button
          type="button"
          onClick={onBack}
          aria-label="Retour"
          className="inline-flex h-[30px] shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-navy-border bg-transparent px-2.5 font-sans text-xs font-medium leading-none text-slate-400 transition-colors select-none hover:bg-navy-surface hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-mid"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span className="hidden sm:inline">Retour</span>
        </button>
        <span className="inline-flex h-[30px] shrink-0 items-center font-sans text-[15px] font-extrabold leading-none text-green-figma">
          Range ta chambre
        </span>
        <span className="hidden h-[30px] shrink-0 items-center font-sans text-[13px] leading-none text-slate-700 sm:inline-flex" aria-hidden="true">/</span>
        <span className="inline-flex h-[30px] min-w-0 max-w-[120px] items-center truncate font-sans text-[13px] font-semibold leading-none text-slate-300 md:max-w-[220px]">
          {displayName}
        </span>
      </div>

      <div className="hidden h-full items-center justify-center md:flex">
        <StepIndicator currentStep={step} />
      </div>

      <div className="flex min-w-0 items-center justify-start gap-1.5 md:h-full md:justify-end" aria-label="Accès rapides de session">
        {sessionCode && (
          <button
            type="button"
            onClick={onCopySessionCode}
            aria-label={isSessionCodeCopied ? 'Code copié' : 'Copier le code de session'}
            className={`flex h-[30px] items-center gap-1.5 rounded-lg border px-3 font-mono text-[11px] leading-none transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-mid ${
              isSessionCodeCopied
                ? 'bg-green-figma/10 border-green-figma/40 text-green-figma'
                : 'bg-navy-surface border-navy-border-med text-slate-300 hover:bg-navy-surface-med hover:text-slate-100'
            }`}
          >
            {isSessionCodeCopied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
            <span>{isSessionCodeCopied ? 'Copié !' : sessionCode}</span>
          </button>
        )}
        <button
          type="button"
          onClick={onToggleParticipants}
          aria-label="Participants"
          className="inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg border border-transparent bg-transparent px-2.5 font-sans text-xs font-medium leading-none text-slate-400 transition-colors select-none hover:border-navy-border-med hover:bg-navy-surface-med hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-mid"
        >
          <Users size={14} aria-hidden="true" />
          <span className="hidden sm:inline">Participants</span>
          {participantCount > 0 && (
            <span className="rounded-full bg-green-figma/20 px-1.5 font-mono text-[10px] text-green-figma">
              {participantCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onToggleDiscussion}
          aria-label="Discussion"
          className="inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg border border-transparent bg-transparent px-2.5 font-sans text-xs font-medium leading-none text-slate-400 transition-colors select-none hover:border-navy-border-med hover:bg-navy-surface-med hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-mid"
        >
          <MessageCircle size={14} aria-hidden="true" />
          <span className="hidden sm:inline">Discussion</span>
        </button>
      </div>
    </nav>
  );
};

export default SessionContextBar;
