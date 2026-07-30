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

const emptyActionsResponse = { ok: true, json: async () => ({ success: true, data: [] }) };

describe('SessionDashboard - Plan d\'action (Action Step)', () => {
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
    mockSocket.on.mockClear();
    ioMock.mockClear();
  });

  it('affiche le plan d\'action vide et le bouton d\'ajout pour le facilitateur', async () => {
    const fetchMock = createDashboardFetchMock({
      step: 'action',
      cardsSequence: [emptyActionsResponse],
      actionsResponse: emptyActionsResponse,
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    expect(await screen.findByText('Aucune action définie')).toBeTruthy();
    const actionBar = await screen.findByRole('toolbar', { name: "Actions de l'étape" });
    expect(within(actionBar).getByText('0 actions enregistrées')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ajouter une action' })).toBeTruthy();
  });

  it('permet au facilitateur d\'ajouter une action et de la voir apparaître groupée par priorité', async () => {
    const fetchMock = createDashboardFetchMock({
      step: 'action',
      cardsSequence: [emptyActionsResponse],
      actionsResponse: emptyActionsResponse,
      createActionResponse: {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 1,
            sessionId: 1,
            description: 'Rédiger le compte-rendu',
            owner: 'Bob',
            priority: 'high',
            deadline: null,
            createdAt: '2026-07-19T10:00:00.000Z',
          },
        }),
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    fireEvent.click(await screen.findByRole('button', { name: 'Ajouter une action' }));
    fireEvent.change(screen.getByLabelText('Description de l\'action'), {
      target: { value: 'Rédiger le compte-rendu' },
    });
    fireEvent.change(screen.getByLabelText('Responsable de l\'action'), {
      target: { value: 'Bob' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Priorité Haute' }));
    fireEvent.click(screen.getByRole('button', { name: "Ajouter l'action" }));

    // Attendre la fermeture du formulaire (signal fiable de fin de soumission)
    // plutôt que de chercher directement le texte : tant que le formulaire est
    // encore ouvert, son textarea désactivé affiche aussi "Rédiger le
    // compte-rendu", ce qui rend `findByText` ambigu et flaky sous exécution
    // lente (matché sur le champ au lieu de la carte d'action créée).
    expect(await screen.findByRole('button', { name: 'Ajouter une action' })).toBeTruthy();

    expect(screen.getByText('Rédiger le compte-rendu')).toBeTruthy();
    expect(screen.getByText('Priorité Haute')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  it('n\'affiche pas le bouton d\'ajout pour un participant non-facilitateur', async () => {
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
            data: { id: 1, name: 'Retro', code: '1234', status: 'open', step: 'action', ownerId: 1 },
          }),
        });
      }
      if (url.endsWith('/session/1/participants/resume')) {
        return Promise.resolve({ ok: true, json: async () => ({ success: true, data: { id: 9, role: 'participant' } }) });
      }
      if (url.endsWith('/session/1/participants')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: [{ id: 9, displayName: 'Sarah', role: 'participant', status: 'online' }] }),
        });
      }
      return Promise.resolve(emptyActionsResponse);
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    await screen.findByText('Aucune action définie');
    expect(screen.queryByRole('button', { name: 'Ajouter une action' })).toBeNull();
    expect(screen.queryByRole('button', { name: "Passer au plan d'action" })).toBeNull();
  });

  it('ajoute en direct une action reçue par socket', async () => {
    const fetchMock = createDashboardFetchMock({
      step: 'action',
      cardsSequence: [emptyActionsResponse],
      actionsResponse: emptyActionsResponse,
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();
    await screen.findByText('Aucune action définie');

    // Le socket ne se connecte qu'une fois l'identité résolue (appel
    // /participants/self asynchrone) : le déclenchement peut donc arriver
    // avant que l'écouteur soit enregistré. On répète le déclenchement
    // jusqu'à ce qu'il soit pris en compte (idempotent grâce à la
    // déduplication par id dans le hook).
    await vi.waitFor(() => {
      mockSocket.__trigger('session:action-added', {
        id: 42,
        sessionId: 1,
        description: 'Planifier un point hebdo',
        owner: 'Alice',
        priority: 'medium',
        deadline: null,
        createdAt: '2026-07-19T10:00:00.000Z',
      });
      expect(screen.getByText('Planifier un point hebdo')).toBeTruthy();
    });
  });

  it('affiche un bouton de transition "Passer au plan d\'action" depuis les résultats pour le facilitateur', async () => {
    const fetchMock = createDashboardFetchMock({
      step: 'results',
      cardsSequence: [emptyActionsResponse],
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    expect(await screen.findByRole('button', { name: "Passer au plan d'action" })).toBeTruthy();
  });

  it('rappelle les cartes les plus votées pendant le plan d\'action', async () => {
    const votedCardsResponse = {
      ok: true,
      json: async () => ({
        success: true,
        data: [
          { id: 1, sessionId: 1, authorId: 1, authorName: 'Elyas', columnType: 'start', content: 'Carte peu votée', createdAt: '2026-07-07T10:00:00.000Z', votesCount: 1 },
          { id: 2, sessionId: 1, authorId: 1, authorName: 'Elyas', columnType: 'stop', content: 'Carte très votée', createdAt: '2026-07-07T10:01:00.000Z', votesCount: 5 },
        ],
      }),
    };
    const fetchMock = createDashboardFetchMock({
      step: 'action',
      cardsSequence: [votedCardsResponse],
      actionsResponse: emptyActionsResponse,
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    expect(await screen.findByText('Top 5 des cartes')).toBeTruthy();
    const cards = screen.getAllByText(/Carte (peu|très) votée/);
    expect(cards[0].textContent).toBe('Carte très votée');
  });

  it('permet de choisir le nombre de cartes affichées dans le podium', async () => {
    const votedCardsResponse = {
      ok: true,
      json: async () => ({
        success: true,
        data: [
          { id: 1, sessionId: 1, authorId: 1, authorName: 'Elyas', columnType: 'start', content: 'Carte peu votée', createdAt: '2026-07-07T10:00:00.000Z', votesCount: 1 },
          { id: 2, sessionId: 1, authorId: 1, authorName: 'Elyas', columnType: 'stop', content: 'Carte très votée', createdAt: '2026-07-07T10:01:00.000Z', votesCount: 5 },
        ],
      }),
    };
    const fetchMock = createDashboardFetchMock({
      step: 'action',
      cardsSequence: [votedCardsResponse],
      actionsResponse: emptyActionsResponse,
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    expect(await screen.findByText('Top 5 des cartes')).toBeTruthy();

    const select = screen.getByRole('combobox', { name: 'Nombre de cartes affichées dans le podium' });
    fireEvent.change(select, { target: { value: '3' } });

    expect(await screen.findByText('Top 3 des cartes')).toBeTruthy();
  });

  it('permet de consulter les commentaires d\'une carte du podium pendant le plan d\'action', async () => {
    const votedCardsResponse = {
      ok: true,
      json: async () => ({
        success: true,
        data: [
          { id: 1, sessionId: 1, authorId: 1, authorName: 'Elyas', columnType: 'start', content: 'Carte du podium', createdAt: '2026-07-07T10:00:00.000Z', votesCount: 3, commentsCount: 1 },
        ],
      }),
    };
    const fetchMock = createDashboardFetchMock({
      step: 'action',
      cardsSequence: [votedCardsResponse],
      actionsResponse: emptyActionsResponse,
      commentsResponse: {
        ok: true,
        json: async () => ({
          success: true,
          data: [
            { id: 5, cardId: 1, authorId: 2, authorName: 'Sarah', content: 'Un avis pendant le plan d\'action', createdAt: '2026-07-07T10:05:00.000Z' },
          ],
        }),
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    expect(await screen.findByText('Carte du podium')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Commentaires' }));

    const section = await screen.findByRole('region', { name: 'Commentaires' });
    await within(section).findByText('Un avis pendant le plan d\'action');
  });
});
