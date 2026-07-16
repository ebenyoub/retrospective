export interface UseSessionParticipantsOptions {
  onSessionStarted?: (step: string, stepEndsAt: string | null) => void;
  onTimerUpdated?: (stepEndsAt: string) => void;
  onSessionClosed?: () => void;
}
