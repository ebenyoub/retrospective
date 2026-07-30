import { useState } from 'react';
import { ArrowLeft, ArrowRight, Square } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal, { ModalHeader, ModalTitle, ModalContent, ModalFooter } from '@/components/ui/Modal';
import { SESSION_STEPS, SESSION_STEP_LABELS } from '../sessionStep';
import TimerChip from './TimerChip';
import SessionToolsGroup from './SessionToolsGroup';
import { useSessionContext } from '../context/useSessionContext';
import type { SessionStep } from '../types/session.types';
import type { SessionActionBarProps } from './types/SessionActionBar.types';

// CTA d'avancement par étape : une seule table plutôt que 4 blocs JSX
// dupliqués (mêmes icône/mise en page, seuls le libellé et l'étape cible
// changent).
const NEXT_STEP_CTA: Partial<Record<SessionStep, { label: string; nextStep: SessionStep }>> = {
  writing: { label: 'Passer au vote', nextStep: 'voting' },
  voting: { label: 'Voir les résultats', nextStep: 'results' },
  results: { label: "Passer au plan d'action", nextStep: 'action' },
  action: { label: 'Voir le récapitulatif', nextStep: 'summary' },
};

const SessionActionBar = ({ isDesktopViewport, isSessionCodeCopied, onCopySessionCode }: SessionActionBarProps) => {
  const context = useSessionContext();
  const step = context.details.step;
  const votesLeft = context.votesLeft;
  const actionsCount = context.actions.length;
  const isFacilitator = context.identity.isFacilitator;
  const stepEndsAt = context.stepEndsAt;
  const onTransitionStep = context.handleTransitionStep;
  const onUpdateTimer = context.handleUpdateTimer;
  const onCloseSession = context.handleCloseSession;
  const [isBackConfirmOpen, setIsBackConfirmOpen] = useState(false);

  if (!isFacilitator && !isDesktopViewport) return null;
  if ((step === 'results' || step === 'summary') && !isFacilitator) return null;

  // Le backend n'impose aucun ordre : revenir en arrière réutilise le même
  // mécanisme que "passer à l'étape suivante", juste avec l'étape d'avant.
  const currentIndex = SESSION_STEPS.indexOf(step);
  const previousStep = currentIndex > 0 ? SESSION_STEPS[currentIndex - 1] : null;

  const handleConfirmBack = () => {
    if (previousStep) onTransitionStep(previousStep);
    setIsBackConfirmOpen(false);
  };

  return (
    <div
      role="toolbar"
      aria-label="Actions de l'étape"
      className="flex h-12 shrink-0 items-center gap-2 border-b border-navy-border bg-navy-surface px-3 md:px-5"
    >
      <div className="hidden md:flex min-w-0 shrink-0 items-center">
        {step === 'results' ? (
          <span className="font-sans text-xs leading-none text-slate-400 select-none">
            Rétrospective terminée
          </span>
        ) : step === 'summary' ? (
          <span className="font-sans text-xs leading-none text-slate-400 select-none">
            Récapitulatif final
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
        ) : step === 'action' ? (
          <span className="font-sans text-xs leading-none text-slate-400 select-none">
            {actionsCount} action{actionsCount !== 1 ? 's' : ''} enregistrée{actionsCount !== 1 ? 's' : ''}
          </span>
        ) : null}
      </div>

      {/* À partir de xl, les outils de session rejoignent cette barre (2
          barres au lieu de 3 sur grand écran — SessionNavigationBar ne
          s'affiche plus dans ce cas, voir son composant). */}
      {isDesktopViewport && (
        <SessionToolsGroup isSessionCodeCopied={isSessionCodeCopied} onCopySessionCode={onCopySessionCode} />
      )}

      <div className="ml-auto flex min-w-0 shrink-0 items-center gap-2">
        {isDesktopViewport && (step === 'writing' || step === 'voting') && stepEndsAt && (
          <TimerChip endsAt={stepEndsAt} isEditable={isFacilitator} onSubmitMinutes={onUpdateTimer} />
        )}

        {isFacilitator && (
          <div className="flex shrink-0 items-center gap-1.5">
            {previousStep && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBackConfirmOpen(true)}
                aria-label="Étape précédente"
                title="Étape précédente"
                className="flex h-[30px] items-center justify-center gap-1.5 px-2.5 font-sans text-xs font-medium"
              >
                <ArrowLeft size={14} aria-hidden="true" />
                <span className="hidden md:inline">
                  <span className="hidden min-[1152px]:inline">Étape précédente</span>
                  <span className="inline min-[1152px]:hidden">Précédent</span>
                </span>
              </Button>
            )}

            <Button
              variant="danger"
              size="sm"
              onClick={onCloseSession}
              aria-label="Terminer la session"
              title="Terminer la session"
              className="flex h-[30px] items-center justify-center gap-1.5 bg-red-text border border-[#991b1b] text-red-mid hover:bg-[#991b1b] rounded-lg px-2.5 font-sans text-xs font-medium"
            >
              <Square size={13} aria-hidden="true" />
              <span className="hidden md:inline">
                <span className="hidden min-[1152px]:inline">Terminer la session</span>
                <span className="inline min-[1152px]:hidden">Terminer</span>
              </span>
            </Button>

            {NEXT_STEP_CTA[step] && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onTransitionStep(NEXT_STEP_CTA[step]!.nextStep)}
                aria-label={NEXT_STEP_CTA[step]!.label}
                title={NEXT_STEP_CTA[step]!.label}
                className="flex h-[30px] items-center justify-center gap-1.5 px-2.5 font-sans text-xs font-medium"
              >
                <span className="hidden md:inline">
                  <span className="hidden min-[1152px]:inline">{NEXT_STEP_CTA[step]!.label}</span>
                  <span className="inline min-[1152px]:hidden">
                    {step === 'writing' ? 'Voter' : step === 'voting' ? 'Résultats' : step === 'results' ? 'Plan' : step === 'action' ? 'Synthèse' : NEXT_STEP_CTA[step]!.label}
                  </span>
                </span>
                <ArrowRight size={14} aria-hidden="true" />
              </Button>
            )}
          </div>
        )}
      </div>

      {previousStep && (
        <Modal isOpen={isBackConfirmOpen} onClose={() => setIsBackConfirmOpen(false)}>
          <ModalHeader>
            <ModalTitle>Revenir à l'étape précédente ?</ModalTitle>
          </ModalHeader>
          <ModalContent>
            <p>
              La session va revenir à l'étape « {SESSION_STEP_LABELS[previousStep]} ».
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Les cartes, votes et commentaires déjà enregistrés sont conservés.
            </p>
          </ModalContent>
          <ModalFooter>
            <Button variant="secondary" size="sm" onClick={() => setIsBackConfirmOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmBack}>
              Revenir en arrière
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default SessionActionBar;
