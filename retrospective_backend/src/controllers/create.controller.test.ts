import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../models/db", () => ({
  default: { execute: vi.fn() },
}));

import db from '../models/db';
import { createSession } from "./create.controller";
import type { AuthRequest } from '../types';

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

const createMockRequest = (userId?: number): AuthRequest =>
  ({ user: userId ? { userId, username: "Elyas" } : {} }) as unknown as AuthRequest;

describe("create.controller", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("renvoie 401 si userId est absent du token", async () => {
    const req = createMockRequest(undefined);
    const res = createMockResponse();

    await createSession(req, res as unknown as Response);

    expect(res.statusCode).toBe(401);
  });

  it("renvoie 200 et réutilise une session active existante", async () => {
    mockExecute
      .mockResolvedValueOnce([{ changedRows: 0, affectedRows: 0 }]) // update sessions expirées
      .mockResolvedValueOnce([[{ id: 1, code: "1234", owner_id: 1, status: "open" }]]); // session active trouvée

    const req = createMockRequest(1);
    const res = createMockResponse();

    await createSession(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    const body = res.body as { success: boolean; data: { code: string } };
    expect(body.success).toBe(true);
    expect(body.data.code).toBe("1234");
  });

  it("renvoie 201 et crée une nouvelle session si aucune n'est active", async () => {
    mockExecute
      .mockResolvedValueOnce([{ changedRows: 0, affectedRows: 0 }]) // update sessions expirées
      .mockResolvedValueOnce([[]]) // aucune session active
      .mockResolvedValueOnce([{ insertId: 7 }]); // insertion de la nouvelle session

    const req = createMockRequest(1);
    const res = createMockResponse();

    await createSession(req, res as unknown as Response);

    expect(res.statusCode).toBe(201);
    const body = res.body as { success: boolean; data: { sessionId: number; code: string } };
    expect(body.success).toBe(true);
    expect(body.data.sessionId).toBe(7);
    expect(body.data.code).toMatch(/^\d{4}$/);
  });
});
