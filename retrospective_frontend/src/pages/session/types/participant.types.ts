import type { SessionRole } from './session.types';

export interface ParticipantSummary {
  id: number;
  sessionId: number;
  displayName: string;
  role: SessionRole;
  status: 'online' | 'offline';
  joinedAt: string;
  lastSeenAt: string;
}

export interface GuestJoinResponse {
  id: number;
  displayName: string;
  role: SessionRole;
  guestToken: string;
}

export interface GuestIdentity {
  participantId: number;
  guestToken: string;
  displayName: string;
}

export interface SelfIdentity {
  participantId: number;
  guestToken?: string;
  token?: string;
}
