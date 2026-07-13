import Button from '@/components/ui/Button';
import { type SessionStep } from '../sessionStep';
import TimerChip from './TimerChip';

interface SessionActionBarProps {
  step: SessionStep;
  cardsCount: number;
  votesLeft: number;
  isFacilitator: boolean;
  onTransitionStep: (nextStep: SessionStep) => void;
}

const SessionActionBar = ({
  step,
  cardsCount,
  votesLeft,
  isFacilitator,
  onTransitionStep,
}: SessionActionBarProps) => {
  if (step === 'results') return null;

  return (
    <div
      aria-label="Actions de l'étape"
      className="flex flex-shrink-0 items-center gap-3 border-b border-navy-border px-3 py-2.5 md:px-5"
    >
      <div className="flex min-w-0 flex-1 items-center">
        {step === 'voting' ? (
          <div
            role="status"
            aria-label={`${votesLeft} votes restants sur 5`}
            className="flex h-[28px] shrink-0 items-center gap-2 rounded-lg border border-navy-border-med bg-navy-surface px-2.5"
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

      <div className="relative ml-auto flex shrink-0 items-center gap-2">
        {step === 'writing' && <TimerChip value="05:00" />}
        {step === 'voting' && <TimerChip value="04:30" />}

        {isFacilitator && (
          <>
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
