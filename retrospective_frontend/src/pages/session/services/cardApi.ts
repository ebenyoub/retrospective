import { API_BASE } from '@/lib/api';
import type { RetroCard } from '../types/card.types';
import { requestApi, requestApiCommand } from './http';

export const getCards = (sessionId: string, headers: Record<string, string>) =>
  requestApi<RetroCard[]>(`${API_BASE}/session/${sessionId}/cards`, {
    headers,
  });

export const createCard = (
  sessionId: string,
  headers: Record<string, string>,
  content: string,
  columnType: RetroCard['columnType']
) =>
  requestApiCommand(`${API_BASE}/session/${sessionId}/cards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ content, columnType }),
  });

export const voteForCard = (
  sessionId: string,
  headers: Record<string, string>,
  cardId: number
) =>
  requestApiCommand(`${API_BASE}/session/${sessionId}/cards/${cardId}/vote`, {
    method: 'POST',
    headers,
  });

export const deleteCard = (
  sessionId: string,
  headers: Record<string, string>,
  cardId: number
) =>
  requestApiCommand(`${API_BASE}/session/${sessionId}/cards/${cardId}`, {
    method: 'DELETE',
    headers,
  });

export const updateCard = (
  sessionId: string,
  headers: Record<string, string>,
  cardId: number,
  content: string
) =>
  requestApiCommand(`${API_BASE}/session/${sessionId}/cards/${cardId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ content }),
  });
