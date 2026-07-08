import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("../models/card.model", () => ({
  findCardOwnerInSession: vi.fn(),
  updateCardContent: vi.fn(),
}));

import { findCardOwnerInSession, updateCardContent } from "../models/card.model";
import { updateOwnCard } from "./card.service";
import { AppError } from "../utils/AppError";

const mockFindCardOwnerInSession = findCardOwnerInSession as unknown as Mock;
const mockUpdateCardContent = updateCardContent as unknown as Mock;

describe("card.service", () => {
  beforeEach(() => {
    mockFindCardOwnerInSession.mockReset();
    mockUpdateCardContent.mockReset();
  });

  it("lève une AppError 400 si le contenu est vide", async () => {
    await expect(updateOwnCard(1, 1, 5, "   ")).rejects.toMatchObject({
      statusCode: 400,
      code: "CARD_CONTENT_REQUIRED",
    } satisfies Partial<AppError>);

    expect(mockFindCardOwnerInSession).not.toHaveBeenCalled();
  });

  it("lève une AppError 404 si la carte n'existe pas dans cette session", async () => {
    mockFindCardOwnerInSession.mockResolvedValueOnce(null);

    await expect(updateOwnCard(1, 1, 5, "Texte modifié")).rejects.toMatchObject({
      statusCode: 404,
      code: "CARD_NOT_FOUND",
    } satisfies Partial<AppError>);
  });

  it("lève une AppError 403 si l'utilisateur n'est pas l'auteur", async () => {
    mockFindCardOwnerInSession.mockResolvedValueOnce({ id: 5, author_id: 2 });

    await expect(updateOwnCard(1, 1, 5, "Texte modifié")).rejects.toMatchObject({
      statusCode: 403,
      code: "CARD_FORBIDDEN",
    } satisfies Partial<AppError>);

    expect(mockUpdateCardContent).not.toHaveBeenCalled();
  });

  it("modifie la carte avec le contenu trimé si l'utilisateur en est l'auteur", async () => {
    mockFindCardOwnerInSession.mockResolvedValueOnce({ id: 5, author_id: 1 });

    await updateOwnCard(1, 1, 5, " Texte modifié ");

    expect(mockUpdateCardContent).toHaveBeenCalledWith(5, 1, "Texte modifié");
  });
});
