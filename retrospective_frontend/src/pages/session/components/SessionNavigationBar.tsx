import StepIndicatorCompact from './StepIndicatorCompact';
import SessionToolsGroup from './SessionToolsGroup';
import { useSessionContext } from '../context/useSessionContext';
import type { SessionNavigationBarProps } from './types/SessionNavigationBar.types';

// Zone dédiée au déroulement (étape/progression) et aux outils de session
// (code, participants, discussion, son) — toujours une seule ligne. À partir
// de xl, hors salle d'attente, cette barre disparaît entièrement : la
// progression complète vit déjà dans SessionIdentityBar et les outils
// rejoignent SessionActionBar (2 barres au lieu de 3, comme demandé).
const SessionNavigationBar = ({ isSessionCodeCopied, onCopySessionCode, isDesktopViewport }: SessionNavigationBarProps) => {
  const context = useSessionContext();
  const step = context.details.step;
  const isWaiting = step === 'waiting';

  // Hors salle d'attente, à partir de xl, les outils rejoignent la barre
  // d'actions : rien à afficher ici (pas de doublon d'éléments interactifs).
  if (isDesktopViewport && !isWaiting) return null;

  return (
    <nav
      aria-label="Navigation de session"
      className="flex h-12 shrink-0 items-center gap-2 border-b border-navy-border bg-navy-mid px-3 md:px-5"
    >
      {!isDesktopViewport && (
        <div className="flex min-w-0 shrink-0 items-center">
          <StepIndicatorCompact currentStep={step} />
        </div>
      )}

      <div className="ml-auto min-w-0">
        <SessionToolsGroup isSessionCodeCopied={isSessionCodeCopied} onCopySessionCode={onCopySessionCode} />
      </div>
    </nav>
  );
};

export default SessionNavigationBar;
