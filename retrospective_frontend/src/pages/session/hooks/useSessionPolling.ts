import { useEffect, useState } from 'react';
import type { UseSessionPollingOptions } from './types/useSessionPolling.types';

export const useSessionPolling = ({
  sessionId,
  isAuthenticated,
  navigate,
  addToast,
  fetchSessionDetails,
  fetchCards,
}: UseSessionPollingOptions): boolean => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const sessionIdNumber = Number(sessionId);
    if (!sessionId || sessionId === 'undefined' || isNaN(sessionIdNumber) || sessionIdNumber <= 0) {
      const loadingTimeout = window.setTimeout(() => setIsLoading(false), 0);
      addToast('error', 'Session invalide ou non spécifiée.');
      navigate(isAuthenticated ? '/sessions' : '/');
      return () => window.clearTimeout(loadingTimeout);
    }

    let isActive = true;

    const loadSession = async (): Promise<void> => {
      await Promise.all([fetchSessionDetails(), fetchCards()]);

      if (isActive) {
        setIsLoading(false);
      }
    };

    void loadSession();

    const interval = window.setInterval(() => {
      void fetchSessionDetails();
      void fetchCards();
    }, 4000);

    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, [fetchSessionDetails, fetchCards, sessionId, navigate, isAuthenticated, addToast]);

  return isLoading;
};
