import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
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

describe('SessionDashboard - Tiroirs et Modals (Panes)', () => {
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
});
