export interface JoinPayload {
  sessionId: number;
  participantId: number;
  guestToken?: string;
  token?: string;
}
