import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response, NextFunction } from "express";
import type { Mock } from "vitest";

vi.mock("../models/card.model", () => ({
  deleteCardById: vi.fn(),
  deleteVotesByCardId: vi.fn(),
  findCardOwnerById: vi.fn(),
  findCardsBySessionId: vi.fn(),
  findSessionById: vi.fn(),
  insertCard: vi.fn(),
}));

vi.mock("../services/card.service", () => ({
  updateCard: vi.fn(),
}));

import { auth } from '../middlewares/auth.middleware';
import { createCard, getCards, updateCard, deleteCard } from "./card.controller";
import {
  deleteCardById,
  deleteVotesByCardId,
  findCardOwnerById,
  findCardsBySessionId,
  findSessionById,
  insertCard,
} from "../models/card.model";
import { updateCard as updateCardService } from "../services/card.service";
import type { AuthRequest } from '../types';

const mockDeleteCardById = deleteCardById as unknown as Mock;
const mockDeleteVotesByCardId = deleteVotesByCardId as unknown as Mock;
const mockFindCardOwnerById = findCardOwnerById as unknown as Mock;
const mockFindCardsBySessionId = findCardsBySessionId as unknown as Mock;
const mockFindSessionById = findSessionById as unknown as Mock;
const mockInsertCard = insertCard as unknown as Mock;
const mockUpdateCardService = updateCardService as unknown as Mock;

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
    mockDeleteCardById.mockReset();
    mockDeleteVotesByCardId.mockReset();
    mockFindCardOwnerById.mockReset();
    mockFindCardsBySessionId.mockReset();
    mockFindSessionById.mockReset();
    mockInsertCard.mockReset();
    mockUpdateCardService.mockReset();
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
    mockFindSessionById.mockResolvedValueOnce(null);

    const req = createMockRequest({ content: "Bonne ambiance d'équipe", columnType: "continue" });
    const res = createMockResponse();

    await createCard(req, res as unknown as Response);

    expect(res.statusCode).toBe(404);
  });

  it("crée la carte avec succès", async () => {
    mockFindSessionById.mockResolvedValueOnce({ id: 1 });
    mockInsertCard.mockResolvedValueOnce(10);

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
    mockFindSessionById.mockResolvedValueOnce(null);

    const req = createMockRequest({});
    const res = createMockResponse();

    await getCards(req, res as unknown as Response);

    expect(res.statusCode).toBe(404);
  });

  it("GET : renvoie 200 et un tableau vide si la session n'a pas de carte", async () => {
    mockFindSessionById.mockResolvedValueOnce({ id: 1 });
    mockFindCardsBySessionId.mockResolvedValueOnce([]);

    const req = createMockRequest({});
    const res = createMockResponse();

    await getCards(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    const body = res.body as { success: boolean; data: unknown[] };
    expect(body.data).toEqual([]);
  });

  it("GET : renvoie 200 et les cartes de la session, mappées en camelCase", async () => {
    const createdAt = new Date("2026-07-07T10:00:00.000Z");
    mockFindSessionById.mockResolvedValueOnce({ id: 1 });
    mockFindCardsBySessionId.mockResolvedValueOnce(
      [
        {
          id: 5,
          session_id: 1,
          author_id: 2,
          column_type: "start",
          content: "Faire plus de pair programming",
          created_at: createdAt,
          votes_count: 3,
        },
      ]
    );

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
        votesCount: 3,
      },
    ]);
  });

  it("DELETE : refuse sans token (protection déléguée à auth.middleware, déjà testé unitairement)", () => {
    const req = { headers: {} } as unknown as AuthRequest;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    auth(req, res as unknown as Response, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("PATCH : appelle le service puis renvoie 200", async () => {
    mockUpdateCardService.mockResolvedValueOnce(undefined);
    const req = createMockRequest({ content: " Texte modifié " }, { sessionId: "1", cardId: "5" });
    const res = createMockResponse();

    await updateCard(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    const body = res.body as { success: boolean };
    expect(body.success).toBe(true);
    expect(mockUpdateCardService).toHaveBeenCalledWith({
      userId: 1,
      sessionId: 1,
      cardId: 5,
      content: " Texte modifié ",
    });
  });

  it("PATCH : ne capture pas les erreurs du service (remontée au middleware d'erreur)", async () => {
    mockUpdateCardService.mockRejectedValueOnce(new Error("boom"));
    const req = createMockRequest({ content: "Texte modifié" }, { sessionId: "1", cardId: "5" });
    const res = createMockResponse();

    await expect(updateCard(req, res as unknown as Response)).rejects.toThrow("boom");
  });

  it("DELETE : renvoie 404 si la carte n'existe pas", async () => {
    mockFindCardOwnerById.mockResolvedValueOnce(null);

    const req = createMockRequest({}, { sessionId: "1", cardId: "5" });
    const res = createMockResponse();

    await deleteCard(req, res as unknown as Response);

    expect(res.statusCode).toBe(404);
  });

  it("DELETE : renvoie 403 si l'utilisateur n'est pas l'auteur de la carte", async () => {
    mockFindCardOwnerById.mockResolvedValueOnce({ id: 5, author_id: 2 });

    const req = createMockRequest({}, { sessionId: "1", cardId: "5" });
    const res = createMockResponse();

    await deleteCard(req, res as unknown as Response);

    expect(res.statusCode).toBe(403);
  });

  it("DELETE : supprime la carte et ses votes si l'utilisateur en est l'auteur", async () => {
    mockFindCardOwnerById.mockResolvedValueOnce({ id: 5, author_id: 1 });

    const req = createMockRequest({}, { sessionId: "1", cardId: "5" });
    const res = createMockResponse();

    await deleteCard(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    const body = res.body as { success: boolean };
    expect(body.success).toBe(true);
    expect(mockDeleteVotesByCardId).toHaveBeenCalledWith("5");
    expect(mockDeleteCardById).toHaveBeenCalledWith("5");
  });
});
