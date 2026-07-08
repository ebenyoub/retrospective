import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("../models/card.model", () => ({
  findCardOwner: vi.fn(),
  updateCardContent: vi.fn(),
}));

import { findCardOwner, updateCardContent } from "../models/card.model";
import { updateCard } from "./card.service";
import { AppError } from "../utils/AppError";

const mockFindCardOwner = findCardOwner as unknown as Mock;
const mockUpdateCardContent = updateCardContent as unknown as Mock;

describe("card.service", () => {
  beforeEach(() => {
    mockFindCardOwner.mockReset();
    mockUpdateCardContent.mockReset();
  });

  it("lève une AppError 400 si le contenu est vide", async () => {
    await expect(updateCard({ userId: 1, sessionId: 1, cardId: 5, content: "   " })).rejects.toMatchObject({
      statusCode: 400,
      code: "CARD_CONTENT_REQUIRED",
    } satisfies Partial<AppError>);

    expect(mockFindCardOwner).not.toHaveBeenCalled();
  });

  it("lève une AppError 404 si la carte n'existe pas dans cette session", async () => {
    mockFindCardOwner.mockResolvedValueOnce(null);

    await expect(updateCard({ userId: 1, sessionId: 1, cardId: 5, content: "Texte modifié" })).rejects.toMatchObject({
      statusCode: 404,
      code: "CARD_NOT_FOUND",
    } satisfies Partial<AppError>);
  });

  it("lève une AppError 403 si l'utilisateur n'est pas l'auteur", async () => {
    mockFindCardOwner.mockResolvedValueOnce({ id: 5, author_id: 2 });

    await expect(updateCard({ userId: 1, sessionId: 1, cardId: 5, content: "Texte modifié" })).rejects.toMatchObject({
      statusCode: 403,
      code: "CARD_FORBIDDEN",
    } satisfies Partial<AppError>);

    expect(mockUpdateCardContent).not.toHaveBeenCalled();
  });

  it("modifie la carte avec le contenu trimé si l'utilisateur en est l'auteur", async () => {
    mockFindCardOwner.mockResolvedValueOnce({ id: 5, author_id: 1 });

    await updateCard({ userId: 1, sessionId: 1, cardId: 5, content: " Texte modifié " });

    expect(mockUpdateCardContent).toHaveBeenCalledWith(1, 5, "Texte modifié");
  });
});
