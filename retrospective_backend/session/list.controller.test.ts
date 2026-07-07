import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../db", () => ({
  default: { execute: vi.fn() },
}));

import db from "../db";
import { listSessions } from "./list.controller";
import type { AuthRequest } from "../types";

const mockExecute = db.execute as unknown as Mock;

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
    mockExecute.mockReset();
  });

  it("renvoie 200 et une liste vide si l'utilisateur n'a aucune session", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const req = createMockRequest();
    const res = createMockResponse();

    await listSessions(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    const body = res.body as { success: boolean; data: unknown[] };
    expect(body.data).toEqual([]);
  });

  it("renvoie les sessions mappées en camelCase avec leur rôle", async () => {
    const createdAt = new Date("2026-07-08T09:00:00.000Z");
    const expiresAt = new Date("2026-07-08T10:00:00.000Z");

    mockExecute.mockResolvedValueOnce([
      [
        {
          id: 1,
          code: "1234",
          status: "open",
          expires_at: expiresAt,
          created_at: createdAt,
          role: "facilitator",
        },
        {
          id: 2,
          code: "5678",
          status: "closed",
          expires_at: expiresAt,
          created_at: createdAt,
          role: "participant",
        },
      ],
    ]);

    const req = createMockRequest();
    const res = createMockResponse();

    await listSessions(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    const body = res.body as { success: boolean; data: Array<Record<string, unknown>> };
    expect(body.data).toEqual([
      { id: 1, code: "1234", status: "open", expiresAt, createdAt, role: "facilitator" },
      { id: 2, code: "5678", status: "closed", expiresAt, createdAt, role: "participant" },
    ]);
  });

  it("renvoie 500 en cas d'erreur SQL", async () => {
    mockExecute.mockRejectedValueOnce(new Error("boom"));

    const req = createMockRequest();
    const res = createMockResponse();

    await listSessions(req, res as unknown as Response);

    expect(res.statusCode).toBe(500);
  });
});
