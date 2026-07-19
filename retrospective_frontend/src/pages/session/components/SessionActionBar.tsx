import Button from '@/components/ui/Button';
import TimerChip from './TimerChip';
import type { SessionActionBarProps } from './types/SessionActionBar.types';

const SessionActionBar = ({
  step,
  cardsCount,
  votesLeft,
  isFacilitator,
  stepEndsAt,
  onTransitionStep,
  onUpdateTimer,
  onCloseSession,
}: SessionActionBarProps) => {
  if (step === 'results' && !isFacilitator) return null;

  return (
    <div
      role="toolbar"
      aria-label="Actions de l'étape"
      className="flex h-12 shrink-0 items-center gap-3 border-b border-navy-border bg-navy-surface px-3 md:h-[50px] md:px-5"
    >
      <div className="flex min-w-0 flex-1 items-center">
        {step === 'results' ? (
          <span className="font-sans text-xs leading-none text-slate-400 select-none">
            Rétrospective terminée
          </span>
        ) : step === 'voting' ? (
          <div
            role="status"
            aria-label={`${votesLeft} votes restants sur 5`}
            className="flex h-7 shrink-0 items-center gap-2 rounded-lg border border-navy-border-med bg-navy-surface px-2.5"
          >
            <div className="flex gap-[3px]" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                    i < votesLeft ? 'bg-amber-400' : 'bg-navy-border-med'
                  }`}
                />
              ))}
            </div>
            <span className="font-sans text-xs font-semibold leading-none text-slate-200 select-none">
              {votesLeft} vote{votesLeft !== 1 ? 's' : ''} restant{votesLeft !== 1 ? 's' : ''}
            </span>
          </div>
        ) : (
          <span className="font-sans text-xs leading-none text-slate-400 select-none">
            {cardsCount} carte{cardsCount !== 1 ? 's' : ''} au total
          </span>
        )}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {(step === 'writing' || step === 'voting') && stepEndsAt && (
          <TimerChip endsAt={stepEndsAt} isEditable={isFacilitator} onSubmitMinutes={onUpdateTimer} />
        )}

        {isFacilitator && (
          <>
            <Button
              variant="danger"
              size="sm"
              onClick={onCloseSession}
              className="bg-[#7f1d1d] border border-[#991b1b] text-[#fca5a5] hover:bg-[#991b1b] rounded-[10px] h-[36px]"
            >
              Terminer la session
            </Button>
            {step === 'writing' && (
              <Button variant="primary" size="sm" onClick={() => onTransitionStep('voting')}>
                Passer au vote →
              </Button>
            )}
            {step === 'voting' && (
              <Button variant="primary" size="sm" onClick={() => onTransitionStep('results')}>
                Voir les résultats →
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SessionActionBar;
