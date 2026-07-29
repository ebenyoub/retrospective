import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import {
  createDashboardFetchMock,
  renderDashboard,
} from './sessionTestUtils';

const { ioMock, authState } = vi.hoisted(() => ({
  ioMock: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  })),
  authState: {
    isAuthenticated: true,
    token: 'test-token',
    userId: 1,
    username: 'Elyas',
    email: 'e@test.com',
  },
}));

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

describe('SessionDashboard - Summary Step', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    addToastMock.mockReset();
    authState.isAuthenticated = true;
    authState.token = 'test-token';
    authState.userId = 1;
    authState.username = 'Elyas';
    authState.email = 'e@test.com';
    localStorage.clear();
    ioMock.mockClear();
  });

  it('affiche le récapitulatif final avec statistiques, top cartes, participants et actions', async () => {
    const fetchMock = createDashboardFetchMock({
      step: 'summary',
      cardsSequence: [
        {
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
                content: 'Documenter la définition de done',
                createdAt: '2026-07-21T10:00:00.000Z',
                votesCount: 4,
                commentsCount: 2,
              },
              {
                id: 2,
                sessionId: 1,
                authorId: 2,
                authorName: 'Sarah',
                columnType: 'stop',
                content: 'Limiter les changements de périmètre en sprint',
                createdAt: '2026-07-21T10:05:00.000Z',
                votesCount: 2,
                commentsCount: 1,
              },
            ],
          }),
        },
      ],
      actionsResponse: {
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: 11,
              sessionId: 1,
              description: 'Planifier un point de suivi hebdomadaire',
              owner: 'Alice',
              priority: 'high',
              deadline: '2026-07-30',
              createdAt: '2026-07-21T11:00:00.000Z',
            },
          ],
        }),
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    expect(await screen.findByText('✓ Prêt à clôturer')).toBeTruthy();
    expect(screen.getByText('Top 3 des cartes')).toBeTruthy();
    expect(screen.getByText('Documenter la définition de done')).toBeTruthy();
    expect(screen.getByText('Limiter les changements de périmètre en sprint')).toBeTruthy();
    expect(await screen.findByText('Planifier un point de suivi hebdomadaire')).toBeTruthy();
    expect(screen.getByText('Alice')).toBeTruthy();
  });

  it('masque la barre d’actions summary pour un participant non facilitateur tout en laissant le récap lisible', async () => {
    authState.isAuthenticated = false;
    localStorage.setItem(
      'retro:guest:1',
      JSON.stringify({ participantId: 9, guestToken: 'guest-9', displayName: 'Sarah' })
    );

    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.endsWith('/session/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              id: 1,
              name: 'Retro',
              joinCode: '1234',
              status: 'open',
              step: 'summary',
              ownerId: 1,
              formatName: 'Commencer / Arrêter / Continuer',
              formatColumns: ['Commencer', 'Arrêter', 'Continuer'],
              stepDurationMinutes: 5,
              stepEndsAt: null,
            },
          }),
        });
      }
      if (url.endsWith('/session/1/participants/resume')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: { id: 9, role: 'participant' } }),
        });
      }
      if (url.endsWith('/session/1/participants')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: [{ id: 9, sessionId: 1, displayName: 'Sarah', role: 'participant', status: 'online' }],
          }),
        });
      }
      if (url.includes('/actions')) {
        return Promise.resolve({ ok: true, json: async () => ({ success: true, data: [] }) });
      }
      if (url.includes('/chat/messages')) {
        return Promise.resolve({ ok: true, json: async () => ({ success: true, data: [] }) });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    expect(await screen.findByText('Récapitulatif final')).toBeTruthy();
    expect(screen.queryByRole('toolbar', { name: "Actions de l'étape" })).toBeNull();
    expect(screen.getByText("Aucune action n'a été définie.")).toBeTruthy();
  });

  it('propose la transition action vers summary au facilitateur', async () => {
    const fetchMock = createDashboardFetchMock({
      step: 'action',
      cardsSequence: [{ ok: true, json: async () => ({ success: true, data: [] }) }],
      actionsResponse: { ok: true, json: async () => ({ success: true, data: [] }) },
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    const actionBar = await screen.findByRole('toolbar', { name: "Actions de l'étape" });
    expect(within(actionBar).getByRole('button', { name: 'Voir le récapitulatif' })).toBeTruthy();
  });
});
