import { SESSION_STEP_LABELS, SESSION_STEPS } from '../sessionStep';
import type { StepIndicatorProps } from './types/StepIndicator.types';

const MOBILE_LABELS: Record<string, string> = {
  waiting: 'Attente',
  writing: 'Écriture',
  voting: 'Vote',
  results: 'Résultats',
  action: 'Actions',
  summary: 'Synthèse',
};

// Version compacte du stepper (puce + nom de l'étape + position)
const StepIndicatorCompact = ({ currentStep }: StepIndicatorProps) => {
  const currentIndex = SESSION_STEPS.indexOf(currentStep);
  const total = SESSION_STEPS.length;
  const labelFull = SESSION_STEP_LABELS[currentStep];
  const labelMobile = MOBILE_LABELS[currentStep] || labelFull;

  return (
    <span
      className="flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-navy-border-med bg-navy-surface-med px-2.5 font-sans text-xs font-semibold leading-none text-slate-200"
      aria-label={`Progression de la session : étape ${currentIndex + 1} sur ${total}, ${labelFull}`}
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-slate-50" aria-hidden="true" />
      <span className="md:inline hidden truncate">{labelFull}</span>
      <span className="md:hidden inline truncate">{labelMobile}</span>
      <span className="shrink-0 font-mono text-[11px] text-slate-400">{currentIndex + 1}/{total}</span>
    </span>
  );
};

export default StepIndicatorCompact;
