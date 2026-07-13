import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createServer } from "http";
import type { AddressInfo } from "net";
import { io as ioClient, type Socket as ClientSocket } from "socket.io-client";
import type { Mock } from "vitest";

vi.mock("../services/participant.service", () => ({
  getParticipantsForSession: vi.fn(),
  markParticipantOffline: vi.fn(),
  findParticipantForGuestToken: vi.fn(),
}));

import { initSocket } from "./socket";
import {
  getParticipantsForSession,
  markParticipantOffline,
  findParticipantForGuestToken,
} from "../services/participant.service";

const mockGetParticipantsForSession = getParticipantsForSession as unknown as Mock;
const mockMarkParticipantOffline = markParticipantOffline as unknown as Mock;
const mockFindParticipantForGuestToken = findParticipantForGuestToken as unknown as Mock;

// Le serveur HTTP est local et éphémère (port 0, choisi par l'OS) : ce test
// ne dépend d'aucun serveur externe.
const startServer = async (): Promise<{ port: number; close: () => Promise<void> }> => {
  const httpServer = createServer();
  initSocket(httpServer, () => true);

  await new Promise<void>((resolve) => httpServer.listen(0, resolve));
  const port = (httpServer.address() as AddressInfo).port;

  return {
    port,
    close: () =>
      new Promise<void>((resolve) => {
        httpServer.closeAllConnections?.();
        httpServer.close(() => resolve());
      }),
  };
};

const connectClient = (port: number): Promise<ClientSocket> =>
  new Promise((resolve) => {
    const socket = ioClient(`http://localhost:${port}`, { transports: ["websocket"], forceNew: true });
    socket.on("connect", () => resolve(socket));
  });

const waitForEvent = <T,>(socket: ClientSocket, event: string): Promise<T> =>
  new Promise((resolve) => socket.once(event, resolve));

describe("realtime socket", () => {
  let port: number;
  let closeServer: () => Promise<void>;
  const clients: ClientSocket[] = [];

  beforeEach(async () => {
    mockGetParticipantsForSession.mockReset();
    mockMarkParticipantOffline.mockReset();
    mockFindParticipantForGuestToken.mockReset();

    const server = await startServer();
    port = server.port;
    closeServer = server.close;
  });

  afterEach(async () => {
    clients.forEach((client) => client.disconnect());
    clients.length = 0;
    await closeServer();
  });

  it("diffuse la liste à jour aux autres clients quand un second participant rejoint", async () => {
    mockFindParticipantForGuestToken.mockImplementation((_sessionId: number, guestToken: string) =>
      Promise.resolve(guestToken === "token-a" ? { id: 1, sessionId: 10 } : { id: 2, sessionId: 10 })
    );
    mockGetParticipantsForSession
      .mockResolvedValueOnce([{ id: 1, displayName: "Elyas" }])
      .mockResolvedValueOnce([{ id: 1, displayName: "Elyas" }, { id: 2, displayName: "EBNoob" }]);

    const clientA = await connectClient(port);
    clients.push(clientA);

    clientA.emit("session:join", { sessionId: 10, participantId: 1, guestToken: "token-a" });
    await waitForEvent(clientA, "session:participants-updated");

    // Le second client rejoint pendant que le premier écoute toujours.
    const updatePromiseForA = waitForEvent<Array<{ id: number }>>(clientA, "session:participants-updated");

    const clientB = await connectClient(port);
    clients.push(clientB);
    clientB.emit("session:join", { sessionId: 10, participantId: 2, guestToken: "token-b" });

    const participants = await updatePromiseForA;
    expect(participants).toHaveLength(2);
  });

  it("ignore une tentative de rejoindre avec un jeton invité invalide", async () => {
    mockFindParticipantForGuestToken.mockResolvedValueOnce(null);

    const client = await connectClient(port);
    clients.push(client);

    let received = false;
    client.on("session:participants-updated", () => {
      received = true;
    });

    client.emit("session:join", { sessionId: 10, participantId: 1, guestToken: "invalide" });
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(received).toBe(false);
    expect(mockGetParticipantsForSession).not.toHaveBeenCalled();
  });

  it("marque le participant hors ligne et diffuse la mise à jour à la déconnexion", async () => {
    mockFindParticipantForGuestToken.mockImplementation((_sessionId: number, guestToken: string) =>
      Promise.resolve(guestToken === "token-a" ? { id: 1, sessionId: 10 } : { id: 2, sessionId: 10 })
    );
    mockGetParticipantsForSession
      .mockResolvedValueOnce([{ id: 1, status: "online" }, { id: 2, status: "online" }])
      .mockResolvedValueOnce([{ id: 1, status: "online" }, { id: 2, status: "online" }])
      .mockResolvedValueOnce([{ id: 1, status: "online" }, { id: 2, status: "offline" }]);

    const clientA = await connectClient(port);
    clients.push(clientA);
    clientA.emit("session:join", { sessionId: 10, participantId: 1, guestToken: "token-a" });
    await waitForEvent(clientA, "session:participants-updated");

    const clientB = await connectClient(port);
    clientB.emit("session:join", { sessionId: 10, participantId: 2, guestToken: "token-b" });
    await waitForEvent(clientB, "session:participants-updated");

    const offlineUpdate = waitForEvent<Array<{ id: number; status: string }>>(clientA, "session:participants-updated");
    clientB.disconnect();

    const participants = await offlineUpdate;
    expect(mockMarkParticipantOffline).toHaveBeenCalledWith(2);
    expect(participants.find((p) => p.id === 2)?.status).toBe("offline");
  });
});
