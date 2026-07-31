import type { MutableRefObject } from 'react';
import type { SessionStep } from '../../types/session.types';

export interface UseSessionSocketHandlersOptions {
  setStep: (step: SessionStep) => void;
  setStepEndsAt: (stepEndsAt: string | null) => void;
  setStatus: (status: string) => void;
  addToast: (type: 'success' | 'error', message: string) => void;
  hasShownClosedToastRef: MutableRefObject<boolean>;
}
