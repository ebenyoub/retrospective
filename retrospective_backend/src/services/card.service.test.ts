import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("../models/card.model", () => ({
  deleteCardById: vi.fn(),
  deleteVotesByCardId: vi.fn(),
  findCardOwner: vi.fn(),
  findCardOwnerById: vi.fn(),
  findCardsBySessionId: vi.fn(),
  findSessionById: vi.fn(),
  insertCard: vi.fn(),
  updateCardContent: vi.fn(),
}));

import {
  deleteCardById,
  deleteVotesByCardId,
  findCardOwner,
  findCardOwnerById,
  findCardsBySessionId,
  findSessionById,
  insertCard,
  updateCardContent,
} from "../models/card.model";
import { createCard, deleteCard, getCards, updateCard } from "./card.service";
import { AppError } from "../utils/AppError";

const mockDeleteCardById = deleteCardById as unknown as Mock;
const mockDeleteVotesByCardId = deleteVotesByCardId as unknown as Mock;
const mockFindCardOwner = findCardOwner as unknown as Mock;
const mockFindCardOwnerById = findCardOwnerById as unknown as Mock;
const mockFindCardsBySessionId = findCardsBySessionId as unknown as Mock;
const mockFindSessionById = findSessionById as unknown as Mock;
const mockInsertCard = insertCard as unknown as Mock;
const mockUpdateCardContent = updateCardContent as unknown as Mock;

describe("card.service", () => {
  beforeEach(() => {
    mockDeleteCardById.mockReset();
    mockDeleteVotesByCardId.mockReset();
    mockFindCardOwner.mockReset();
    mockFindCardOwnerById.mockReset();
    mockFindCardsBySessionId.mockReset();
    mockFindSessionById.mockReset();
    mockInsertCard.mockReset();
    mockUpdateCardContent.mockReset();
  });

  it("createCard lève une AppError 400 si le contenu est vide", async () => {
    await expect(createCard({ participantId: 1, sessionId: "1", content: " ", columnType: "start" })).rejects.toMatchObject({
      statusCode: 400,
      code: "CARD_CONTENT_REQUIRED",
    } satisfies Partial<AppError>);

    expect(mockFindSessionById).not.toHaveBeenCalled();
  });

  it("createCard lève une AppError 400 si la colonne est invalide", async () => {
    await expect(createCard({ participantId: 1, sessionId: "1", content: "Texte", columnType: "bad" })).rejects.toMatchObject({
      statusCode: 400,
      code: "CARD_COLUMN_INVALID",
    } satisfies Partial<AppError>);
  });

  it("createCard lève une AppError 404 si la session n'existe pas", async () => {
    mockFindSessionById.mockResolvedValueOnce(null);

    await expect(createCard({ participantId: 1, sessionId: "1", content: "Texte", columnType: "start" })).rejects.toMatchObject({
      statusCode: 404,
      code: "SESSION_NOT_FOUND",
    } satisfies Partial<AppError>);
  });

  it("createCard crée la carte", async () => {
    mockFindSessionById.mockResolvedValueOnce({ id: 1 });
    mockInsertCard.mockResolvedValueOnce(10);

    await expect(createCard({ participantId: 1, sessionId: "1", content: "Texte", columnType: "start" })).resolves.toBe(10);

    expect(mockInsertCard).toHaveBeenCalledWith("1", 1, "start", "Texte");
  });

  it("getCards lève une AppError 404 si la session n'existe pas", async () => {
    mockFindSessionById.mockResolvedValueOnce(null);

    await expect(getCards({ sessionId: "1" })).rejects.toMatchObject({
      statusCode: 404,
      code: "SESSION_NOT_FOUND",
    } satisfies Partial<AppError>);
  });

  it("getCards retourne les cartes mappées en camelCase", async () => {
    const createdAt = new Date("2026-07-07T10:00:00.000Z");
    mockFindSessionById.mockResolvedValueOnce({ id: 1 });
    mockFindCardsBySessionId.mockResolvedValueOnce([
      {
        id: 5,
        session_id: 1,
        author_participant_id: 2,
        author_name: "Sarah",
        column_type: "start",
        content: "Texte",
        created_at: createdAt,
        votes_count: 3,
      },
    ]);

    await expect(getCards({ sessionId: "1" })).resolves.toEqual([
      {
        id: 5,
        sessionId: 1,
        authorId: 2,
        authorName: "Sarah",
        columnType: "start",
        content: "Texte",
        createdAt,
        votesCount: 3,
        votedByMe: false,
      },
    ]);
  });

  it("lève une AppError 400 si le contenu est vide", async () => {
    await expect(updateCard({ participantId: 1, sessionId: 1, cardId: 5, content: "   " })).rejects.toMatchObject({
      statusCode: 400,
      code: "CARD_CONTENT_REQUIRED",
    } satisfies Partial<AppError>);

    expect(mockFindCardOwner).not.toHaveBeenCalled();
  });

  it("lève une AppError 404 si la carte n'existe pas dans cette session", async () => {
    mockFindCardOwner.mockResolvedValueOnce(null);

    await expect(updateCard({ participantId: 1, sessionId: 1, cardId: 5, content: "Texte modifié" })).rejects.toMatchObject({
      statusCode: 404,
      code: "CARD_NOT_FOUND",
    } satisfies Partial<AppError>);
  });

  it("lève une AppError 403 si l'utilisateur n'est pas l'auteur", async () => {
    mockFindCardOwner.mockResolvedValueOnce({ id: 5, author_participant_id: 2 });

    await expect(updateCard({ participantId: 1, sessionId: 1, cardId: 5, content: "Texte modifié" })).rejects.toMatchObject({
      statusCode: 403,
      code: "CARD_FORBIDDEN",
    } satisfies Partial<AppError>);

    expect(mockUpdateCardContent).not.toHaveBeenCalled();
  });

  it("modifie la carte avec le contenu trimé si l'utilisateur en est l'auteur", async () => {
    mockFindCardOwner.mockResolvedValueOnce({ id: 5, author_participant_id: 1 });

    await updateCard({ participantId: 1, sessionId: 1, cardId: 5, content: " Texte modifié " });

    expect(mockUpdateCardContent).toHaveBeenCalledWith(1, 5, "Texte modifié");
  });

  it("deleteCard lève une AppError 404 si la carte n'existe pas", async () => {
    mockFindCardOwnerById.mockResolvedValueOnce(null);

    await expect(deleteCard({ participantId: 1, cardId: "5" })).rejects.toMatchObject({
      statusCode: 404,
      code: "CARD_NOT_FOUND",
    } satisfies Partial<AppError>);
  });

  it("deleteCard lève une AppError 403 si l'utilisateur n'est pas l'auteur", async () => {
    mockFindCardOwnerById.mockResolvedValueOnce({ id: 5, author_participant_id: 2 });

    await expect(deleteCard({ participantId: 1, cardId: "5" })).rejects.toMatchObject({
      statusCode: 403,
      code: "CARD_FORBIDDEN",
    } satisfies Partial<AppError>);

    expect(mockDeleteVotesByCardId).not.toHaveBeenCalled();
  });

  it("deleteCard supprime les votes puis la carte", async () => {
    mockFindCardOwnerById.mockResolvedValueOnce({ id: 5, author_participant_id: 1 });

    await deleteCard({ participantId: 1, cardId: "5" });

    expect(mockDeleteVotesByCardId).toHaveBeenCalledWith("5");
    expect(mockDeleteCardById).toHaveBeenCalledWith("5");
  });
});
