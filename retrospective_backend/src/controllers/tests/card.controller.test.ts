import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../../services/card.service", () => ({
  createCard: vi.fn(),
  deleteCard: vi.fn(),
  getCards: vi.fn(),
  updateCard: vi.fn(),
}));

vi.mock("../../utils/sessionActor", () => ({
  resolveSessionActor: vi.fn(),
}));

import { createCard, getCards, updateCard, deleteCard } from "../card.controller";
import {
  createCard as createCardService,
  deleteCard as deleteCardService,
  getCards as getCardsService,
  updateCard as updateCardService,
} from "../../services/card.service";
import { resolveSessionActor } from "../../utils/sessionActor";
import type { AuthRequest } from '../../types';

const mockCreateCardService = createCardService as unknown as Mock;
const mockDeleteCardService = deleteCardService as unknown as Mock;
const mockGetCardsService = getCardsService as unknown as Mock;
const mockUpdateCardService = updateCardService as unknown as Mock;
const mockResolveSessionActor = resolveSessionActor as unknown as Mock;

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
    mockCreateCardService.mockReset();
    mockDeleteCardService.mockReset();
    mockGetCardsService.mockReset();
    mockUpdateCardService.mockReset();
    mockResolveSessionActor.mockReset();
    mockResolveSessionActor.mockResolvedValue({ participantId: 9, displayName: "Sarah", role: "participant" });
  });

  it("POST : appelle le service puis renvoie 201", async () => {
    mockCreateCardService.mockResolvedValueOnce(10);
    const req = createMockRequest({ content: "Le daily était trop long", columnType: "stop" });
    const res = createMockResponse();

    await createCard(req, res as unknown as Response);

    expect(res.statusCode).toBe(201);
    const body = res.body as { success: boolean; data: { cardId: number } };
    expect(body.success).toBe(true);
    expect(body.data.cardId).toBe(10);
    expect(mockCreateCardService).toHaveBeenCalledWith({
      participantId: 9,
      sessionId: "1",
      content: "Le daily était trop long",
      columnType: "stop",
    });
    expect(mockResolveSessionActor).toHaveBeenCalledWith(req, 1);
  });

  it("POST : ne capture pas les erreurs du service", async () => {
    mockCreateCardService.mockRejectedValueOnce(new Error("boom"));
    const req = createMockRequest({ content: "", columnType: "start" });
    const res = createMockResponse();

    await expect(createCard(req, res as unknown as Response)).rejects.toThrow("boom");
  });

  it("GET : renvoie 200 et un tableau vide si la session n'a pas de carte", async () => {
    mockGetCardsService.mockResolvedValueOnce([]);

    const req = createMockRequest({});
    const res = createMockResponse();

    await getCards(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    const body = res.body as { success: boolean; data: unknown[] };
    expect(body.data).toEqual([]);
  });

  it("GET : renvoie 200 et les cartes de la session, mappées en camelCase", async () => {
    const createdAt = new Date("2026-07-07T10:00:00.000Z");
    mockGetCardsService.mockResolvedValueOnce([
      {
        id: 5,
        sessionId: 1,
        authorId: 2,
        authorName: "Sarah",
        columnType: "start",
        content: "Faire plus de pair programming",
        createdAt,
        votesCount: 3,
      },
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
        authorName: "Sarah",
        columnType: "start",
        content: "Faire plus de pair programming",
        createdAt,
        votesCount: 3,
      },
    ]);
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
      participantId: 9,
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

  it("DELETE : appelle le service puis renvoie 200", async () => {
    mockDeleteCardService.mockResolvedValueOnce(undefined);
    const req = createMockRequest({}, { sessionId: "1", cardId: "5" });
    const res = createMockResponse();

    await deleteCard(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    const body = res.body as { success: boolean };
    expect(body.success).toBe(true);
    expect(mockDeleteCardService).toHaveBeenCalledWith({
      participantId: 9,
      cardId: "5",
    });
  });

  it("DELETE : ne capture pas les erreurs du service", async () => {
    mockDeleteCardService.mockRejectedValueOnce(new Error("boom"));
    const req = createMockRequest({}, { sessionId: "1", cardId: "5" });
    const res = createMockResponse();

    await expect(deleteCard(req, res as unknown as Response)).rejects.toThrow("boom");
  });
});
