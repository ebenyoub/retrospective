import { API_BASE } from '@/lib/api';
import type {
  CreatedSession,
  CreateSessionPayload,
  SessionDetails,
  SessionListItem,
  SessionStep,
} from '../types/session.types';
import { requestApi, requestApiCommand } from './http';

export const getSessionDetails = (sessionId: string, token?: string) =>
  requestApi<SessionDetails>(`${API_BASE}/session/${sessionId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

export const createSession = (token: string | null, payload: CreateSessionPayload) =>
  requestApi<CreatedSession>(`${API_BASE}/session/create-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

export const listSessions = (token: string) =>
  requestApi<SessionListItem[]>(`${API_BASE}/session`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateSessionFormat = (
  sessionId: string,
  token: string,
  formatName: string,
  formatColumns: string[]
) =>
  requestApiCommand(`${API_BASE}/session/${sessionId}/format`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ formatName, formatColumns }),
  });

export const updateSessionStep = (sessionId: string, token: string, step: SessionStep) =>
  requestApiCommand(`${API_BASE}/session/${sessionId}/step`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ step }),
  });
