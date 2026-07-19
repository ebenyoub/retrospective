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

// L'utilisateur connecté est authentifié par son cookie HttpOnly (envoyé
// automatiquement au handshake socket) : seul l'invité porte un jeton.
export interface SelfIdentity {
  participantId: number;
  guestToken?: string;
}
