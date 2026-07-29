import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import {
  emptyCardsResponse,
  renderDashboard,
  type SocketHandler,
} from './sessionTestUtils';

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

  it('permet de consulter les commentaires d\'une carte depuis l\'écran Résultats', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string, init?: RequestInit) => {
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
                step: 'results',
                ownerId: 1,
              },
            }),
          });
        }
        if (method === 'GET' && url.includes('/comments')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: [
                { id: 5, cardId: 1, authorId: 2, authorName: 'Sarah', content: 'Un avis sur cette carte', createdAt: '2026-07-07T10:05:00.000Z' },
              ],
            }),
          });
        }
        if (url.endsWith('/cards')) {
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
                  content: 'Carte à commenter',
                  createdAt: '2026-07-07T10:00:00.000Z',
                  votesCount: 1,
                  commentsCount: 1,
                },
              ],
            }),
          });
        }

        return Promise.resolve({ ok: true, json: async () => ({ success: true, data: [] }) });
      })
    );

    renderDashboard();

    expect(await screen.findByText('Top 3 des cartes')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Commentaires' }));

    const section = await screen.findByRole('region', { name: 'Discussion' });
    await within(section).findByText('Un avis sur cette carte');
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

  it('permet au facilitateur de revenir à l\'étape précédente après confirmation', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.endsWith('/session/1/step') && init?.method === 'PATCH') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: { step: 'voting', stepEndsAt: null } }),
        });
      }
      if (url.endsWith('/session/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: { id: 1, name: 'Tableau de rétrospective — session 1', code: '1234', status: 'open', step: 'results', ownerId: 1 },
          }),
        });
      }
      return Promise.resolve(emptyCardsResponse);
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    const backButton = await screen.findByRole('button', { name: 'Étape précédente' });
    fireEvent.click(backButton);

    expect(await screen.findByText('Revenir à l\'étape précédente ?')).toBeTruthy();
    expect(screen.getByText(/l'étape « Vote »/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Revenir en arrière' }));

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/session/1/step'),
        expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ step: 'voting' }) })
      );
    });
  });
});
