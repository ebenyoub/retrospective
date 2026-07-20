import { API_BASE } from '@/lib/api';
import type { ActionItem } from '../types/action.types';
import { requestApi } from './http';

export const getActions = (
  sessionId: string,
  headers: Record<string, string>
) =>
  requestApi<ActionItem[]>(`${API_BASE}/session/${sessionId}/actions`, {
    headers,
  });

export interface CreateActionPayload {
  description: string;
  owner: string;
  priority: 'high' | 'medium' | 'low';
  deadline?: string | null;
}

export const createAction = (
  sessionId: string,
  headers: Record<string, string>,
  payload: CreateActionPayload
) =>
  requestApi<ActionItem>(`${API_BASE}/session/${sessionId}/actions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(payload),
  });
