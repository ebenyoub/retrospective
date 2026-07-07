import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("./session.service", () => ({
  getSessionsForUser: vi.fn(),
}));

import { getSessionsForUser } from "./session.service";
import { listSessions } from "./list.controller";
import type { AuthRequest } from '../src/types';

const mockGetSessionsForUser = getSessionsForUser as unknown as Mock;

const createMockResponse = () => {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code;
      return res as unknown as Response;
    },
    json(payload: unknown) {
      res.body = payload;
      return res as unknown as Response;
    },
  };
  return res;
};

const createMockRequest = (): AuthRequest =>
  ({ user: { userId: 1, username: "Elyas" } }) as unknown as AuthRequest;

describe("list.controller", () => {
  beforeEach(() => {
    mockGetSessionsForUser.mockReset();
  });

  it("renvoie 200 et une liste vide si le service ne renvoie aucune session", async () => {
    mockGetSessionsForUser.mockResolvedValueOnce([]);

    const req = createMockRequest();
    const res = createMockResponse();

    await listSessions(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    const body = res.body as { success: boolean; data: unknown[] };
    expect(body.data).toEqual([]);
  });

  it("renvoie 200 et les sessions telles que fournies par le service", async () => {
    const createdAt = new Date("2026-07-08T09:00:00.000Z");
    const expiresAt = new Date("2026-07-08T10:00:00.000Z");
    const sessions = [
      { id: 1, code: "1234", status: "open", expiresAt, createdAt, role: "facilitator" as const },
    ];
    mockGetSessionsForUser.mockResolvedValueOnce(sessions);

    const req = createMockRequest();
    const res = createMockResponse();

    await listSessions(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    const body = res.body as { success: boolean; data: unknown[] };
    expect(body.data).toEqual(sessions);
    expect(mockGetSessionsForUser).toHaveBeenCalledWith(1);
  });

  it("ne capture pas les erreurs du service (remontée au middleware d'erreur)", async () => {
    mockGetSessionsForUser.mockRejectedValueOnce(new Error("boom"));

    const req = createMockRequest();
    const res = createMockResponse();

    await expect(listSessions(req, res as unknown as Response)).rejects.toThrow("boom");
  });
});
