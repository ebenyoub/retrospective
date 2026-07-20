import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
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

    // Desktop : panneau docké (pas un dialog modal — on peut interagir avec
    // le reste de l'écran en même temps, cf. remontée UX du panneau overlay).
    const drawer = await screen.findByRole('complementary', { name: 'Discussion' });
    expect(discussionButton.getAttribute('aria-expanded')).toBe('true');
    expect(within(drawer).getByText('0 messages')).toBeTruthy();
    expect(within(drawer).getByText('Aucun message pour le moment')).toBeTruthy();
    expect((within(drawer).getByRole('textbox', { name: 'Écrire un message' }) as HTMLTextAreaElement).disabled).toBe(false);
    expect((within(drawer).getByRole('button', { name: 'Envoyer le message' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByRole('dialog', { name: 'Participants (1)' })).toBeNull();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('complementary', { name: 'Discussion' })).toBeNull();

    fireEvent.click(discussionButton);
    const reopenedDrawer = await screen.findByRole('complementary', { name: 'Discussion' });
    // Panneau docké (pas d'overlay à cliquer) : on ferme via son propre bouton "Fermer".
    fireEvent.click(within(reopenedDrawer).getByRole('button', { name: 'Fermer' }));
    expect(screen.queryByRole('complementary', { name: 'Discussion' })).toBeNull();
  });

  it('n\'ajoute pas de fond bloquant : les cartes restent lisibles et cliquables pendant que la Discussion est ouverte', async () => {
    const fetchMock = createDashboardFetchMock({ cardsSequence: [emptyCardsResponse] });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    // Repère un élément de l'écran d'écriture, en dehors du panneau Discussion
    // (une zone de saisie par colonne : on ne teste que la première).
    const [addCardTextarea] = await screen.findAllByPlaceholderText('Nouvelle carte...');

    fireEvent.click(await screen.findByRole('button', { name: 'Discussion' }));
    await screen.findByRole('complementary', { name: 'Discussion' });

    // Panneau docké (pas d'overlay) : aucun fond cliquable ne doit exister,
    // et la zone de saisie de l'écran principal reste utilisable.
    expect(document.querySelector('.bg-black\\/45')).toBeNull();
    expect(addCardTextarea.hasAttribute('disabled')).toBe(false);
    fireEvent.change(addCardTextarea, { target: { value: 'Toujours interactif' } });
    expect((addCardTextarea as HTMLTextAreaElement).value).toBe('Toujours interactif');
  });

  it('permet d\'écrire et d\'envoyer un message au sein du chat', async () => {
    const fetchMock = createDashboardFetchMock({
      cardsSequence: [emptyCardsResponse],
      createMessageResponse: {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 100,
            sessionId: 1,
            authorId: 1,
            authorName: 'Elyas',
            content: 'Mon super message',
            createdAt: new Date().toISOString(),
          },
        }),
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    const discussionButton = await screen.findByRole('button', { name: 'Discussion' });
    fireEvent.click(discussionButton);

    const drawer = await screen.findByRole('complementary', { name: 'Discussion' });
    const textarea = within(drawer).getByRole('textbox', { name: 'Écrire un message' }) as HTMLTextAreaElement;
    const sendButton = within(drawer).getByRole('button', { name: 'Envoyer le message' }) as HTMLButtonElement;

    expect(textarea.disabled).toBe(false);
    expect(sendButton.disabled).toBe(true);

    fireEvent.change(textarea, { target: { value: 'Mon super message' } });
    expect(sendButton.disabled).toBe(false);

    fireEvent.click(sendButton);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/session/1/chat/messages'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ content: 'Mon super message' }),
      })
    );
  });


  it('ne superpose pas les panneaux Participants et Discussion', async () => {
    const fetchMock = createDashboardFetchMock({ cardsSequence: [emptyCardsResponse] });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    fireEvent.click(await screen.findByRole('button', { name: 'Participants' }));
    expect(await screen.findByRole('dialog', { name: 'Participants (1)' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Discussion' }));

    expect(await screen.findByRole('complementary', { name: 'Discussion' })).toBeTruthy();
    expect(screen.queryByRole('dialog', { name: 'Participants (1)' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Participants' }));

    expect(await screen.findByRole('dialog', { name: 'Participants (1)' })).toBeTruthy();
    expect(screen.queryByRole('complementary', { name: 'Discussion' })).toBeNull();
  });

  it('ouvre la section de commentaires depuis une carte sans compteur fictif', async () => {
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

    const commentsButton = screen.getByRole('button', { name: 'Commentaires' });
    expect(commentsButton.textContent).toBe('Commentaires');

    fireEvent.click(commentsButton);

    const section = await screen.findByRole('region', { name: 'Discussion' });
    await within(section).findByText('Aucun commentaire pour le moment.');
    expect((within(section).getByRole('textbox', { name: 'Écrire un commentaire' }) as HTMLTextAreaElement).disabled).toBe(false);
    expect((within(section).getByRole('button', { name: 'Envoyer le commentaire' }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(commentsButton);
    expect(screen.queryByRole('region', { name: 'Discussion' })).toBeNull();
  });

  it('affiche les commentaires existants et permet d\'en ajouter un', async () => {
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
                commentsCount: 1,
              },
            ],
          }),
        },
      ],
      commentsResponse: {
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: 5,
              cardId: 1,
              authorId: 2,
              authorName: 'Sarah',
              content: 'Un premier commentaire',
              createdAt: '2026-07-07T10:05:00.000Z',
            },
          ],
        }),
      },
      createCommentResponse: {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 6,
            cardId: 1,
            authorId: 1,
            authorName: 'Elyas',
            content: 'Une précision utile',
            createdAt: '2026-07-07T10:06:00.000Z',
          },
        }),
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    await screen.findByText('Carte à commenter');
    fireEvent.click(screen.getByRole('button', { name: 'Commentaires' }));

    const section = await screen.findByRole('region', { name: 'Discussion' });
    await within(section).findByText('Un premier commentaire');
    expect(within(section).getByText('Sarah')).toBeTruthy();

    const textarea = within(section).getByRole('textbox', { name: 'Écrire un commentaire' });
    fireEvent.change(textarea, { target: { value: 'Une précision utile' } });
    fireEvent.click(within(section).getByRole('button', { name: 'Envoyer le commentaire' }));

    await within(section).findByText('Une précision utile');
  });

  it("permet à l'auteur de supprimer son propre commentaire", async () => {
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
                commentsCount: 1,
              },
            ],
          }),
        },
      ],
      commentsResponse: {
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: 5,
              cardId: 1,
              authorId: 1,
              authorName: 'Elyas',
              content: 'Mon commentaire',
              createdAt: '2026-07-07T10:05:00.000Z',
            },
          ],
        }),
      },
      deleteCommentResponse: { ok: true, json: async () => ({ success: true }) },
    });
    vi.stubGlobal('fetch', fetchMock);

    renderDashboard();

    await screen.findByText('Carte à commenter');
    fireEvent.click(screen.getByRole('button', { name: 'Commentaires' }));

    const section = await screen.findByRole('region', { name: 'Discussion' });
    await within(section).findByText('Mon commentaire');

    fireEvent.click(within(section).getByRole('button', { name: 'Supprimer le commentaire' }));

    await within(section).findByText('Aucun commentaire pour le moment.');
  });
});
