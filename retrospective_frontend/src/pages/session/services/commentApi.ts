import { API_BASE } from '@/lib/api';
import type { CardComment } from '../types/comment.types';
import { requestApi, requestApiCommand } from './http';

export const getComments = (
  sessionId: string,
  headers: Record<string, string>,
  cardId: number
) =>
  requestApi<CardComment[]>(`${API_BASE}/session/${sessionId}/cards/${cardId}/comments`, {
    headers,
  });

export const createComment = (
  sessionId: string,
  headers: Record<string, string>,
  cardId: number,
  content: string
) =>
  requestApi<CardComment>(`${API_BASE}/session/${sessionId}/cards/${cardId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ content }),
  });

export const deleteComment = (
  sessionId: string,
  headers: Record<string, string>,
  cardId: number,
  commentId: number
) =>
  requestApiCommand(`${API_BASE}/session/${sessionId}/cards/${cardId}/comments/${commentId}`, {
    method: 'DELETE',
    headers,
  });
