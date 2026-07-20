import type { SessionStep } from '../../types/session.types';

export interface SessionActionBarProps {
  step: SessionStep;
  cardsCount: number;
  votesLeft: number;
  actionsCount: number;
  isFacilitator: boolean;
  stepEndsAt: string | null;
  onTransitionStep: (nextStep: SessionStep) => void;
  onUpdateTimer: (minutes: number) => Promise<boolean>;
  onCloseSession: () => void | Promise<void>;
}
