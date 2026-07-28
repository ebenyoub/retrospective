import { SESSION_STEP_LABELS, SESSION_STEPS } from '../sessionStep';
import type { StepIndicatorProps } from './types/StepIndicator.types';

// Ligne complète de points reliés : demande assez de largeur pour rester
// lisible, réservée au desktop (affichée dans SessionIdentityBar, entre le
// titre et le badge de compte). En dessous, voir StepIndicatorCompact.
const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  const currentIndex = SESSION_STEPS.indexOf(currentStep);

  return (
    <div className="flex items-center justify-center" aria-label="Progression de la session">
      {SESSION_STEPS.map((step, index) => {
        const isActive = step === currentStep;
        const isDone = index < currentIndex;

        return (
          <div key={step} className="flex items-center">
            {index > 0 && (
              <span
                className={`h-px w-5 transition-colors ${
                  isDone ? 'bg-green-figma' : 'bg-navy-border-med'
                }`}
                aria-hidden="true"
              />
            )}
            <span
              className={`flex h-6 items-center gap-1.5 rounded-full border transition-colors ${
                isActive
                  ? 'border-navy-border-med bg-navy-surface-med px-2.5'
                  : 'border-transparent bg-transparent px-1.5'
              }`}
              title={SESSION_STEP_LABELS[step]}
            >
              <span
                className={`rounded-full ${
                  isActive ? 'h-2 w-2 bg-slate-50' : 'h-[7px] w-[7px]'
                } ${isDone ? 'bg-green-figma' : isActive ? '' : 'bg-slate-600'}`}
                aria-hidden="true"
              />
              {isActive && (
                <span className="whitespace-nowrap font-sans text-xs font-semibold leading-none text-slate-200">
                  {SESSION_STEP_LABELS[step]}
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
