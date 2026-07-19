import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SessionDashboard from '../SessionDashboard';

export type SocketHandler = (payload?: unknown) => void;

export const emptyCardsResponse = {
  ok: true,
  json: async () => ({ success: true, data: [] }),
};

export const emptyRoleResponse = {
  ok: true,
  json: async () => ({ success: true, data: [] }),
};

export const createDashboardFetchMock = (options: {
  cardsSequence: unknown[];
  voteResponse?: unknown;
  addCardResponse?: unknown;
  updateCardResponse?: unknown;
  deleteCardResponse?: unknown;
  commentsResponse?: unknown;
  createCommentResponse?: unknown;
  deleteCommentResponse?: unknown;
  step?: 'waiting' | 'writing' | 'voting' | 'results';
  formatName?: string;
  formatColumns?: string[];
  stepEndsAt?: string | null;
}) => {
  const {
    cardsSequence,
    voteResponse,
    addCardResponse,
    updateCardResponse,
    deleteCardResponse,
    commentsResponse = emptyCardsResponse,
    createCommentResponse,
    deleteCommentResponse,
    step = 'writing',
    formatName = 'Commencer / Arrêter / Continuer',
    formatColumns = ['Commencer', 'Arrêter', 'Continuer'],
    stepEndsAt = null,
  } = options;
  let cardsCallIndex = 0;

  return vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET';

    if (url.endsWith('/session/1')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 1,
            name: 'Tableau de rétrospective — session 1',
            code: '1234',
            status: 'open',
            step: step,
            ownerId: 1,
            formatName,
            formatColumns,
            stepDurationMinutes: 5,
            stepEndsAt,
          },
        }),
      });
    }
    if (url.endsWith('/session/1/participants/self')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, data: { id: 1, role: 'facilitator' } }),
      });
    }
    if (url.endsWith('/session/1/participants')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: [{ id: 1, sessionId: 1, displayName: 'Elyas', role: 'facilitator', status: 'online' }],
        }),
      });
    }
    if (url.endsWith('/session')) {
      return Promise.resolve(emptyRoleResponse);
    }
    if (method === 'POST' && url.includes('/vote')) {
      return Promise.resolve(voteResponse);
    }
    if (method === 'GET' && url.includes('/comments')) {
      return Promise.resolve(commentsResponse);
    }
    if (method === 'POST' && url.includes('/comments')) {
      return Promise.resolve(createCommentResponse);
    }
    if (method === 'DELETE' && url.includes('/comments')) {
      return Promise.resolve(deleteCommentResponse);
    }
    if (method === 'POST' && url.endsWith('/cards')) {
      return Promise.resolve(addCardResponse);
    }
    if (method === 'PATCH') {
      return Promise.resolve(updateCardResponse);
    }
    if (method === 'DELETE') {
      return Promise.resolve(deleteCardResponse);
    }

    const response = cardsSequence[Math.min(cardsCallIndex, cardsSequence.length - 1)];
    cardsCallIndex += 1;
    return Promise.resolve(response);
  });
};

export const renderDashboard = () =>
  render(
    <MemoryRouter initialEntries={['/session/1']}>
      <Routes>
        <Route path="/session/:id" element={<SessionDashboard />} />
      </Routes>
    </MemoryRouter>
  );
