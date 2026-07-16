import { API_BASE } from '@/lib/api';
import type {
  CreatedSession,
  CreateSessionPayload,
  SessionDetails,
  SessionListItem,
  SessionStep,
} from '../types/session.types';
import { requestApi, requestApiCommand } from './http';

// L'authentification passe par le cookie HttpOnly envoyé automatiquement
// par requestApi (credentials: 'include') : plus de header Authorization.

export const getSessionDetails = (sessionId: string) =>
  requestApi<SessionDetails>(`${API_BASE}/session/${sessionId}`);

export const createSession = (payload: CreateSessionPayload) =>
  requestApi<CreatedSession>(`${API_BASE}/session/create-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const listSessions = () =>
  requestApi<SessionListItem[]>(`${API_BASE}/session`);

export const updateSessionFormat = (
  sessionId: string,
  formatName: string,
  formatColumns: string[]
) =>
  requestApiCommand(`${API_BASE}/session/${sessionId}/format`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formatName, formatColumns }),
  });

export const updateSessionStep = (sessionId: string, step: SessionStep) =>
  requestApi<{ step: SessionStep; stepEndsAt: string | null }>(`${API_BASE}/session/${sessionId}/step`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step }),
  });

// Réglage du timer par le facilitateur : le backend calcule la nouvelle
// échéance (ou la nouvelle durée par défaut en salle d'attente).
export const updateSessionTimer = (sessionId: string, minutes: number) =>
  requestApi<{ stepEndsAt: string | null; stepDurationMinutes: number }>(`${API_BASE}/session/${sessionId}/timer`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ minutes }),
  });

export const closeSession = (sessionId: string) =>
  requestApiCommand(`${API_BASE}/session/${sessionId}/close`, {
    method: 'POST',
  });

export const updateSessionName = (sessionId: string, name: string) =>
  requestApiCommand(`${API_BASE}/session/${sessionId}/name`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

export const deleteSession = (sessionId: string) =>
  requestApiCommand(`${API_BASE}/session/${sessionId}`, {
    method: 'DELETE',
  });
