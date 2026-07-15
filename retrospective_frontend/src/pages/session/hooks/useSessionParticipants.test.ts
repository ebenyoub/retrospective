import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

type Handler = (...args: unknown[]) => void;

const { mockSocket, ioMock } = vi.hoisted(() => {
  const listeners: Record<string, Handler[]> = {};
  const socket = {
    on: vi.fn((event: string, cb: Handler) => {
      (listeners[event] ??= []).push(cb);
    }),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    __trigger: (event: string, payload?: unknown) => {
      (listeners[event] ?? []).forEach((cb) => cb(payload));
    },
    __listeners: listeners,
  };
  return { mockSocket: socket, ioMock: vi.fn(() => socket) };
});

vi.mock('socket.io-client', () => ({ io: ioMock }));

import { useSessionParticipants } from './useSessionParticipants';

const jsonResponse = (body: unknown) => ({ ok: true, json: async () => body });

describe('useSessionParticipants', () => {
  beforeEach(() => {
    ioMock.mockClear();
    mockSocket.on.mockClear();
    mockSocket.off.mockClear();
    mockSocket.emit.mockClear();
    mockSocket.disconnect.mockClear();
    Object.keys(mockSocket.__listeners).forEach((key) => delete mockSocket.__listeners[key]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ne fait rien tant qu'aucune identité (self) n'est fournie", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    renderHook(() => useSessionParticipants('1', null));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(ioMock).not.toHaveBeenCalled();
  });

  it('récupère la liste initiale par API puis rejoint la room via socket', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      jsonResponse({ success: true, data: [{ id: 1, displayName: 'Elyas' }] })
    );
    vi.stubGlobal('fetch', fetchMock);

    const self = { participantId: 1 };
    const { result } = renderHook(() => useSessionParticipants('1', self));

    await waitFor(() => expect(result.current.participants).toHaveLength(1));
    // L'authentification passe par le cookie (credentials), plus par un token.
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/session/1/participants',
      expect.objectContaining({ credentials: 'include' })
    );

    mockSocket.__trigger('connect');
    expect(mockSocket.emit).toHaveBeenCalledWith('session:join', {
      sessionId: 1,
      participantId: 1,
      guestToken: undefined,
    });
  });

  it("met à jour la liste quand l'événement session:participants-updated arrive", async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(jsonResponse({ success: true, data: [] })));

    const self = { participantId: 2, guestToken: 'gtok' };
    const { result } = renderHook(() => useSessionParticipants('1', self));

    await waitFor(() => expect(mockSocket.on).toHaveBeenCalledWith('session:participants-updated', expect.any(Function)));

    mockSocket.__trigger('session:participants-updated', [{ id: 2, displayName: 'EBNoob' }]);

    await waitFor(() => expect(result.current.participants).toEqual([{ id: 2, displayName: 'EBNoob' }]));
  });

  it('appelle onSessionStarted quand le socket reçoit session:started', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(jsonResponse({ success: true, data: [] })));
    const onSessionStarted = vi.fn();
    const self = { participantId: 1, token: 'tok' };

    renderHook(() => useSessionParticipants('1', self, { onSessionStarted }));

    await waitFor(() => expect(mockSocket.on).toHaveBeenCalledWith('session:started', expect.any(Function)));

    mockSocket.__trigger('session:started', { step: 'writing' });

    expect(onSessionStarted).toHaveBeenCalledWith('writing');
  });

  it('déconnecte le socket et retire les listeners au démontage (nettoyage)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(jsonResponse({ success: true, data: [] })));

    // Référence stable entre les rendus, comme le fait SessionDashboard via
    // useMemo : sinon un objet recréé à chaque rendu rouvrirait le socket.
    const self = { participantId: 1, token: 'tok' };
    const { unmount } = renderHook(() => useSessionParticipants('1', self));

    await waitFor(() => expect(ioMock).toHaveBeenCalledTimes(1));

    unmount();

    expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
    expect(mockSocket.off).toHaveBeenCalledWith('session:participants-updated', expect.any(Function));
  });
});
