import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, fireEvent, render, within, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import SessionDashboard from '../SessionDashboard';
import {
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

describe('SessionDashboard - Salle d\'attente (Waiting Step)', () => {
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

  it('un facilitateur connecté qui quitte la salle d\'attente reste connecté, garde son JWT, et navigue vers l\'accueil', async () => {
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

    const leaveBtn = await screen.findByRole('button', { name: 'Quitter la session' });
    fireEvent.click(leaveBtn);

    expect(await screen.findByText("Page d'accueil")).toBeTruthy();
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\/session\/1\/participants\/9$/),
      expect.objectContaining({ method: 'DELETE' })
    );
    expect(screen.getByTestId('location-state').textContent).toBe(JSON.stringify(null));
    expect(authState.token).toBe('facilitator-token');
    expect(authState.isAuthenticated).toBe(true);
  });

  it('un participant invité qui quitte la salle d\'attente est nettoyé et navigue vers l\'accueil', async () => {
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

    const leaveBtn = await screen.findByRole('button', { name: 'Quitter la session' });
    fireEvent.click(leaveBtn);

    expect(await screen.findByText("Page d'accueil")).toBeTruthy();
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\/session\/1\/participants\/9$/),
      expect.objectContaining({ method: 'DELETE' })
    );
    expect(localStorage.getItem('retro:guest:1')).toBeNull();
  });

  it('propose de rejoindre avec un pseudo si le visiteur ouvre le lien d\'invitation sans guestToken (jamais de redirection)', async () => {
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

  it('repropose le formulaire de pseudo (sans redirection) si le guestToken stocké ne correspond plus à cette session', async () => {
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

  it('un invité qui rejoint via le lien d\'invitation direct atteint l\'écran d\'écriture au lancement de la session', async () => {
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

    // Le socket applicatif ne s'établit qu'une fois l'identité résolue,
    // légèrement après le rendu : on attend l'abonnement réel avant de
    // déclencher l'événement, pour ne pas tester dans le vide (flaky sinon).
    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith('session:started', expect.any(Function));
    });

    mockSocket.__trigger('session:started', { step: 'writing' });

    expect(await screen.findAllByPlaceholderText('Nouvelle carte...')).toHaveLength(3);
  });

  it('ouvre le panneau Discussion depuis la navbar pendant la salle d\'attente', async () => {
    authState.isAuthenticated = true;
    authState.token = 'facilitator-token';

    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
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
      if (url.endsWith('/session/1/chat/messages')) {
        return Promise.resolve({ ok: true, json: async () => ({ success: true, data: [] }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true, data: [] }) });
    }));

    render(
      <MemoryRouter initialEntries={['/session/1']}>
        <Routes>
          <Route path="/session/:id" element={<SessionDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByRole('button', { name: 'Lancer la rétro' });
    expect(screen.queryByRole('heading', { name: 'Discussion' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Discussion' }));

    expect(await screen.findByRole('heading', { name: 'Discussion' })).toBeTruthy();
  });

  it('masque les boutons Participants et code de session de la navbar pendant la salle d\'attente, déjà présents dans le panneau latéral', async () => {
    authState.isAuthenticated = true;
    authState.token = 'facilitator-token';

    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
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
    }));

    render(
      <MemoryRouter initialEntries={['/session/1']}>
        <Routes>
          <Route path="/session/:id" element={<SessionDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByRole('button', { name: 'Lancer la rétro' });

    const navbar = screen.getByRole('navigation', { name: 'Contexte de session' });
    expect(within(navbar).queryByRole('button', { name: 'Participants' })).toBeNull();
    expect(within(navbar).queryByLabelText(/Copier le code de session|Code copié/)).toBeNull();
    expect(within(navbar).getByRole('button', { name: 'Discussion' })).toBeTruthy();
  });
});
