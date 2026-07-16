import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import {
  emptyCardsResponse,
  renderDashboard,
  type SocketHandler,
} from './tests/sessionTestUtils';

const { mockSocket, ioMock, authState } = vi.hoisted(() => {
  const listeners: Record<string, SocketHandler[]> = {};
  const socket = {
    on: vi.fn((event: string, callback: SocketHandler) => {
      (listeners[event] ??= []).push(callback);
    }),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    __trigger: (event: string, payload?: unknown) => {
      (listeners[event] ?? []).forEach((callback) => callback(payload));
    },
    __clear: () => {
      Object.keys(listeners).forEach((key) => delete listeners[key]);
    },
  };
  return {
    mockSocket: socket,
    ioMock: vi.fn(() => socket),
    authState: {
      isAuthenticated: true,
      token: 'test-token',
      userId: 1,
      username: 'Elyas',
      email: 'e@test.com',
    },
  };
});

vi.mock('socket.io-client', () => ({ io: ioMock }));

const addToastMock = vi.fn();

vi.mock('@/context/toast/useToast', () => ({
  useToast: () => ({
    addToast: addToastMock,
  }),
}));

vi.mock('@/context/auth/useAuth', () => ({
  useAuth: () => ({
    ...authState,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe('SessionDashboard - Vue des résultats (Results Step)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    addToastMock.mockReset();
    authState.isAuthenticated = true;
    authState.token = 'test-token';
    authState.userId = 1;
    authState.username = 'Elyas';
    authState.email = 'e@test.com';
    localStorage.clear();
    mockSocket.__clear();
    ioMock.mockClear();
  });

  it('bascule vers la vue résultats et trie les cartes par votes décroissant', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
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
                step: 'results',
                ownerId: 1,
              },
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: [
              {
                id: 1,
                sessionId: 1,
                authorId: 1,
                authorName: 'Elyas',
                columnType: 'start',
                content: 'Carte peu votée',
                createdAt: '2026-07-07T10:00:00.000Z',
                votesCount: 1,
              },
              {
                id: 2,
                sessionId: 1,
                authorId: 1,
                authorName: 'Elyas',
                columnType: 'stop',
                content: 'Carte très votée',
                createdAt: '2026-07-07T10:01:00.000Z',
                votesCount: 5,
              },
            ],
          }),
        });
      })
    );

    renderDashboard();

    expect(await screen.findByText('Top 3 des cartes')).toBeTruthy();

    const cards = screen.getAllByText(/Carte (peu|très) votée/);
    expect(cards[0].textContent).toBe('Carte très votée');
    expect(cards[1].textContent).toBe('Carte peu votée');
  });

  it('affiche les libellés du format choisi dans la vue résultats', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
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
                step: 'results',
                ownerId: 1,
                formatName: 'Succès / Difficultés / Idées',
                formatColumns: ['Succès', 'Difficultés', 'Idées'],
              },
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: [
              {
                id: 1,
                sessionId: 1,
                authorId: 1,
                authorName: 'Elyas',
                columnType: 'start',
                content: 'Livraison réussie',
                createdAt: '2026-07-07T10:00:00.000Z',
                votesCount: 3,
              },
              {
                id: 2,
                sessionId: 1,
                authorId: 1,
                authorName: 'Elyas',
                columnType: 'stop',
                content: 'Blocage API',
                createdAt: '2026-07-07T10:01:00.000Z',
                votesCount: 2,
              },
              {
                id: 3,
                sessionId: 1,
                authorId: 1,
                authorName: 'Elyas',
                columnType: 'continue',
                content: 'Atelier test',
                createdAt: '2026-07-07T10:02:00.000Z',
                votesCount: 1,
              },
            ],
          }),
        });
      })
    );

    renderDashboard();

    expect(await screen.findByText('Top 3 des cartes')).toBeTruthy();
    expect(screen.getAllByText('Succès').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Difficultés').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Idées').length).toBeGreaterThan(0);
    expect(screen.queryByText('Positif')).toBeNull();
    expect(screen.queryByText('Négatif')).toBeNull();
  });

  it('n\'affiche pas de formulaire d\'ajout dans la vue résultats', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => {
      if (url.endsWith('/session/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: { id: 1, name: 'Tableau de rétrospective — session 1', step: 'results', ownerId: 1 } }),
        });
      }
      return Promise.resolve(emptyCardsResponse);
    }));

    renderDashboard();

    await screen.findByText("Aucune carte n'a été ajoutée pendant cette rétrospective.");
    expect(screen.queryByPlaceholderText('Nouvelle carte...')).toBeNull();
  });
});
