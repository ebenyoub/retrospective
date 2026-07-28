import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import {
  createDashboardFetchMock,
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

describe('SessionDashboard - Distribution des votes (Voting Step)', () => {
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

  it('rend les votes restants, le timer et le bouton principal dans la barre d\'actions en vote', async () => {
    const fetchMock = createDashboardFetchMock({
      step: 'voting',
      // Échéance absolue fournie par le backend : le timer affiche le restant.
      stepEndsAt: new Date(Date.now() + 270 * 1000).toISOString(),
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
                content: 'Carte déjà votée',
                createdAt: '2026-07-07T10:00:00.000Z',
                votesCount: 1,
                votedByMe: true,
              },
            ],
          }),
        },
      ],
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    const actionBar = await screen.findByRole('toolbar', { name: "Actions de l'étape" });
    expect(within(actionBar).getByRole('status', { name: '4 votes restants sur 5' })).toBeTruthy();
    expect(within(actionBar).getByText(/04:(29|30)/)).toBeTruthy();
    expect(within(actionBar).getByRole('button', { name: /Voir les résultats/ })).toBeTruthy();
  });

  it('affiche le nombre de votes et un bouton "Voter" sur chaque carte', async () => {
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
                step: 'voting',
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
                content: 'Faire plus de pair programming',
                createdAt: '2026-07-07T10:00:00.000Z',
                votesCount: 3,
              },
            ],
          }),
        });
      })
    );

    renderDashboard();

    expect(await screen.findByText('3 votes')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Voter' })).toBeTruthy();
  });

  it('vote avec succès et rafraîchit les cartes', async () => {
    const fetchMock = createDashboardFetchMock({
      step: 'voting',
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
                content: 'Faire plus de pair programming',
                createdAt: '2026-07-07T10:00:00.000Z',
                votesCount: 0,
              },
            ],
          }),
        },
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
                content: 'Faire plus de pair programming',
                createdAt: '2026-07-07T10:00:00.000Z',
                votesCount: 1,
              },
            ],
          }),
        },
      ],
      voteResponse: {
        ok: true,
        json: async () => ({ success: true, data: { voteId: 1, votesUsed: 1, votesLeft: 4, cardVotesCount: 1 } }),
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    const voteButton = await screen.findByRole('button', { name: 'Voter' });
    addToastMock.mockClear();
    fireEvent.click(voteButton);

    expect(await screen.findByText('1 vote')).toBeTruthy();
  });

  it('synchronise immédiatement le quota et l’état de vote après un vote', async () => {
    const fetchMock = createDashboardFetchMock({
      step: 'voting',
      cardsSequence: [
        {
          ok: true,
          json: async () => ({ success: true, data: [{
            id: 1, sessionId: 1, authorId: 1, authorName: 'Elyas', columnType: 'start',
            content: 'Carte', createdAt: '2026-07-07T10:00:00.000Z', votesCount: 0, votedByMe: false,
          }] }),
        },
        {
          ok: true,
          json: async () => ({ success: true, data: [{
            id: 1, sessionId: 1, authorId: 1, authorName: 'Elyas', columnType: 'start',
            content: 'Carte', createdAt: '2026-07-07T10:00:00.000Z', votesCount: 1, votedByMe: true,
          }] }),
        },
      ],
      voteResponse: {
        ok: true,
        json: async () => ({ success: true, data: { voteId: 1, votesUsed: 1, votesLeft: 4, cardVotesCount: 1 } }),
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();
    fireEvent.click(await screen.findByRole('button', { name: 'Voter' }));

    expect(await screen.findByRole('status', { name: '4 votes restants sur 5' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Voté' })).toBeTruthy();
  });

  it('rafraîchit les cartes après le passage à l’étape de vote', async () => {
    const fetchMock = createDashboardFetchMock({
      step: 'writing',
      cardsSequence: [
        {
          ok: true,
          json: async () => ({ success: true, data: [{
            id: 1, sessionId: 1, authorId: 1, authorName: 'Elyas', columnType: 'start',
            content: 'Carte avant la transition', createdAt: '2026-07-07T10:00:00.000Z', votesCount: 0,
          }] }),
        },
        {
          ok: true,
          json: async () => ({ success: true, data: [{
            id: 2, sessionId: 1, authorId: 2, authorName: 'Sarah', columnType: 'start',
            content: 'Carte reçue après la transition', createdAt: '2026-07-07T10:01:00.000Z', votesCount: 0,
          }] }),
        },
      ],
      stepResponse: {
        ok: true,
        json: async () => ({ success: true, data: { step: 'voting', stepEndsAt: null } }),
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    expect(await screen.findByText('Carte avant la transition')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Passer au vote' }));

    expect(await screen.findByText('Carte reçue après la transition')).toBeTruthy();
    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/session/1/step'),
        expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ step: 'voting' }) })
      );
    });
  });

  it('affiche un toast d\'erreur si le vote échoue (ex: déjà voté)', async () => {
    const fetchMock = createDashboardFetchMock({
      step: 'voting',
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
                content: 'Faire plus de pair programming',
                createdAt: '2026-07-07T10:00:00.000Z',
                votesCount: 1,
              },
            ],
          }),
        },
      ],
      voteResponse: {
        ok: false,
        json: async () => ({ success: false, message: 'Vous avez déjà voté pour cette carte' }),
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    fireEvent.click(await screen.findByRole('button', { name: 'Voter' }));

    await vi.waitFor(() => {
      expect(addToastMock).toHaveBeenCalledWith('error', 'Vous avez déjà voté pour cette carte');
    });
  });

  it('permet à un invité valide de voter puis de voir les résultats', async () => {
    authState.isAuthenticated = false;
    authState.token = '';
    localStorage.setItem('retro:guest:1', JSON.stringify({ participantId: 9, guestToken: 'guest-9', displayName: 'Sarah' }));
    let voteDone = false;

    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.endsWith('/session/1')) {
        return Promise.resolve({ ok: true, json: async () => ({ success: true, data: { id: 1, name: 'Retro', code: '1234', status: 'open', step: 'voting', ownerId: 1 } }) });
      }
      if (url.endsWith('/session/1/participants/resume')) {
        return Promise.resolve({ ok: true, json: async () => ({ success: true, data: { id: 9, role: 'participant' } }) });
      }
      if (url.endsWith('/session/1/participants')) {
        return Promise.resolve({ ok: true, json: async () => ({ success: true, data: [{ id: 9, displayName: 'Sarah', role: 'participant', status: 'online' }] }) });
      }
      if (String(url).includes('/vote')) {
        voteDone = true;
        return Promise.resolve({ ok: true, json: async () => ({ success: true, data: { voteId: 7 } }) });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: [{
            id: 5,
            sessionId: 1,
            authorId: 1,
            authorName: 'Elyas',
            columnType: 'start',
            content: 'Carte à voter',
            createdAt: '2026-07-07T10:00:00.000Z',
            votesCount: voteDone ? 1 : 0,
          }],
        }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    fireEvent.click(await screen.findByRole('button', { name: 'Voter' }));
    expect(await screen.findByText('1 vote')).toBeTruthy();

    mockSocket.__trigger('session:started', { step: 'results' });
    await vi.waitFor(() => {
      expect(screen.getAllByText('Résultats').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('Carte à voter').length).toBeGreaterThan(0);
  });
});
