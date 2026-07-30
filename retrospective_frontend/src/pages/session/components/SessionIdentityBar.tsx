import { Home } from 'lucide-react';
import Button from '@/components/ui/Button';
import ParticipantBadge from './ParticipantBadge';
import ProfileMenu from '@/components/ProfileMenu';
import StepIndicator from './StepIndicator';
import { useAuth } from '@/context/auth/useAuth';
import { useSessionIdentityState, useSessionDetailsState, useSessionActionsState } from '../context/useSessionContext';
import type { SessionIdentityBarProps } from './types/SessionIdentityBar.types';

// Zone stable réservée à l'identité de session : Accueil à gauche, titre
// (tronqué, jamais compressé par le reste), badge de compte toujours à
// l'extrême droite. Sur grand écran, la ligne complète de points de
// progression (StepIndicator — version compacte ailleurs, voir
// SessionNavigationBar) est vraiment centrée : titre et badge sont deux
// colonnes `1fr` à largeur égale de chaque côté. La colonne du stepper n'est
// déclarée que si `isDesktopViewport` (vrai calcul JS, pas juste du CSS
// caché) : un `auto` masqué en CSS ne retombe pas forcément à 0 dans la
// grille, ce qui décale le badge du bord droit en dessous de xl.
const SessionIdentityBar = ({ canRenameSelf = false, onBack, isDesktopViewport }: SessionIdentityBarProps) => {
  const { identity, isReadOnly } = useSessionIdentityState();
  const { details } = useSessionDetailsState();
    const { isAuthenticated, username } = useAuth();

  
  const sessionName = details.sessionName;
  const step = details.step;
  // Badge du participant (pseudo + menu) : absent pour le facilitateur, qui a
  // déjà son menu de compte.
  const selfDisplayName = identity.role === 'participant'
    ? (identity.guestIdentity?.displayName ?? (isAuthenticated ? username : null))
    : null;
  const onRenameSelf = identity.renameSelf;
  const { handleLeaveSession } = useSessionActionsState();

  const displayName = sessionName || `Session ${details.sessionCode}`;

  return (
    <nav
      aria-label="Identité de session"
      className={`grid min-h-[52px] shrink-0 items-center gap-3 border-b border-navy-border bg-navy-mid px-3 py-2 md:h-14 md:min-h-14 md:px-5 md:py-0 ${
        isDesktopViewport
          ? 'grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)]'
          : 'grid-cols-[auto_minmax(0,1fr)_auto]'
      }`}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onBack}
        aria-label="Accueil"
        title="Retour à l'accueil"
        className="inline-flex h-[30px] shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-navy-border bg-transparent px-2.5 font-sans text-xs font-medium leading-none text-slate-400 transition-colors select-none hover:bg-navy-surface hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-mid"
      >
        <Home size={14} aria-hidden="true" />
        <span className="hidden sm:inline">Accueil</span>
      </Button>

      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex h-[30px] shrink-0 items-center font-sans text-[15px] font-extrabold leading-none text-green-figma">
          <span className="sm:hidden">RTC</span>
          <span className="hidden sm:inline">Range ta chambre</span>
        </span>
        <span className="hidden h-[30px] shrink-0 items-center font-sans text-[13px] leading-none text-slate-700 sm:inline-flex" aria-hidden="true">/</span>
        <span className="inline-flex h-[30px] min-w-0 flex-1 items-center truncate font-sans text-[13px] font-semibold leading-none text-slate-300">
          {displayName}
        </span>
      </div>

      {isDesktopViewport && (
        <div className="shrink-0">
          <StepIndicator currentStep={step} />
        </div>
      )}

      <div className="flex items-center justify-end gap-1.5">
        {selfDisplayName && onRenameSelf && handleLeaveSession && (
          <ParticipantBadge
            displayName={selfDisplayName}
            canRename={canRenameSelf}
            isReadOnly={isReadOnly}
            onRename={onRenameSelf}
            onLeave={handleLeaveSession}
          />
        )}
        {isAuthenticated && <ProfileMenu />}
      </div>
    </nav>
  );
};

export default SessionIdentityBar;
