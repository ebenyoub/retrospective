import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, fireEvent, within, render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SessionDashboard from '../SessionDashboard';
import {
  emptyCardsResponse,
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

describe('SessionDashboard - Configuration, Initialisation & Routage', () => {
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
    expect(within(contextBar).getByText('Rétro sprint 12')).toBeTruthy();
    expect(within(contextBar).getAllByText('Écriture des cartes').length).toBeGreaterThan(0);
    expect(within(contextBar).getByRole('button', { name: 'Copier le code de session' })).toBeTruthy();
    expect(within(contextBar).getByRole('button', { name: 'Participants' })).toBeTruthy();
    expect(within(contextBar).getByRole('button', { name: 'Discussion' })).toBeTruthy();

    expect(within(contextBar).queryByText(/carte.*au total/)).toBeNull();
    expect(within(contextBar).queryByText('05:00')).toBeNull();
    expect(within(contextBar).queryByRole('button', { name: /Passer au vote/ })).toBeNull();
  });

  it('le bouton Retour ramène à l\'accueil sans supprimer la participation', async () => {
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
    // La participation est conservée : aucun DELETE — la reprise reste possible.
    expect(fetchSpy).not.toHaveBeenCalledWith(
      expect.stringMatching(/\/session\/1\/participants\/1$/),
      expect.objectContaining({ method: 'DELETE' })
    );
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

  it("force l'étape résultats et affiche un message informatif si la session est fermée", async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.endsWith('/session/1')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: { id: 1, name: 'Session Fermée', step: 'writing', ownerId: 1, status: 'closed' },
            }),
          });
        }
        return Promise.resolve(emptyCardsResponse);
      })
    );

    renderDashboard();

    expect(await screen.findByText("Aucune carte n'a été ajoutée pendant cette rétrospective.")).toBeTruthy();
    expect(screen.getAllByText('Résultats').length).toBeGreaterThan(0);
    expect(addToastMock).toHaveBeenCalledWith('success', 'Cette rétrospective est terminée. Vous consultez ses résultats.');
  });
});
