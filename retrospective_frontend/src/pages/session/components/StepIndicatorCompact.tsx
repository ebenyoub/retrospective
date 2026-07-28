import { SESSION_STEP_LABELS, SESSION_STEPS } from '../sessionStep';
import type { StepIndicatorProps } from './types/StepIndicator.types';

// Version compacte du stepper (puce + nom de l'étape + position), utilisée
// partout où la ligne complète de points (StepIndicator, réservée au desktop
// dans SessionIdentityBar) ne tiendrait pas à côté des outils de session sur
// une seule ligne. Le nom reste affiché : c'est l'information la plus utile,
// seule la mise en page se compacte.
const StepIndicatorCompact = ({ currentStep }: StepIndicatorProps) => {
  const currentIndex = SESSION_STEPS.indexOf(currentStep);
  const total = SESSION_STEPS.length;
  const label = SESSION_STEP_LABELS[currentStep];

  return (
    <span
      className="flex h-6 min-w-0 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-navy-border-med bg-navy-surface-med px-2.5 font-sans text-xs font-semibold leading-none text-slate-200"
      aria-label={`Progression de la session : étape ${currentIndex + 1} sur ${total}, ${label}`}
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-slate-50" aria-hidden="true" />
      <span className="truncate">{label}</span>
      <span className="shrink-0 font-mono text-[11px] text-slate-400">{currentIndex + 1}/{total}</span>
    </span>
  );
};

export default StepIndicatorCompact;
