import type { NavigateFunction } from 'react-router-dom';
import type { SessionStep } from '../../types/session.types';

export interface UseSessionActionsOptions {
  sessionId: string;
  isAuthenticated: boolean;
  navigate: NavigateFunction;
  addToast: (type: 'success' | 'error', message: string) => void;
  leaveParticipation: () => Promise<void>;
  clearGuestIdentity: () => void;
  setStep: (step: SessionStep) => void;
  setFormatName: (name: string) => void;
  setFormatColumns: (columns: string[]) => void;
  setStepDurationMinutes: (minutes: number) => void;
  setStepEndsAt: (endsAt: string | null) => void;
  fetchCards: () => Promise<void>;
}
