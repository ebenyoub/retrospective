import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../db", () => ({
  default: { execute: vi.fn() },
}));

import db from "../db";
import joinSession from "./join.controller";
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

const createMockRequest = (body: Record<string, unknown>): AuthRequest =>
  ({ user: { userId: 1, username: "Elyas" }, body }) as unknown as AuthRequest;

describe("join.controller", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("renvoie 401 si le code est manquant", async () => {
    const req = createMockRequest({ code: "" });
    const res = createMockResponse();

    await joinSession(req, res as unknown as Response);

    expect(res.statusCode).toBe(401);
  });

  it("renvoie 404 si aucune session ne correspond au code", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const req = createMockRequest({ code: "9999" });
    const res = createMockResponse();

    await joinSession(req, res as unknown as Response);

    expect(res.statusCode).toBe(404);
  });

  it("renvoie 200 si l'utilisateur a déjà rejoint la session", async () => {
    mockExecute
      .mockResolvedValueOnce([[{ id: 1 }]]) // session trouvée
      .mockResolvedValueOnce([[{ id: 5, user_id: 1, session_id: 1 }]]); // jointure déjà existante

    const req = createMockRequest({ code: "1234" });
    const res = createMockResponse();

    await joinSession(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    const body = res.body as { success: boolean; data: { joinId: number } };
    expect(body.data.joinId).toBe(5);
  });

  it("renvoie 201 et crée la jointure si l'utilisateur n'a pas encore rejoint", async () => {
    mockExecute
      .mockResolvedValueOnce([[{ id: 1 }]]) // session trouvée
      .mockResolvedValueOnce([[]]) // pas de jointure existante
      .mockResolvedValueOnce([{ affectedRows: 1, insertId: 9 }]); // insertion réussie

    const req = createMockRequest({ code: "1234" });
    const res = createMockResponse();

    await joinSession(req, res as unknown as Response);

    expect(res.statusCode).toBe(201);
    const body = res.body as { success: boolean; data: { joinId: number; sessionId: number } };
    expect(body.data.joinId).toBe(9);
    expect(body.data.sessionId).toBe(1);
  });
});
