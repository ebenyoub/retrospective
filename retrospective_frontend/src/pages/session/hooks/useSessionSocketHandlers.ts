import { useCallback } from 'react';

import type { SessionStep } from '../types/session.types';
import type { UseSessionSocketHandlersOptions } from './types/useSessionSocketHandlers.types';

// Les 3 handlers passés à useSessionParticipants (voir SessionDashboard) pour
// réagir en direct aux événements socket émis par le facilitateur : passage
// à l'étape suivante, échéance du timer redéfinie, clôture de la session.
export const useSessionSocketHandlers = ({
  setStep,
  setStepEndsAt,
  setStatus,
  addToast,
  hasShownClosedToastRef,
}: UseSessionSocketHandlersOptions) => {
  const handleSessionStarted = useCallback((nextStep: string, stepEndsAt: string | null) => {
    setStep(nextStep as SessionStep);
    setStepEndsAt(stepEndsAt);
  }, [setStep, setStepEndsAt]);

  // L'échéance redéfinie par le facilitateur arrive en direct par socket.
  const handleTimerUpdated = useCallback((stepEndsAt: string) => {
    setStepEndsAt(stepEndsAt);
  }, [setStepEndsAt]);

  const handleSessionClosedBySocket = useCallback(() => {
    addToast('success', 'Le facilitateur a mis fin à la session. Redirection vers les résultats.');
    setStatus('closed');
    hasShownClosedToastRef.current = true;
  }, [addToast, setStatus, hasShownClosedToastRef]);

  return { handleSessionStarted, handleTimerUpdated, handleSessionClosedBySocket };
};
