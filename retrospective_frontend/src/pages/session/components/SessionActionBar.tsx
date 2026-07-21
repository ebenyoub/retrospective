import { useState } from 'react';
import Button from '@/components/ui/Button';
import Modal, { ModalHeader, ModalTitle, ModalContent, ModalFooter } from '@/components/ui/Modal';
import { SESSION_STEPS, SESSION_STEP_LABELS } from '../sessionStep';
import TimerChip from './TimerChip';
import { useSessionContext } from '../context/useSessionContext';

const SessionActionBar = () => {
  const context = useSessionContext();
  const step = context.details.step;
  const cardsCount = context.sessionCards.cards.length;
  const votesLeft = context.votesLeft;
  const actionsCount = context.actions.length;
  const isFacilitator = context.identity.isFacilitator;
  const stepEndsAt = context.stepEndsAt;
  const onTransitionStep = context.handleTransitionStep;
  const onUpdateTimer = context.handleUpdateTimer;
  const onCloseSession = context.handleCloseSession;
  const [isBackConfirmOpen, setIsBackConfirmOpen] = useState(false);

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
      className="flex h-12 shrink-0 items-center gap-3 border-b border-navy-border bg-navy-surface px-3 md:h-[50px] md:px-5"
    >
      <div className="flex min-w-0 flex-1 items-center">
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
            {previousStep && (
              <Button variant="ghost" size="sm" onClick={() => setIsBackConfirmOpen(true)}>
                ← Étape précédente
              </Button>
            )}
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
            {step === 'results' && (
              <Button variant="primary" size="sm" onClick={() => onTransitionStep('action')}>
                Passer au plan d'action →
              </Button>
            )}
            {step === 'action' && (
              <Button variant="primary" size="sm" onClick={() => onTransitionStep('summary')}>
                Voir le récapitulatif →
              </Button>
            )}
          </>
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
