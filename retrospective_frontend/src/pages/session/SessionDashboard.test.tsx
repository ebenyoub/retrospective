import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SessionDashboard from './SessionDashboard';

type SocketHandler = (payload?: unknown) => void;

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

const emptyCardsResponse = {
  ok: true,
  json: async () => ({ success: true, data: [] }),
};

const emptyRoleResponse = {
  ok: true,
  json: async () => ({ success: true, data: [] }),
};

// SessionDashboard fait deux fetch en parallèle au montage (cartes + rôle,
// GET /session). On distingue par URL/méthode plutôt que par ordre d'appel,
// pour ne pas dépendre de la course entre les deux effets.
const createDashboardFetchMock = (options: {
  cardsSequence: unknown[];
  voteResponse?: unknown;
  addCardResponse?: unknown;
  updateCardResponse?: unknown;
  deleteCardResponse?: unknown;
  step?: 'waiting' | 'writing' | 'voting' | 'results';
}) => {
  const { cardsSequence, voteResponse, addCardResponse, updateCardResponse, deleteCardResponse, step = 'writing' } = options;
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

vi.mock('@/context/auth/useAuth', () => ({
  useAuth: () => ({
    ...authState,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

const addToastMock = vi.fn();

vi.mock('@/context/toast/useToast', () => ({
  useToast: () => ({
    addToast: addToastMock,
  }),
}));

const renderDashboard = () =>
  render(
    <MemoryRouter initialEntries={['/session/1']}>
      <Routes>
        <Route path="/session/:id" element={<SessionDashboard />} />
      </Routes>
    </MemoryRouter>
  );

describe('SessionDashboard', () => {
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

  it('affiche les 3 colonnes start / stop / continue', async () => {
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

    expect(await screen.findByText('Idées')).toBeTruthy();
    expect(screen.getByText('Négatif')).toBeTruthy();
    expect(screen.getByText('Positif')).toBeTruthy();
  });

  it('affiche le code de session en permanence pendant les phases écriture/vote/résultats', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url) => {
        if (url.endsWith('/session/1')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, data: { id: 1, name: 'Retro', code: '4242', step: 'writing', ownerId: 1 } }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({ success: true, data: [] }) });
      })
    );

    renderDashboard();

    expect(await screen.findByText('Code : 4242')).toBeTruthy();
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

  it("affiche un formulaire d'ajout dans chaque colonne", async () => {
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

    await screen.findByText('Idées');

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

    await screen.findByText('Idées');
    const callsBeforeSubmit = fetchMock.mock.calls.length;

    const button = screen.getAllByRole('button', { name: 'Ajouter' })[0] as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    fireEvent.click(button);
    expect(fetchMock.mock.calls.length).toBe(callsBeforeSubmit);
  });

  it('ajoute une carte avec succès et l\'affiche dans la bonne colonne', async () => {
    const fetchMock = createDashboardFetchMock({
      cardsSequence: [
        emptyCardsResponse, // GET initial
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
        }, // GET après ajout
      ],
      addCardResponse: { ok: true, json: async () => ({ success: true, data: { cardId: 1 } }) },
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    await screen.findByText('Idées');

    const textareas = screen.getAllByPlaceholderText('Nouvelle carte...');
    const buttons = screen.getAllByRole('button', { name: 'Ajouter' });

    // Index 1 = colonne "Stop"
    fireEvent.change(textareas[1], { target: { value: 'Le daily était trop long' } });
    fireEvent.click(buttons[1]);

    expect(await screen.findByText('Le daily était trop long')).toBeTruthy();
  });

  it("affiche un toast d'erreur si l'ajout de carte est refusé par le backend", async () => {
    const fetchMock = createDashboardFetchMock({
      cardsSequence: [emptyCardsResponse],
      addCardResponse: {
        ok: false,
        json: async () => ({ success: false, message: 'Le contenu de la carte est requis.' }),
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    await screen.findByText('Idées');

    fireEvent.change(screen.getAllByPlaceholderText('Nouvelle carte...')[0], {
      target: { value: 'Carte refusée' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Ajouter' })[0]);

    await vi.waitFor(() => {
      expect(addToastMock).toHaveBeenCalledWith('error', 'Le contenu de la carte est requis.');
    });
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
        }, // GET initial
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
        }, // GET après vote
      ],
      voteResponse: { ok: true, json: async () => ({ success: true, data: { voteId: 1 } }) },
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    const voteButton = await screen.findByRole('button', { name: 'Voter' });
    addToastMock.mockClear();
    fireEvent.click(voteButton);

    expect(await screen.findByText('1 vote')).toBeTruthy();
    expect(addToastMock).not.toHaveBeenCalled();
  });

  it("affiche un toast d'erreur si le vote échoue (ex: déjà voté)", async () => {
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

  it("affiche le bouton de suppression uniquement sur les cartes de l'utilisateur connecté", async () => {
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

  it("affiche le bouton de modification uniquement sur les cartes de l'utilisateur connecté", async () => {
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
    expect(addToastMock).not.toHaveBeenCalled();
  });

  it("n'envoie pas la modification si le contenu devient vide", async () => {
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

  it("annule la modification d'une carte sans appel réseau", async () => {
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

  it("affiche un toast d'erreur si la modification est refusée par le backend", async () => {
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
    expect(addToastMock).not.toHaveBeenCalled();
  });

  it("affiche un toast d'erreur si la suppression est refusée par le backend", async () => {
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

  it('affiche le rôle de l\'utilisateur pour cette session', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.endsWith('/session/1')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: { id: 1, name: 'Tableau de rétrospective — session 1', step: 'writing', ownerId: 1 },
            }),
          });
        }
        return Promise.resolve(emptyCardsResponse);
      })
    );

    renderDashboard();

    expect(await screen.findByText('Facilitateur')).toBeTruthy();
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

    expect(await screen.findByText('Quitter la session')).toBeTruthy();

    const cards = screen.getAllByText(/Carte (peu|très) votée/);
    expect(cards[0].textContent).toBe('Carte très votée');
    expect(cards[1].textContent).toBe('Carte peu votée');
  });

  it("n'affiche pas de formulaire d'ajout dans la vue résultats", async () => {
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

    await screen.findByText('Quitter la session');
    expect(screen.queryByPlaceholderText('Nouvelle carte...')).toBeNull();
  });

  it("permet à un invité valide d'ajouter une carte en phase écriture", async () => {
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

    const textareas = await screen.findAllByPlaceholderText('Nouvelle carte...');
    fireEvent.change(textareas[2], { target: { value: 'Carte invitée' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Ajouter' })[2]);

    expect(await screen.findByText('Carte invitée')).toBeTruthy();
    expect(fetchMock.mock.calls.some(([url, init]) => (
      String(url).endsWith('/cards')
      && init?.method === 'POST'
      && (init.headers as Record<string, string>)['x-guest-token'] === 'guest-9'
    ))).toBe(true);
    expect(localStorage.getItem('retro:guest:1')).toContain('guest-9');
  });

  it("permet à un invité valide de voter puis de voir les résultats", async () => {
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
    // La carte apparaît à la fois dans le Top 3 et dans sa colonne de catégorie.
    expect(screen.getAllByText('Carte à voter').length).toBeGreaterThan(0);
  });

  it("propose de rejoindre avec un pseudo si le visiteur ouvre le lien d'invitation sans guestToken (jamais de redirection)", async () => {
    authState.isAuthenticated = false;
    authState.token = '';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { id: 1, name: 'Retro', code: '1234', status: 'open', step: 'writing', ownerId: 1 } }),
    }));

    render(
      <MemoryRouter initialEntries={['/session/1']}>
        <Routes>
          <Route path="/" element={<p>Accueil</p>} />
          <Route path="/session/:id" element={<SessionDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('dialog')).toBeTruthy();
    expect(screen.getByLabelText('Pseudo')).toBeTruthy();
    expect(screen.queryByText('Accueil')).toBeNull();
  });

  it("repropose le formulaire de pseudo (sans redirection) si le guestToken stocké ne correspond plus à cette session", async () => {
    authState.isAuthenticated = false;
    authState.token = '';
    localStorage.setItem('retro:guest:1', JSON.stringify({ participantId: 9, guestToken: 'autre-session', displayName: 'Sarah' }));
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.endsWith('/session/1/participants/resume')) {
        return Promise.resolve({ ok: false, json: async () => ({ success: false, message: 'Participant introuvable.' }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true, data: { id: 1, name: 'Retro', code: '1234', status: 'open', step: 'writing', ownerId: 1 } }) });
    }));

    render(
      <MemoryRouter initialEntries={['/session/1']}>
        <Routes>
          <Route path="/" element={<p>Accueil</p>} />
          <Route path="/session/:id" element={<SessionDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('dialog')).toBeTruthy();
    expect(screen.queryByText('Accueil')).toBeNull();
    expect(localStorage.getItem('retro:guest:1')).toBeNull();
  });

  it("un invité qui rejoint via le lien d'invitation direct atteint l'écran d'écriture au lancement de la session", async () => {
    authState.isAuthenticated = false;
    authState.token = '';

    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      const method = init?.method ?? 'GET';

      if (url.endsWith('/session/1/participants/guest-join')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: { id: 9, displayName: 'Sarah', role: 'participant', guestToken: 'guest-9' } }),
        });
      }
      if (url.endsWith('/session/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: { id: 1, name: 'Retro', code: '1234', status: 'open', step: 'waiting', ownerId: 1 } }),
        });
      }
      if (url.endsWith('/session/1/participants')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: [{ id: 9, displayName: 'Sarah', role: 'participant', status: 'online' }] }),
        });
      }
      if (method === 'GET' && url.endsWith('/cards')) {
        return Promise.resolve({ ok: true, json: async () => ({ success: true, data: [] }) });
      }

      return Promise.resolve({ ok: true, json: async () => ({ success: true, data: [] }) });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/session/1']}>
        <Routes>
          <Route path="/" element={<p>Accueil</p>} />
          <Route path="/session/:id" element={<SessionDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(await screen.findByLabelText('Pseudo'), { target: { value: 'Sarah' } });
    fireEvent.click(screen.getByRole('button', { name: 'Rejoindre la session' }));

    await screen.findByText('En attente du lancement par le facilitateur...');
    expect(localStorage.getItem('retro:guest:1')).toContain('guest-9');

    mockSocket.__trigger('session:started', { step: 'writing' });

    expect(await screen.findAllByPlaceholderText('Nouvelle carte...')).toHaveLength(3);
  });
});
