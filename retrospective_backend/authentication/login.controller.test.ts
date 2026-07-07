import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../db", () => ({
  default: { execute: vi.fn() },
}));

vi.mock("bcrypt", () => ({
  default: { compare: vi.fn() },
}));

import db from "../db";
import bcrypt from "bcrypt";
import { login } from "./login.controller";

const mockExecute = db.execute as unknown as Mock;
const mockCompare = bcrypt.compare as unknown as Mock;

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

const createMockRequest = (body: Record<string, unknown>) =>
  ({ body }) as unknown as Parameters<typeof login>[0];

describe("login.controller", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  beforeEach(() => {
    mockExecute.mockReset();
    mockCompare.mockReset();
  });

  it("renvoie 400 si le pseudo ou le mot de passe est manquant", async () => {
    const req = createMockRequest({ username: "", password: "" });
    const res = createMockResponse();

    await login(req, res as unknown as Response);

    expect(res.statusCode).toBe(400);
  });

  it("renvoie 401 si le pseudo est inconnu", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const req = createMockRequest({ username: "inconnu", password: "secret123" });
    const res = createMockResponse();

    await login(req, res as unknown as Response);

    expect(res.statusCode).toBe(401);
  });

  it("renvoie 401 si le mot de passe est incorrect", async () => {
    mockExecute.mockResolvedValueOnce([
      [{ id: 1, username: "Elyas", hash_password: "hash", email: "e@test.com" }],
    ]);
    mockCompare.mockResolvedValueOnce(false);

    const req = createMockRequest({ username: "Elyas", password: "mauvais" });
    const res = createMockResponse();

    await login(req, res as unknown as Response);

    expect(res.statusCode).toBe(401);
  });

  it("renvoie 200 et un token si les identifiants sont corrects", async () => {
    mockExecute.mockResolvedValueOnce([
      [{ id: 1, username: "Elyas", hash_password: "hash", email: "e@test.com" }],
    ]);
    mockCompare.mockResolvedValueOnce(true);

    const req = createMockRequest({ username: "Elyas", password: "bonMotDePasse" });
    const res = createMockResponse();

    await login(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    const body = res.body as { success: boolean; data: { token: string } };
    expect(body.success).toBe(true);
    expect(typeof body.data.token).toBe("string");
  });
});
