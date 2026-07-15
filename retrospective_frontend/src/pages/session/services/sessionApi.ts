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
  requestApiCommand(`${API_BASE}/session/${sessionId}/step`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step }),
  });
