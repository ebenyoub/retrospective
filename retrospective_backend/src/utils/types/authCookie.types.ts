export interface ResumeTokenPayload {
  sessionId: number;
  participantId: number;
  displayName: string;
  guestToken: string | null;
}
