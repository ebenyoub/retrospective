import { API_BASE } from '@/lib/api';
import type { SessionMessage } from '../types/message.types';
import { requestApi } from './http';

export const getMessages = (
  sessionId: string,
  headers: Record<string, string>
) =>
  requestApi<SessionMessage[]>(`${API_BASE}/session/${sessionId}/chat/messages`, {
    headers,
  });

export const createMessage = (
  sessionId: string,
  headers: Record<string, string>,
  content: string
) =>
  requestApi<SessionMessage>(`${API_BASE}/session/${sessionId}/chat/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ content }),
  });
