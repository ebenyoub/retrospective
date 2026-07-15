import { useCallback } from 'react';
import type { NavigateFunction } from 'react-router-dom';

import { getApiErrorMessage, NETWORK_ERROR_MESSAGE } from '@/lib/apiError';
import { updateSessionFormat, updateSessionStep } from '../services/sessionApi';
import type { SessionStep } from '../types/session.types';

interface UseSessionActionsOptions {
  sessionId: string;
  isAuthenticated: boolean;
  navigate: NavigateFunction;
  addToast: (type: 'success' | 'error', message: string) => void;
  leaveParticipation: () => Promise<void>;
  clearGuestIdentity: () => void;
  setStep: (step: SessionStep) => void;
  setFormatName: (name: string) => void;
  setFormatColumns: (columns: string[]) => void;
}

export const useSessionActions = ({
  sessionId,
  isAuthenticated,
  navigate,
  addToast,
  leaveParticipation,
  clearGuestIdentity,
  setStep,
  setFormatName,
  setFormatColumns,
}: UseSessionActionsOptions) => {
  const handleLeaveSession = useCallback(async (): Promise<void> => {
    await leaveParticipation();
    if (!isAuthenticated) {
      clearGuestIdentity();
    }
    navigate('/');
  }, [leaveParticipation, isAuthenticated, clearGuestIdentity, navigate]);

  const handleUpdateFormat = useCallback(async (
    nextName: string,
    nextColumns: string[]
  ): Promise<void> => {
    if (!isAuthenticated) return;

    try {
      const result = await updateSessionFormat(sessionId, nextName, nextColumns);

      if (result.ok) {
        setFormatName(nextName);
        setFormatColumns(nextColumns);
      } else {
        addToast('error', getApiErrorMessage(result.payload, 'Impossible de mettre à jour le format.'));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du format :', error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    }
  }, [sessionId, isAuthenticated, setFormatName, setFormatColumns, addToast]);

  const handleTransitionStep = useCallback(async (nextStep: SessionStep): Promise<void> => {
    if (!sessionId || !isAuthenticated) return;

    try {
      const result = await updateSessionStep(sessionId, nextStep);

      if (result.ok) {
        setStep(nextStep);
        addToast(
          'success',
          `Session passée à l'étape : ${nextStep === 'writing' ? 'Écriture' : nextStep === 'voting' ? 'Vote' : 'Résultats'}`
        );
      } else {
        addToast('error', getApiErrorMessage(result.payload, 'Impossible de changer d\'étape.'));
      }
    } catch (error) {
      console.error('Erreur lors du changement d\'étape :', error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    }
  }, [sessionId, isAuthenticated, setStep, addToast]);

  return { handleLeaveSession, handleTransitionStep, handleUpdateFormat };
};
