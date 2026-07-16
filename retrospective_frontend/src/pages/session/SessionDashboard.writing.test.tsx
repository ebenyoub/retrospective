import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import {
  emptyCardsResponse,
  createDashboardFetchMock,
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

describe('SessionDashboard - Écriture des cartes (Writing Step)', () => {
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

  it('rend le compteur, le timer et le bouton principal dans la barre d\'actions en écriture', async () => {
    const fetchMock = createDashboardFetchMock({
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
                content: 'Une carte',
                createdAt: '2026-07-07T10:00:00.000Z',
                votesCount: 0,
              },
              {
                id: 2,
                sessionId: 1,
                authorId: 1,
                authorName: 'Elyas',
                columnType: 'continue',
                content: 'Une autre carte',
                createdAt: '2026-07-07T10:01:00.000Z',
                votesCount: 0,
              },
            ],
          }),
        },
      ],
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    const actionBar = await screen.findByRole('toolbar', { name: "Actions de l'étape" });
    expect(actionBar).toBeTruthy();
  });

  it('affiche un état vide si aucune carte', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url) => {
        if (url.endsWith('/session/1')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, data: { id: 1, name: 'Tableau de rétrospective — session 1', step: 'writing', ownerId: 1 } }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: [] }),
        });
      })
    );

    renderDashboard();

    expect(await screen.findAllByText(/Aucun/)).toHaveLength(3);
  });

  it('affiche les cartes reçues, réparties dans la bonne colonne', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
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
            {
              id: 2,
              sessionId: 1,
              authorId: 2,
              authorName: 'Autre participant',
              columnType: 'stop',
              content: 'Le daily était trop long',
              createdAt: '2026-07-07T10:01:00.000Z',
              votesCount: 2,
            },
          ],
        }),
      })
    );

    renderDashboard();

    expect(await screen.findByText('Faire plus de pair programming')).toBeTruthy();
    expect(screen.getByText('Le daily était trop long')).toBeTruthy();
  });

  it('affiche un formulaire d\'ajout dans chaque colonne', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => {
      if (url.endsWith('/session/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: { id: 1, name: 'Tableau de rétrospective — session 1', step: 'writing', ownerId: 1 } }),
        });
      }
      return Promise.resolve(emptyCardsResponse);
    }));

    renderDashboard();

    await screen.findByText('Commencer');

    expect(screen.getAllByPlaceholderText('Nouvelle carte...')).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: 'Ajouter' })).toHaveLength(3);
  });

  it('refuse un contenu vide (bouton désactivé, aucun appel réseau supplémentaire)', async () => {
    const fetchMock = vi.fn().mockImplementation((url) => {
      if (url.endsWith('/session/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: { id: 1, name: 'Tableau de rétrospective — session 1', step: 'writing', ownerId: 1 } }),
        });
      }
      return Promise.resolve(emptyCardsResponse);
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    await screen.findByText('Commencer');
    const callsBeforeSubmit = fetchMock.mock.calls.length;

    const button = screen.getAllByRole('button', { name: 'Ajouter' })[0] as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    fireEvent.click(button);
    expect(fetchMock.mock.calls.length).toBe(callsBeforeSubmit);
  });

  it('ajoute une carte avec succès et l\'affiche dans la bonne colonne', async () => {
    const fetchMock = createDashboardFetchMock({
      cardsSequence: [
        emptyCardsResponse,
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
                columnType: 'stop',
                content: 'Le daily était trop long',
                createdAt: '2026-07-07T10:01:00.000Z',
                votesCount: 0,
              },
            ],
          }),
        },
      ],
      addCardResponse: { ok: true, json: async () => ({ success: true, data: { cardId: 1 } }) },
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    await screen.findByText('Commencer');

    const textareas = screen.getAllByPlaceholderText('Nouvelle carte...');
    const buttons = screen.getAllByRole('button', { name: 'Ajouter' });

    fireEvent.change(textareas[1], { target: { value: 'Le daily était trop long' } });
    fireEvent.click(buttons[1]);

    expect(await screen.findByText('Le daily était trop long')).toBeTruthy();
  });

  it('conserve les clés techniques des cartes avec un format français personnalisé', async () => {
    const fetchMock = createDashboardFetchMock({
      cardsSequence: [emptyCardsResponse],
      addCardResponse: { ok: true, json: async () => ({ success: true, data: { cardId: 1 } }) },
      formatName: 'Succès / Difficultés / Idées',
      formatColumns: ['Succès', 'Difficultés', 'Idées'],
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    await screen.findByText('Succès');

    const textareas = screen.getAllByPlaceholderText('Nouvelle carte...');
    const buttons = screen.getAllByRole('button', { name: 'Ajouter' });

    fireEvent.change(textareas[0], { target: { value: 'Carte succès' } });
    fireEvent.click(buttons[0]);
    fireEvent.change(textareas[1], { target: { value: 'Carte difficulté' } });
    fireEvent.click(buttons[1]);
    fireEvent.change(textareas[2], { target: { value: 'Carte idée' } });
    fireEvent.click(buttons[2]);

    await vi.waitFor(() => {
      const cardPayloads = fetchMock.mock.calls
        .filter(([url, init]) => String(url).endsWith('/cards') && init?.method === 'POST')
        .map(([, init]) => JSON.parse(String(init?.body)));

      expect(cardPayloads).toEqual([
        { content: 'Carte succès', columnType: 'start' },
        { content: 'Carte difficulté', columnType: 'stop' },
        { content: 'Carte idée', columnType: 'continue' },
      ]);
    });
  });

  it('affiche un toast d\'erreur si l\'ajout de carte est refusé par le backend', async () => {
    const fetchMock = createDashboardFetchMock({
      cardsSequence: [emptyCardsResponse],
      addCardResponse: {
        ok: false,
        json: async () => ({ success: false, message: 'Le contenu de la carte est requis.' }),
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    await screen.findByText('Commencer');

    fireEvent.change(screen.getAllByPlaceholderText('Nouvelle carte...')[0], {
      target: { value: 'Carte refusée' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Ajouter' })[0]);

    await vi.waitFor(() => {
      expect(addToastMock).toHaveBeenCalledWith('error', 'Le contenu de la carte est requis.');
    });
  });

  it('affiche le bouton de suppression uniquement sur les cartes de l\'utilisateur connecté', async () => {
    vi.stubGlobal('fetch', createDashboardFetchMock({
      cardsSequence: [{
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
              content: 'Ma carte',
              createdAt: '2026-07-07T10:00:00.000Z',
              votesCount: 0,
            },
            {
              id: 2,
              sessionId: 1,
              authorId: 2,
              authorName: 'Autre participant',
              columnType: 'stop',
              content: "Carte d'un autre participant",
              createdAt: '2026-07-07T10:01:00.000Z',
              votesCount: 0,
            },
          ],
        }),
      }],
    }));

    renderDashboard();

    expect(await screen.findByText('Ma carte')).toBeTruthy();
    expect(screen.getByText("Carte d'un autre participant")).toBeTruthy();
    await vi.waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Supprimer' })).toHaveLength(1);
    });
  });

  it('affiche le bouton de modification uniquement sur les cartes de l\'utilisateur connecté', async () => {
    vi.stubGlobal('fetch', createDashboardFetchMock({
      cardsSequence: [{
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
              content: 'Ma carte',
              createdAt: '2026-07-07T10:00:00.000Z',
              votesCount: 0,
            },
            {
              id: 2,
              sessionId: 1,
              authorId: 2,
              authorName: 'Autre participant',
              columnType: 'stop',
              content: "Carte d'un autre participant",
              createdAt: '2026-07-07T10:01:00.000Z',
              votesCount: 0,
            },
          ],
        }),
      }],
    }));

    renderDashboard();

    expect(await screen.findByText('Ma carte')).toBeTruthy();
    expect(screen.getByText("Carte d'un autre participant")).toBeTruthy();
    await vi.waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Modifier' })).toHaveLength(1);
    });
  });

  it('modifie une carte avec succès et rafraîchit les cartes', async () => {
    const fetchMock = createDashboardFetchMock({
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
                content: 'Ancien contenu',
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
                content: 'Nouveau contenu',
                createdAt: '2026-07-07T10:00:00.000Z',
                votesCount: 0,
              },
            ],
          }),
        },
      ],
      updateCardResponse: { ok: true, json: async () => ({ success: true, message: 'Carte modifiée.' }) },
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    const editButton = await screen.findByRole('button', { name: 'Modifier' });
    addToastMock.mockClear();
    fireEvent.click(editButton);
    fireEvent.change(screen.getByLabelText('Modifier le contenu de la carte'), {
      target: { value: 'Nouveau contenu' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByText('Nouveau contenu')).toBeTruthy();
    expect(screen.queryByText('Ancien contenu')).toBeNull();
  });

  it('n\'envoie pas la modification si le contenu devient vide', async () => {
    const fetchMock = createDashboardFetchMock({
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
                content: 'Carte à modifier',
                createdAt: '2026-07-07T10:00:00.000Z',
                votesCount: 0,
              },
            ],
          }),
        },
      ],
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    fireEvent.click(await screen.findByRole('button', { name: 'Modifier' }));
    fireEvent.change(screen.getByLabelText('Modifier le contenu de la carte'), {
      target: { value: '   ' },
    });

    expect((screen.getByRole('button', { name: 'Enregistrer' }) as HTMLButtonElement).disabled).toBe(true);
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(false);
  });

  it('annule la modification d\'une carte sans appel réseau', async () => {
    const fetchMock = createDashboardFetchMock({
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
                content: 'Carte à modifier',
                createdAt: '2026-07-07T10:00:00.000Z',
                votesCount: 0,
              },
            ],
          }),
        },
      ],
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    fireEvent.click(await screen.findByRole('button', { name: 'Modifier' }));
    fireEvent.change(screen.getByLabelText('Modifier le contenu de la carte'), {
      target: { value: 'Texte ignoré' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(screen.getByText('Carte à modifier')).toBeTruthy();
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(false);
  });

  it('affiche un toast d\'erreur si la modification est refusée par le backend', async () => {
    const fetchMock = createDashboardFetchMock({
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
                content: 'Carte à modifier',
                createdAt: '2026-07-07T10:00:00.000Z',
                votesCount: 0,
              },
            ],
          }),
        },
      ],
      updateCardResponse: {
        ok: false,
        json: async () => ({ success: false, message: 'Vous ne pouvez modifier que vos propres cartes.' }),
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    fireEvent.click(await screen.findByRole('button', { name: 'Modifier' }));
    fireEvent.change(screen.getByLabelText('Modifier le contenu de la carte'), {
      target: { value: 'Nouveau contenu' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await vi.waitFor(() => {
      expect(addToastMock).toHaveBeenCalledWith('error', 'Vous ne pouvez modifier que vos propres cartes.');
    });
  });

  it('supprime une carte avec succès et rafraîchit les cartes', async () => {
    const fetchMock = createDashboardFetchMock({
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
                content: 'Carte à supprimer',
                createdAt: '2026-07-07T10:00:00.000Z',
                votesCount: 0,
              },
            ],
          }),
        },
        emptyCardsResponse,
      ],
      deleteCardResponse: { ok: true, json: async () => ({ success: true, message: 'Carte supprimée.' }) },
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    fireEvent.click(await screen.findByRole('button', { name: 'Supprimer' }));

    await vi.waitFor(() => {
      expect(screen.queryByText('Carte à supprimer')).toBeNull();
    });
  });

  it('affiche un toast d\'erreur si la suppression est refusée par le backend', async () => {
    const fetchMock = createDashboardFetchMock({
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
                content: 'Carte à supprimer',
                createdAt: '2026-07-07T10:00:00.000Z',
                votesCount: 0,
              },
            ],
          }),
        },
      ],
      deleteCardResponse: {
        ok: false,
        json: async () => ({ success: false, message: 'Vous ne pouvez supprimer que vos propres cartes.' }),
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    fireEvent.click(await screen.findByRole('button', { name: 'Supprimer' }));

    await vi.waitFor(() => {
      expect(addToastMock).toHaveBeenCalledWith('error', 'Vous ne pouvez supprimer que vos propres cartes.');
    });
  });

  it('permet à un invité valide d\'ajouter une carte en phase écriture', async () => {
    authState.isAuthenticated = false;
    authState.token = '';
    localStorage.setItem('retro:guest:1', JSON.stringify({ participantId: 9, guestToken: 'guest-9', displayName: 'Sarah' }));

    const fetchMock = createDashboardFetchMock({
      step: 'writing',
      cardsSequence: [
        emptyCardsResponse,
        {
          ok: true,
          json: async () => ({
            success: true,
            data: [{
              id: 11,
              sessionId: 1,
              authorId: 9,
              authorName: 'Sarah',
              columnType: 'start',
              content: 'Carte invitée',
              createdAt: '2026-07-07T10:00:00.000Z',
              votesCount: 0,
            }],
          }),
        },
      ],
      addCardResponse: { ok: true, json: async () => ({ success: true, data: { cardId: 11 } }) },
    }).mockImplementation((url: string, init?: RequestInit) => {
      if (url.endsWith('/session/1/participants/resume')) {
        return Promise.resolve({ ok: true, json: async () => ({ success: true, data: { id: 9, role: 'participant' } }) });
      }
      return createDashboardFetchMock({
        step: 'writing',
        cardsSequence: [
          emptyCardsResponse,
          {
            ok: true,
            json: async () => ({
              success: true,
              data: [{
                id: 11,
                sessionId: 1,
                authorId: 9,
                authorName: 'Sarah',
                columnType: 'start',
                content: 'Carte invitée',
                createdAt: '2026-07-07T10:00:00.000Z',
                votesCount: 0,
              }],
            }),
          },
        ],
        addCardResponse: { ok: true, json: async () => ({ success: true, data: { cardId: 11 } }) },
      })(url, init);
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    await vi.waitFor(() => {
      expect(fetchMock.mock.calls.some(([url]) => String(url).endsWith('/session/1/participants/resume'))).toBe(true);
    });

    const textareas = await screen.findAllByPlaceholderText('Nouvelle carte...');
    fireEvent.change(textareas[0], { target: { value: 'Carte invitée' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Ajouter' })[0]);

    expect(await screen.findByText('Carte invitée')).toBeTruthy();
    expect(fetchMock.mock.calls.some(([url, init]) => (
      String(url).endsWith('/cards')
      && init?.method === 'POST'
      && (init.headers as Record<string, string>)['x-guest-token'] === 'guest-9'
    ))).toBe(true);
    expect(localStorage.getItem('retro:guest:1')).toContain('guest-9');
  });
});
