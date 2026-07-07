import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response, NextFunction } from "express";
import type { Mock } from "vitest";

vi.mock("../db", () => ({
  default: { execute: vi.fn() },
}));

import db from "../db";
import { auth } from "../authentication/auth.middleware";
import { createCard, getCards } from "./card.controller";
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

const createMockRequest = (
  body: Record<string, unknown>,
  params: Record<string, string> = { sessionId: "1" }
): AuthRequest =>
  ({
    user: { userId: 1, username: "Elyas" },
    params,
    body,
  }) as unknown as AuthRequest;

describe("card.controller", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("refuse sans token (protection déléguée à auth.middleware, déjà testé unitairement)", () => {
    const req = { headers: {} } as unknown as AuthRequest;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    auth(req, res as unknown as Response, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("renvoie 400 si le contenu est vide", async () => {
    const req = createMockRequest({ content: "", columnType: "start" });
    const res = createMockResponse();

    await createCard(req, res as unknown as Response);

    expect(res.statusCode).toBe(400);
  });

  it("renvoie 404 si la session n'existe pas", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const req = createMockRequest({ content: "Bonne ambiance d'équipe", columnType: "continue" });
    const res = createMockResponse();

    await createCard(req, res as unknown as Response);

    expect(res.statusCode).toBe(404);
  });

  it("crée la carte avec succès", async () => {
    mockExecute.mockResolvedValueOnce([[{ id: 1 }]]);
    mockExecute.mockResolvedValueOnce([{ insertId: 10 }]);

    const req = createMockRequest({ content: "Le daily était trop long", columnType: "stop" });
    const res = createMockResponse();

    await createCard(req, res as unknown as Response);

    expect(res.statusCode).toBe(201);
    const body = res.body as { success: boolean; data: { cardId: number } };
    expect(body.success).toBe(true);
    expect(body.data.cardId).toBe(10);
  });

  it("GET : refuse sans token (protection déléguée à auth.middleware, déjà testé unitairement)", () => {
    const req = { headers: {} } as unknown as AuthRequest;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    auth(req, res as unknown as Response, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("GET : renvoie 404 si la session n'existe pas", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const req = createMockRequest({});
    const res = createMockResponse();

    await getCards(req, res as unknown as Response);

    expect(res.statusCode).toBe(404);
  });

  it("GET : renvoie 200 et un tableau vide si la session n'a pas de carte", async () => {
    mockExecute.mockResolvedValueOnce([[{ id: 1 }]]);
    mockExecute.mockResolvedValueOnce([[]]);

    const req = createMockRequest({});
    const res = createMockResponse();

    await getCards(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    const body = res.body as { success: boolean; data: unknown[] };
    expect(body.data).toEqual([]);
  });

  it("GET : renvoie 200 et les cartes de la session, mappées en camelCase", async () => {
    const createdAt = new Date("2026-07-07T10:00:00.000Z");
    mockExecute.mockResolvedValueOnce([[{ id: 1 }]]);
    mockExecute.mockResolvedValueOnce([
      [
        {
          id: 5,
          session_id: 1,
          author_id: 2,
          column_type: "start",
          content: "Faire plus de pair programming",
          created_at: createdAt,
        },
      ],
    ]);

    const req = createMockRequest({});
    const res = createMockResponse();

    await getCards(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    const body = res.body as { success: boolean; data: Array<Record<string, unknown>> };
    expect(body.data).toEqual([
      {
        id: 5,
        sessionId: 1,
        authorId: 2,
        columnType: "start",
        content: "Faire plus de pair programming",
        createdAt,
      },
    ]);
  });
});
