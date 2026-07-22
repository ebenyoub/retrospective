import { ArrowLeft, Check, Copy, MessageCircle, Users } from 'lucide-react';
import Button from '@/components/ui/Button';

import StepIndicator from './StepIndicator';
import ParticipantBadge from './ParticipantBadge';
import ProfileMenu from '@/components/ProfileMenu';
import { useAuth } from '@/context/auth/useAuth';
import { useSessionContext } from '../context/useSessionContext';
import type { SessionContextBarProps } from './types/SessionContextBar.types';

const SessionContextBar = ({
  isSessionCodeCopied,
  canRenameSelf = false,
  onBack,
  onCopySessionCode,
}: SessionContextBarProps) => {
  const context = useSessionContext();
  const { isAuthenticated, username } = useAuth();

  const sessionId = context.sessionId;
  const sessionName = context.details.sessionName;
  const sessionCode = context.details.sessionCode;
  const step = context.details.step;
  const participantCount = context.participants.filter(
    (participant) => participant.status === 'online'
  ).length;
  // Badge du participant (pseudo + menu) : absent pour le facilitateur, qui a
  // déjà son menu de compte.
  const selfDisplayName = context.identity.role === 'participant'
    ? (context.identity.guestIdentity?.displayName ?? (isAuthenticated ? username : null))
    : null;
  const onRenameSelf = context.identity.renameSelf;
  const onLeaveSession = context.handleLeaveSession;
  const onToggleParticipants = context.panels.toggleParticipantsDrawer;
  const onToggleDiscussion = context.panels.toggleDiscussionDrawer;
  const isParticipantsOpen = context.panels.isParticipantsDrawerOpen;
  const isDiscussionOpen = context.panels.isDiscussionDrawerOpen;

  const displayName = sessionName || `Session ${sessionId}`;

  return (
    <nav
      aria-label="Contexte de session"
      className="grid min-h-[52px] shrink-0 grid-cols-1 items-center gap-2 border-b border-navy-border bg-navy-mid px-3 py-2 md:h-14 md:min-h-14 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-stretch md:gap-2 md:px-5 md:py-0"
    >
      <div className="flex min-w-0 items-center gap-1.5 md:h-full" aria-label="Fil de contexte">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          aria-label="Retour"
          className="inline-flex h-[30px] shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-navy-border bg-transparent px-2.5 font-sans text-xs font-medium leading-none text-slate-400 transition-colors select-none hover:bg-navy-surface hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-mid"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span className="hidden sm:inline">Retour</span>
        </Button>
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
          <Button
            type="button"
            variant="secondary"
            size="sm"
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
          </Button>
        )}
        <Button
          type="button"
          variant={isParticipantsOpen ? 'secondary' : 'ghost'}
          size="sm"
          onClick={onToggleParticipants}
          aria-label="Participants"
          aria-expanded={isParticipantsOpen}
          className={`inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 font-sans text-xs font-medium leading-none transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-mid ${
            isParticipantsOpen
              ? 'border-navy-border-med bg-navy-surface-med text-slate-200'
              : 'border-transparent bg-transparent text-slate-400 hover:border-navy-border-med hover:bg-navy-surface-med hover:text-slate-200'
          }`}
        >
          <Users size={14} aria-hidden="true" />
          <span className="hidden sm:inline">Participants</span>
          {participantCount > 0 && (
            <span className="rounded-full bg-green-figma/20 px-1.5 font-mono text-[10px] text-green-figma">
              {participantCount}
            </span>
          )}
        </Button>
        <Button
          type="button"
          variant={isDiscussionOpen ? 'secondary' : 'ghost'}
          size="sm"
          onClick={onToggleDiscussion}
          aria-label="Discussion"
          aria-expanded={isDiscussionOpen}
          className={`inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 font-sans text-xs font-medium leading-none transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-mid ${
            isDiscussionOpen
              ? 'border-navy-border-med bg-navy-surface-med text-slate-200'
              : 'border-transparent bg-transparent text-slate-400 hover:border-navy-border-med hover:bg-navy-surface-med hover:text-slate-200'
          }`}
        >
          <MessageCircle size={14} aria-hidden="true" />
          <span className="hidden sm:inline">Discussion</span>
        </Button>
        {selfDisplayName && onRenameSelf && onLeaveSession && (
          <div className="border-l border-navy-border-med pl-1.5 h-6 flex items-center shrink-0">
            <ParticipantBadge
              displayName={selfDisplayName}
              canRename={canRenameSelf}
              isReadOnly={context.isReadOnly}
              onRename={onRenameSelf}
              onLeave={onLeaveSession}
            />
          </div>
        )}
        {isAuthenticated && (
          <div className="border-l border-navy-border-med pl-1.5 h-6 flex items-center shrink-0">
            <ProfileMenu />
          </div>
        )}
      </div>
    </nav>
  );
};

export default SessionContextBar;
