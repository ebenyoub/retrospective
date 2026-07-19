import type { NavigateFunction } from 'react-router-dom';

export interface UseSessionPollingOptions {
  sessionId: string;
  isAuthenticated: boolean;
  navigate: NavigateFunction;
  addToast: (type: 'error', message: string) => void;
  fetchSessionDetails: () => Promise<void>;
  fetchCards: () => Promise<void>;
}
