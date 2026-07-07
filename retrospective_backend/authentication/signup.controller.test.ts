import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../db", () => ({
  default: { execute: vi.fn() },
}));

vi.mock("bcrypt", () => ({
  default: { hash: vi.fn() },
}));

import db from "../db";
import bcrypt from "bcrypt";
import { signup } from "./signup.controller";

const mockExecute = db.execute as unknown as Mock;
const mockHash = bcrypt.hash as unknown as Mock;

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
  ({ body }) as unknown as Parameters<typeof signup>[0];

describe("signup.controller", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  beforeEach(() => {
    mockExecute.mockReset();
    mockHash.mockReset();
  });

  it("renvoie 400 si un champ est manquant", async () => {
    const req = createMockRequest({ username: "", email: "", password: "" });
    const res = createMockResponse();

    await signup(req, res as unknown as Response);

    expect(res.statusCode).toBe(400);
  });

  it("renvoie le statut réel du contrôleur si le pseudo/email est déjà utilisé", async () => {
    // Le SELECT initial passe (son résultat n'est jamais réellement vérifié par le contrôleur),
    // et l'INSERT échoue à cause de la contrainte UNIQUE en base (ER_DUP_ENTRY simulé ici).
    mockExecute.mockResolvedValueOnce([[]]);
    mockExecute.mockRejectedValueOnce(new Error("ER_DUP_ENTRY"));

    const req = createMockRequest({ username: "Elyas", email: "elyas@test.com", password: "motdepasse" });
    const res = createMockResponse();

    await signup(req, res as unknown as Response);

    expect(res.statusCode).toBe(500);
  });

  it("renvoie 200 et un token si la création réussit", async () => {
    mockExecute.mockResolvedValueOnce([[]]);
    mockExecute.mockResolvedValueOnce([{ insertId: 42 }]);
    mockHash.mockResolvedValueOnce("hash-simule");

    const req = createMockRequest({ username: "Elyas", email: "elyas@test.com", password: "motdepasse" });
    const res = createMockResponse();

    await signup(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    const body = res.body as { success: boolean; data: { token: string; userId: number } };
    expect(body.success).toBe(true);
    expect(body.data.userId).toBe(42);
    expect(typeof body.data.token).toBe("string");
  });
});
