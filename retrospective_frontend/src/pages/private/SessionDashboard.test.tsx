import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SessionDashboard from './SessionDashboard';

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
}) => {
  const { cardsSequence, voteResponse, addCardResponse, updateCardResponse, deleteCardResponse } = options;
  let cardsCallIndex = 0;

  return vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET';

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
    isAuthenticated: true,
    token: 'test-token',
    userId: 1,
    username: 'Elyas',
    email: 'e@test.com',
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
  });

  it('affiche les 3 colonnes start / stop / continue', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      })
    );

    renderDashboard();

    expect(await screen.findByText('Start')).toBeTruthy();
    expect(screen.getByText('Stop')).toBeTruthy();
    expect(screen.getByText('Continue')).toBeTruthy();
  });

  it('affiche un état vide si aucune carte', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
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
              columnType: 'start',
              content: 'Faire plus de pair programming',
              createdAt: '2026-07-07T10:00:00.000Z',
              votesCount: 0,
            },
            {
              id: 2,
              sessionId: 1,
              authorId: 2,
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
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(emptyCardsResponse));

    renderDashboard();

    await screen.findByText('Start');

    expect(screen.getAllByPlaceholderText('Nouvelle carte...')).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: 'Ajouter' })).toHaveLength(3);
  });

  it('refuse un contenu vide (validation Zod, aucun appel réseau supplémentaire)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(emptyCardsResponse);
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    await screen.findByText('Start');
    const callsBeforeSubmit = fetchMock.mock.calls.length;

    fireEvent.click(screen.getAllByRole('button', { name: 'Ajouter' })[0]);

    expect(await screen.findByText('Le contenu de la carte est requis.')).toBeTruthy();
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

    await screen.findByText('Start');

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

    await screen.findByText('Start');

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
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: 1,
              sessionId: 1,
              authorId: 1,
              columnType: 'start',
              content: 'Faire plus de pair programming',
              createdAt: '2026-07-07T10:00:00.000Z',
              votesCount: 3,
            },
          ],
        }),
      })
    );

    renderDashboard();

    expect(await screen.findByText('3 votes')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Voter' })).toBeTruthy();
  });

  it('vote avec succès et rafraîchit les cartes', async () => {
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

    fireEvent.click(await screen.findByRole('button', { name: 'Voter' }));

    expect(await screen.findByText('1 vote')).toBeTruthy();
    expect(addToastMock).not.toHaveBeenCalled();
  });

  it("affiche un toast d'erreur si le vote échoue (ex: déjà voté)", async () => {
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
              columnType: 'start',
              content: 'Ma carte',
              createdAt: '2026-07-07T10:00:00.000Z',
              votesCount: 0,
            },
            {
              id: 2,
              sessionId: 1,
              authorId: 2,
              columnType: 'stop',
              content: "Carte d'un autre participant",
              createdAt: '2026-07-07T10:01:00.000Z',
              votesCount: 0,
            },
          ],
        }),
      })
    );

    renderDashboard();

    expect(await screen.findByText('Ma carte')).toBeTruthy();
    expect(screen.getByText("Carte d'un autre participant")).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Supprimer' })).toHaveLength(1);
  });

  it("affiche le bouton de modification uniquement sur les cartes de l'utilisateur connecté", async () => {
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
              columnType: 'start',
              content: 'Ma carte',
              createdAt: '2026-07-07T10:00:00.000Z',
              votesCount: 0,
            },
            {
              id: 2,
              sessionId: 1,
              authorId: 2,
              columnType: 'stop',
              content: "Carte d'un autre participant",
              createdAt: '2026-07-07T10:01:00.000Z',
              votesCount: 0,
            },
          ],
        }),
      })
    );

    renderDashboard();

    expect(await screen.findByText('Ma carte')).toBeTruthy();
    expect(screen.getByText("Carte d'un autre participant")).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Modifier' })).toHaveLength(1);
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

    fireEvent.click(await screen.findByRole('button', { name: 'Modifier' }));
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
        if (url.endsWith('/session')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: [{ id: 1, code: '1234', status: 'open', role: 'facilitator' }],
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
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: 1,
              sessionId: 1,
              authorId: 1,
              columnType: 'start',
              content: 'Carte peu votée',
              createdAt: '2026-07-07T10:00:00.000Z',
              votesCount: 1,
            },
            {
              id: 2,
              sessionId: 1,
              authorId: 1,
              columnType: 'stop',
              content: 'Carte très votée',
              createdAt: '2026-07-07T10:01:00.000Z',
              votesCount: 5,
            },
          ],
        }),
      })
    );

    renderDashboard();

    await screen.findByText('Start');
    fireEvent.click(screen.getByRole('button', { name: 'Voir les résultats' }));

    expect(await screen.findByText('Résultats')).toBeTruthy();

    const cards = screen.getAllByText(/Carte (peu|très) votée/);
    expect(cards[0].textContent).toBe('Carte très votée');
    expect(cards[1].textContent).toBe('Carte peu votée');
  });

  it("n'affiche pas de formulaire d'ajout dans la vue résultats", async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(emptyCardsResponse));

    renderDashboard();

    await screen.findByText('Start');
    fireEvent.click(screen.getByRole('button', { name: 'Voir les résultats' }));

    await screen.findByText('Résultats');
    expect(screen.queryByPlaceholderText('Nouvelle carte...')).toBeNull();
  });
});
