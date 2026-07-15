import { API_BASE } from '@/lib/api';
import type { GuestJoinResponse, ParticipantSummary } from '../types/participant.types';
import type { SessionRole } from '../types/session.types';
import { requestApi, requestApiCommand } from './http';

export const listParticipants = (sessionId: string) =>
  requestApi<ParticipantSummary[]>(`${API_BASE}/session/${sessionId}/participants`);

// L'utilisateur connecté est identifié par son cookie HttpOnly,
// envoyé automatiquement par requestApi.
export const joinAsSelf = (sessionId: string) =>
  requestApi<{ id: number; role: SessionRole }>(`${API_BASE}/session/${sessionId}/participants/self`, {
    method: 'POST',
  });

export const resumeGuestParticipant = (
  sessionId: string,
  participantId: number,
  guestToken: string
) =>
  requestApi<{ id: number }>(`${API_BASE}/session/${sessionId}/participants/resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participantId, guestToken }),
  });

export const leaveParticipant = async (
  sessionId: string,
  participantId: number,
  guestToken?: string
): Promise<void> => {
  await requestApiCommand(`${API_BASE}/session/${sessionId}/participants/${participantId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guestToken }),
  });
};

export const guestJoin = (sessionId: string, pseudo: string) =>
  requestApi<GuestJoinResponse>(`${API_BASE}/session/${sessionId}/participants/guest-join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pseudo }),
  });
