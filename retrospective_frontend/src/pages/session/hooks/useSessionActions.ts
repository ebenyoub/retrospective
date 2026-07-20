import { useCallback } from 'react';

import { getApiErrorMessage, NETWORK_ERROR_MESSAGE } from '@/lib/apiError';
import { updateSessionFormat, updateSessionStep, updateSessionTimer, closeSession } from '../services/sessionApi';
import type { SessionStep } from '../types/session.types';
import type { UseSessionActionsOptions } from './types/useSessionActions.types';

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
  setStepDurationMinutes,
  setStepEndsAt,
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
        setStepEndsAt(result.data.stepEndsAt);
        addToast(
          'success',
          `Session passée à l'étape : ${
            nextStep === 'writing' ? 'Écriture'
              : nextStep === 'voting' ? 'Vote'
              : nextStep === 'results' ? 'Résultats'
              : nextStep === 'action' ? "Plan d'action"
              : 'Résumé'
          }`
        );
      } else {
        addToast('error', getApiErrorMessage(result.payload, 'Impossible de changer d\'étape.'));
      }
    } catch (error) {
      console.error('Erreur lors du changement d\'étape :', error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    }
  }, [sessionId, isAuthenticated, setStep, setStepEndsAt, addToast]);

  // Réglage du timer : le backend calcule et renvoie la nouvelle échéance
  // (ou la nouvelle durée par défaut en salle d'attente) — jamais le client.
  const handleUpdateTimer = useCallback(async (minutes: number): Promise<boolean> => {
    if (!sessionId || !isAuthenticated) return false;

    try {
      const result = await updateSessionTimer(sessionId, minutes);

      if (!result.ok) {
        addToast('error', getApiErrorMessage(result.payload, 'Impossible de mettre à jour le timer.'));
        return false;
      }

      setStepDurationMinutes(result.data.stepDurationMinutes);
      setStepEndsAt(result.data.stepEndsAt);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du timer :', error);
      addToast('error', NETWORK_ERROR_MESSAGE);
      return false;
    }
  }, [sessionId, isAuthenticated, setStepDurationMinutes, setStepEndsAt, addToast]);

  const handleCloseSession = useCallback(async (): Promise<void> => {
    if (!sessionId || !isAuthenticated) return;

    try {
      const result = await closeSession(sessionId);

      if (result.ok) {
        addToast('success', 'La session a été fermée.');
        navigate('/sessions');
      } else {
        addToast('error', getApiErrorMessage(result.payload, 'Impossible de fermer la session.'));
      }
    } catch (error) {
      console.error('Erreur lors de la fermeture de la session :', error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    }
  }, [sessionId, isAuthenticated, navigate, addToast]);

  return { handleLeaveSession, handleTransitionStep, handleUpdateFormat, handleUpdateTimer, handleCloseSession };
};
