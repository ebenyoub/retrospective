import StepIndicatorCompact from './StepIndicatorCompact';
import SessionToolsGroup from './SessionToolsGroup';
import TimerChip from './TimerChip';
import { useSessionDetailsState, useSessionIdentityState, useSessionActionsState } from '../context/useSessionContext';
import type { SessionNavigationBarProps } from './types/SessionNavigationBar.types';

// Zone dédiée au déroulement (étape/progression, timer) et aux outils de session
// (code, participants, discussion, son).
const SessionNavigationBar = ({ isSessionCodeCopied, onCopySessionCode, isDesktopViewport }: SessionNavigationBarProps) => {
  const { details } = useSessionDetailsState();
    const { identity } = useSessionIdentityState();
  const { stepEndsAt, handleUpdateTimer } = useSessionActionsState();
  const step = details.step;
  
  const isFacilitator = identity.isFacilitator;
  
  const isWaiting = step === 'waiting';

  // Hors salle d'attente, à partir de xl, les outils rejoignent la barre d'actions
  if (isDesktopViewport && !isWaiting) return null;

  return (
    <nav
      aria-label="Navigation de session"
      className="flex h-12 shrink-0 items-center gap-2 border-b border-navy-border bg-navy-mid px-3 md:px-5 justify-between"
    >
      {!isDesktopViewport && (
        <div className="flex min-w-0 shrink-0 items-center gap-2">
          <StepIndicatorCompact currentStep={step} />
          {(step === 'writing' || step === 'voting') && stepEndsAt && (
            <TimerChip endsAt={stepEndsAt} isEditable={isFacilitator} onSubmitMinutes={handleUpdateTimer} />
          )}
        </div>
      )}

      <div className="ml-auto min-w-0">
        <SessionToolsGroup isSessionCodeCopied={isSessionCodeCopied} onCopySessionCode={onCopySessionCode} />
      </div>
    </nav>
  );
};

export default SessionNavigationBar;
