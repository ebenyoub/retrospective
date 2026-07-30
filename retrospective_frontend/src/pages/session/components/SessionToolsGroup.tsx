import { Check, Copy, MessageCircle, Users, Volume2, VolumeX } from 'lucide-react';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import { useSessionContext } from '../context/useSessionContext';
import type { SessionToolsGroupProps } from './types/SessionToolsGroup.types';

// Groupe "code de session / Participants / Discussion / Son", partagé entre
// SessionNavigationBar (en dessous de xl, sa propre ligne) et SessionActionBar
// (à partir de xl, fusionné sur la ligne d'actions) — une seule définition,
// jamais deux instances montées en même temps (le parent choisit lequel
// l'affiche selon la largeur réelle, pas juste via CSS).
const SessionToolsGroup = ({ isSessionCodeCopied, onCopySessionCode }: SessionToolsGroupProps) => {
  const context = useSessionContext();
  const step = context.details.step;
  const sessionCode = context.details.sessionCode;
  const participantCount = context.participants.filter(
    (participant) => participant.status === 'online'
  ).length;
  const onToggleParticipants = context.panels.toggleParticipantsDrawer;
  const onToggleDiscussion = context.panels.toggleDiscussionDrawer;
  const isParticipantsOpen = context.panels.isParticipantsDrawerOpen;
  const isDiscussionOpen = context.panels.isDiscussionDrawerOpen;
  const isDiscussionBlinking = context.isDiscussionBlinking;
  const clearDiscussionBlinking = context.clearDiscussionBlinking;
  const isSoundEnabled = context.isSoundEnabled;
  const onToggleSound = context.toggleSound;
  // En salle d'attente, la liste des participants et le code de session sont
  // déjà affichés en permanence dans le panneau latéral (WaitingScreen) :
  // les répéter dans la navbar n'apporte rien, sur cette seule étape.
  const isWaiting = step === 'waiting';

  return (
    <div className="flex min-w-0 shrink-0 items-center gap-1.5 overflow-x-auto" aria-label="Accès rapides de session">
      {sessionCode && !isWaiting && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCopySessionCode}
          aria-label={isSessionCodeCopied ? 'Code copié' : 'Copier le code de session'}
          className={`flex h-[30px] shrink-0 items-center gap-1.5 rounded-lg border px-3 font-mono text-[11px] leading-none transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-mid ${
            isSessionCodeCopied
              ? 'bg-green-figma/10 border-green-figma/40 text-green-figma'
              : 'bg-navy-surface border-navy-border-med text-slate-300 hover:bg-navy-surface-med hover:text-slate-100'
          }`}
        >
          {isSessionCodeCopied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
          <span>{isSessionCodeCopied ? 'Copié !' : sessionCode}</span>
        </Button>
      )}
      {!isWaiting && (
        <Button
          type="button"
          variant={isParticipantsOpen ? 'secondary' : 'ghost'}
          size="sm"
          onClick={onToggleParticipants}
          aria-label="Participants"
          aria-expanded={isParticipantsOpen}
          className={`inline-flex h-[30px] shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 font-sans text-xs font-medium leading-none transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-mid ${
            isParticipantsOpen
              ? 'border-navy-border-med bg-navy-surface-med text-slate-200'
              : 'border-transparent bg-transparent text-slate-400 hover:border-navy-border-med hover:bg-navy-surface-med hover:text-slate-200'
          }`}
        >
          <Users size={14} aria-hidden="true" />
          <span className="hidden min-[1152px]:inline">Participants</span>
          {participantCount > 0 && (
            <span className="rounded-full bg-green-figma/20 px-1.5 font-mono text-[10px] text-green-figma">
              {participantCount}
            </span>
          )}
        </Button>
      )}
      <Button
        type="button"
        variant={isDiscussionOpen ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => {
          onToggleDiscussion();
          clearDiscussionBlinking();
        }}
        aria-label="Discussion"
        aria-expanded={isDiscussionOpen}
        className={`inline-flex h-[30px] shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 font-sans text-xs font-medium leading-none transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-mid ${
          isDiscussionOpen
            ? 'border-navy-border-med bg-navy-surface-med text-slate-200'
            : 'border-transparent bg-transparent text-slate-400 hover:border-navy-border-med hover:bg-navy-surface-med hover:text-slate-200'
        } ${isDiscussionBlinking ? 'animate-pulse border-green-figma/50 bg-green-figma/10 text-green-figma' : ''}`}
      >
        <MessageCircle size={14} aria-hidden="true" />
        <span className="hidden min-[1152px]:inline">Discussion</span>
      </Button>
      <IconButton
        onClick={onToggleSound}
        aria-label={isSoundEnabled ? 'Désactiver le son' : 'Activer le son'}
        aria-pressed={isSoundEnabled}
        variant="ghost"
        size="sm"
        className="inline-flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-transparent text-slate-400 transition-colors hover:border-navy-border-med hover:bg-navy-surface-med hover:text-slate-200"
      >
        {isSoundEnabled ? <Volume2 size={14} aria-hidden="true" /> : <VolumeX size={14} aria-hidden="true" />}
      </IconButton>
    </div>
  );
};

export default SessionToolsGroup;
