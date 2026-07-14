import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
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
  formatName?: string;
  formatColumns?: string[];
}) => {
  const {
    cardsSequence,
    voteResponse,
    addCardResponse,
    updateCardResponse,
    deleteCardResponse,
    step = 'writing',
    formatName = 'Commencer / Arrêter / Continuer',
    formatColumns = ['Commencer', 'Arrêter', 'Continuer'],
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

  it('affiche les 3 colonnes du format par défaut', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url) => {
        if (url.endsWith('/session/1')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: {
                id: 1,
                name: 'Tableau de rétrospective — session 1',
                step: 'writing',
                ownerId: 1,
                formatName: 'Commencer / Arrêter / Continuer',
                formatColumns: ['Commencer', 'Arrêter', 'Continuer'],
              },
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: [] }),
        });
      })
    );

    renderDashboard();

    expect(await screen.findByText('Commencer')).toBeTruthy();
    expect(screen.getByText('Arrêter')).toBeTruthy();
    expect(screen.getByText('Continuer')).toBeTruthy();
  });

  it('affiche les 3 colonnes du format choisi pour la session', async () => {
    const fetchMock = createDashboardFetchMock({
      cardsSequence: [emptyCardsResponse],
      formatName: 'Succès / Difficultés / Idées',
      formatColumns: ['Succès', 'Difficultés', 'Idées'],
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    expect(await screen.findByText('Succès')).toBeTruthy();
    expect(screen.getByText('Difficultés')).toBeTruthy();
    expect(screen.getByText('Idées')).toBeTruthy();
  });

  it('affiche les colonnes si formatColumns est renvoyé sous forme de JSON', async () => {
    const fetchMock = createDashboardFetchMock({
      cardsSequence: [emptyCardsResponse],
      formatName: 'Conserver / Améliorer / Innover',
      formatColumns: ['Conserver', 'Améliorer', 'Innover'],
    }).mockImplementation((url: string, init?: RequestInit) => {
      if (url.endsWith('/session/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              id: 1,
              name: 'Tableau de rétrospective — session 1',
              step: 'writing',
              ownerId: 1,
              formatName: 'Conserver / Améliorer / Innover',
              formatColumns: JSON.stringify(['Conserver', 'Améliorer', 'Innover']),
            },
          }),
        });
      }

      return createDashboardFetchMock({
        cardsSequence: [emptyCardsResponse],
      })(url, init);
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    expect(await screen.findByText('Conserver')).toBeTruthy();
    expect(screen.getByText('Améliorer')).toBeTruthy();
    expect(screen.getByText('Innover')).toBeTruthy();
  });

  it('normalise les anciens libellés Start / Stop / Continue en français', async () => {
    const fetchMock = createDashboardFetchMock({
      cardsSequence: [emptyCardsResponse],
      formatName: 'Start / Stop / Continue',
      formatColumns: ['Start', 'Stop', 'Continue'],
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    expect(await screen.findByText('Commencer')).toBeTruthy();
    expect(screen.getByText('Arrêter')).toBeTruthy();
    expect(screen.getByText('Continuer')).toBeTruthy();
    expect(screen.queryByText('Start')).toBeNull();
    expect(screen.queryByText('Stop')).toBeNull();
    expect(screen.queryByText('Continue')).toBeNull();
  });

  it('affiche le code de session en permanence pendant les phases écriture/vote/résultats', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

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

    const copyButton = await screen.findByRole('button', { name: 'Copier le code de session' });
    expect(copyButton.textContent).toContain('4242');

    fireEvent.click(copyButton);
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith('4242'));
  });

  it('sépare le contexte de session des actions de l’étape', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url) => {
        if (url.endsWith('/session/1')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: {
                id: 1,
                name: 'Rétro sprint 12',
                code: '4242',
                step: 'writing',
                ownerId: 1,
              },
            }),
          });
        }
        if (url.endsWith('/session/1/participants')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: [
                { id: 1, sessionId: 1, displayName: 'Elyas', role: 'facilitator', status: 'online' },
                { id: 2, sessionId: 1, displayName: 'Samia', role: 'participant', status: 'online' },
              ],
            }),
          });
        }
        return Promise.resolve(emptyCardsResponse);
      })
    );

    renderDashboard();

    const contextBar = await screen.findByRole('navigation', { name: 'Contexte de session' });

    expect(within(contextBar).getByRole('button', { name: 'Retour' })).toBeTruthy();
    expect(within(contextBar).getByText('Range ta chambre')).toBeTruthy();
    expect(within(contextBar).getByText('Rétro sprint 12')).toBeTruthy();
    expect(within(contextBar).getAllByText('Écriture des cartes').length).toBeGreaterThan(0);
    expect(within(contextBar).getByRole('button', { name: 'Copier le code de session' })).toBeTruthy();
    expect(within(contextBar).getByRole('button', { name: 'Participants' })).toBeTruthy();
    expect(within(contextBar).getByRole('button', { name: 'Discussion' })).toBeTruthy();

    expect(within(contextBar).queryByText(/carte.*au total/)).toBeNull();
    expect(within(contextBar).queryByText('05:00')).toBeNull();
    expect(within(contextBar).queryByRole('button', { name: /Passer au vote/ })).toBeNull();
  });

  it('ouvre et ferme le panneau Participants depuis la barre de contexte', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url) => {
        if (url.endsWith('/session/1')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: {
                id: 1,
                name: 'Rétro sprint 12',
                code: '4242',
                step: 'writing',
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
              data: [
                { id: 1, sessionId: 1, displayName: 'Elyas', role: 'facilitator', status: 'online' },
                { id: 2, sessionId: 1, displayName: 'Samia', role: 'participant', status: 'offline' },
              ],
            }),
          });
        }
        return Promise.resolve(emptyCardsResponse);
      })
    );

    renderDashboard();

    const participantsButton = await screen.findByRole('button', { name: 'Participants' });
    expect(participantsButton.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(participantsButton);

    const drawer = await screen.findByRole('dialog', { name: 'Participants (2)' });
    expect(participantsButton.getAttribute('aria-expanded')).toBe('true');
    expect(within(drawer).getByText('Elyas')).toBeTruthy();
    expect(within(drawer).getByText('Samia')).toBeTruthy();
    expect(within(drawer).getByText('Facilitateur')).toBeTruthy();
    expect(within(drawer).getByText('Participant')).toBeTruthy();
    expect(within(drawer).getByText('1 en ligne')).toBeTruthy();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Participants (2)' })).toBeNull();

    fireEvent.click(participantsButton);
    expect(await screen.findByRole('dialog', { name: 'Participants (2)' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Fermer le panneau Participants' }));
    expect(screen.queryByRole('dialog', { name: 'Participants (2)' })).toBeNull();
  });

  it('ouvre et ferme le panneau Discussion sans mélanger les participants', async () => {
    const fetchMock = createDashboardFetchMock({ cardsSequence: [emptyCardsResponse] });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    const discussionButton = await screen.findByRole('button', { name: 'Discussion' });
    expect(discussionButton.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(discussionButton);

    const drawer = await screen.findByRole('dialog', { name: 'Discussion' });
    expect(discussionButton.getAttribute('aria-expanded')).toBe('true');
    expect(within(drawer).getByText('0 message')).toBeTruthy();
    expect(within(drawer).getByText('Aucun message pour le moment')).toBeTruthy();
    expect((within(drawer).getByRole('textbox', { name: 'Écrire un message' }) as HTMLTextAreaElement).disabled).toBe(true);
    expect((within(drawer).getByRole('button', { name: 'Envoyer le message' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByRole('dialog', { name: 'Participants (1)' })).toBeNull();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Discussion' })).toBeNull();

    fireEvent.click(discussionButton);
    expect(await screen.findByRole('dialog', { name: 'Discussion' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Fermer le panneau Discussion' }));
    expect(screen.queryByRole('dialog', { name: 'Discussion' })).toBeNull();
  });

  it('ne superpose pas les panneaux Participants et Discussion', async () => {
    const fetchMock = createDashboardFetchMock({ cardsSequence: [emptyCardsResponse] });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    fireEvent.click(await screen.findByRole('button', { name: 'Participants' }));
    expect(await screen.findByRole('dialog', { name: 'Participants (1)' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Discussion' }));

    expect(await screen.findByRole('dialog', { name: 'Discussion' })).toBeTruthy();
    expect(screen.queryByRole('dialog', { name: 'Participants (1)' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Participants' }));

    expect(await screen.findByRole('dialog', { name: 'Participants (1)' })).toBeTruthy();
    expect(screen.queryByRole('dialog', { name: 'Discussion' })).toBeNull();
  });

  it('ouvre le modal de commentaires depuis une carte sans compteur fictif', async () => {
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
                content: 'Carte à commenter',
                createdAt: '2026-07-07T10:00:00.000Z',
                votesCount: 2,
              },
            ],
          }),
        },
      ],
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    await screen.findByText('Carte à commenter');
    expect(screen.getByText('2 votes')).toBeTruthy();

    const commentsButton = screen.getByRole('button', { name: 'Ouvrir les commentaires' });
    expect(commentsButton.textContent).toBe('Commentaires');

    fireEvent.click(commentsButton);

    const modal = await screen.findByRole('dialog', { name: 'Carte à commenter' });
    expect(within(modal).getByText('Idées')).toBeTruthy();
    expect(within(modal).getByText('Elyas')).toBeTruthy();
    expect(within(modal).getByText('Aucun commentaire disponible')).toBeTruthy();
    expect((within(modal).getByRole('textbox', { name: 'Écrire un commentaire' }) as HTMLTextAreaElement).disabled).toBe(true);
    expect((within(modal).getByRole('button', { name: 'Envoyer le commentaire' }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(within(modal).getByRole('button', { name: 'Fermer les commentaires' }));
    expect(screen.queryByRole('dialog', { name: 'Carte à commenter' })).toBeNull();
  });

  it("rend le compteur, le timer et le bouton principal dans la barre d'actions en écriture", async () => {
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
    const contextBar = await screen.findByRole('navigation', { name: 'Contexte de session' });

    expect(within(actionBar).getByText('2 cartes au total')).toBeTruthy();
    expect(within(actionBar).getByText('05:00')).toBeTruthy();
    expect(within(actionBar).getByRole('button', { name: /Passer au vote/ })).toBeTruthy();

    expect(within(contextBar).queryByText('2 cartes au total')).toBeNull();
    expect(within(contextBar).queryByText('05:00')).toBeNull();
    expect(screen.getAllByRole('toolbar', { name: "Actions de l'étape" })).toHaveLength(1);
  });

  it("rend les votes restants, le timer et le bouton principal dans la barre d'actions en vote", async () => {
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
    const contextBar = await screen.findByRole('navigation', { name: 'Contexte de session' });

    expect(within(actionBar).getByRole('status', { name: '4 votes restants sur 5' })).toBeTruthy();
    expect(within(actionBar).getByText('04:30')).toBeTruthy();
    expect(within(actionBar).getByRole('button', { name: /Voir les résultats/ })).toBeTruthy();

    expect(within(contextBar).queryByRole('status', { name: '4 votes restants sur 5' })).toBeNull();
    expect(within(contextBar).queryByText('04:30')).toBeNull();
    expect(screen.getAllByRole('toolbar', { name: "Actions de l'étape" })).toHaveLength(1);
  });

  it('permet de quitter une session démarrée depuis le bouton Retour de la barre contexte', async () => {
    const fetchSpy = vi.fn().mockImplementation((url, init) => {
      const method = init?.method ?? 'GET';
      if (method === 'DELETE' && url.endsWith('/session/1/participants/1')) {
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      }
      if (url.endsWith('/session/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              id: 1,
              name: 'Tableau de rétrospective — session 1',
              code: '4242',
              step: 'writing',
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
      return Promise.resolve(emptyCardsResponse);
    });
    vi.stubGlobal('fetch', fetchSpy);

    render(
      <MemoryRouter initialEntries={['/session/1']}>
        <Routes>
          <Route path="/" element={<p>Page d'accueil</p>} />
          <Route path="/session/:id" element={<SessionDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    await vi.waitFor(() => {
      expect(fetchSpy.mock.calls.some(([url]) => String(url).endsWith('/session/1/participants/self'))).toBe(true);
      expect(fetchSpy.mock.calls.some(([url]) => String(url).endsWith('/session/1/participants'))).toBe(true);
    });

    const backButton = screen.getByRole('button', { name: 'Retour' });
    fireEvent.click(backButton);

    expect(await screen.findByText("Page d'accueil")).toBeTruthy();
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\/session\/1\/participants\/1$/),
      expect.objectContaining({ method: 'DELETE' })
    );
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

    await screen.findByText('Commencer');

    const textareas = screen.getAllByPlaceholderText('Nouvelle carte...');
    const buttons = screen.getAllByRole('button', { name: 'Ajouter' });

    // Index 1 = colonne "Arrêter" (clé technique stop)
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

    await screen.findByText('Commencer');

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

  it("n'affiche pas le rôle dans la barre de contexte de session", async () => {
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

    const contextBar = await screen.findByRole('navigation', { name: 'Contexte de session' });
    expect(within(contextBar).queryByText('Facilitateur')).toBeNull();
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

    await screen.findByText("Aucune carte n'a été ajoutée pendant cette rétrospective.");
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

  it("redirige vers /sessions si authentifié et affiche une erreur si l'identifiant de session est invalide", async () => {
    authState.isAuthenticated = true;
    authState.token = 'test-token';
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    render(
      <MemoryRouter initialEntries={['/session/undefined']}>
        <Routes>
          <Route path="/" element={<p>Accueil</p>} />
          <Route path="/sessions" element={<p>Sessions</p>} />
          <Route path="/session/:id" element={<SessionDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Sessions')).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(addToastMock).toHaveBeenCalledWith('error', 'Session invalide ou non spécifiée.');
  });

  it("redirige vers l'accueil si non authentifié et affiche une erreur si l'identifiant de session est invalide", async () => {
    authState.isAuthenticated = false;
    authState.token = '';
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    render(
      <MemoryRouter initialEntries={['/session/undefined']}>
        <Routes>
          <Route path="/" element={<p>Accueil</p>} />
          <Route path="/sessions" element={<p>Sessions</p>} />
          <Route path="/session/:id" element={<SessionDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Accueil')).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(addToastMock).toHaveBeenCalledWith('error', 'Session invalide ou non spécifiée.');
  });

  it("un facilitateur connecté qui quitte la salle d'attente reste connecté, garde son JWT, et navigue vers l'accueil avec fromSessions", async () => {
    authState.isAuthenticated = true;
    authState.token = 'facilitator-token';

    const fetchSpy = vi.fn().mockImplementation((url, init) => {
      const method = init?.method ?? 'GET';
      if (method === 'DELETE' && url.endsWith('/session/1/participants/9')) {
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      }
      if (url.endsWith('/session/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: { id: 1, name: 'Retro', code: '1234', status: 'open', step: 'waiting', ownerId: 1 } }),
        });
      }
      if (url.endsWith('/session/1/participants/self')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: { id: 9, role: 'facilitator' } }),
        });
      }
      if (url.endsWith('/session/1/participants')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: [{ id: 9, displayName: 'Elyas', role: 'facilitator', status: 'online' }] }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true, data: [] }) });
    });
    vi.stubGlobal('fetch', fetchSpy);

    const LocationDisplay = () => {
      const location = useLocation();
      return (
        <>
          <p>Page d'accueil</p>
          <output data-testid="location-state">{JSON.stringify(location.state)}</output>
        </>
      );
    };

    render(
      <MemoryRouter initialEntries={['/session/1']}>
        <Routes>
          <Route path="/" element={<LocationDisplay />} />
          <Route path="/session/:id" element={<SessionDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    // On attend le rendu de la salle d'attente
    const leaveBtn = await screen.findByRole('button', { name: 'Quitter la session' });
    fireEvent.click(leaveBtn);

    // Vérifie qu'on navigue bien vers l'accueil
    expect(await screen.findByText("Page d'accueil")).toBeTruthy();
    // Vérifie que l'appel DELETE a bien été fait
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\/session\/1\/participants\/9$/),
      expect.objectContaining({ method: 'DELETE' })
    );
    // L'état de navigation fromSessions doit être présent pour bloquer la boucle
    expect(screen.getByTestId('location-state').textContent).toBe(JSON.stringify({ fromSessions: true }));
    // Le token du facilitateur ne doit pas avoir été effacé
    expect(authState.token).toBe('facilitator-token');
    expect(authState.isAuthenticated).toBe(true);
  });

  it("un participant invité qui quitte la salle d'attente est nettoyé et navigue vers l'accueil", async () => {
    authState.isAuthenticated = false;
    authState.token = '';
    localStorage.setItem('retro:guest:1', JSON.stringify({ participantId: 9, guestToken: 'guest-9', displayName: 'Sarah' }));

    const fetchSpy = vi.fn().mockImplementation((url, init) => {
      const method = init?.method ?? 'GET';
      if (method === 'DELETE' && url.endsWith('/session/1/participants/9')) {
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      }
      if (url.endsWith('/session/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: { id: 1, name: 'Retro', code: '1234', status: 'open', step: 'waiting', ownerId: 1 } }),
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
          json: async () => ({ success: true, data: [{ id: 9, displayName: 'Sarah', role: 'participant', status: 'online' }] }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true, data: [] }) });
    });
    vi.stubGlobal('fetch', fetchSpy);

    render(
      <MemoryRouter initialEntries={['/session/1']}>
        <Routes>
          <Route path="/" element={<p>Page d'accueil</p>} />
          <Route path="/session/:id" element={<SessionDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    // On attend le rendu de la salle d'attente
    const leaveBtn = await screen.findByRole('button', { name: 'Quitter la session' });
    fireEvent.click(leaveBtn);

    // Vérifie qu'on navigue bien vers l'accueil
    expect(await screen.findByText("Page d'accueil")).toBeTruthy();
    // Vérifie que l'appel DELETE a bien été fait
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\/session\/1\/participants\/9$/),
      expect.objectContaining({ method: 'DELETE' })
    );
    // L'identité de l'invité a été nettoyée du localStorage
    expect(localStorage.getItem('retro:guest:1')).toBeNull();
  });
});
