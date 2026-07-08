import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("./db", () => ({
  default: { execute: vi.fn() },
}));

import db from "./db";
import {
  deleteCardById,
  deleteVotesByCardId,
  findCardOwner,
  findCardOwnerById,
  findCardsBySessionId,
  findSessionById,
  insertCard,
  updateCardContent,
} from "./card.model";

const mockExecute = db.execute as unknown as Mock;

describe("card.model", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("findSessionById renvoie null si la session n'existe pas", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const session = await findSessionById(1);

    expect(session).toBeNull();
  });

  it("insertCard renvoie l'insertId", async () => {
    mockExecute.mockResolvedValueOnce([{ insertId: 10 }]);

    const cardId = await insertCard(1, 2, "start", "Contenu");

    expect(cardId).toBe(10);
  });

  it("findCardsBySessionId renvoie les cartes de la session", async () => {
    mockExecute.mockResolvedValueOnce([[{ id: 5 }]]);

    const cards = await findCardsBySessionId(1);

    expect(cards).toEqual([{ id: 5 }]);
  });

  it("findCardOwner renvoie null si la carte n'existe pas dans la session", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const card = await findCardOwner(1, 5);

    expect(card).toBeNull();
  });

  it("findCardOwner renvoie la carte et son auteur", async () => {
    mockExecute.mockResolvedValueOnce([[{ id: 5, author_id: 1 }]]);

    const card = await findCardOwner(1, 5);

    expect(card).toEqual({ id: 5, author_id: 1 });
    expect(mockExecute).toHaveBeenCalledWith(
      "select id, author_id from retro_cards where id = ? and session_id = ?",
      [5, 1]
    );
  });

  it("findCardOwnerById renvoie la carte et son auteur", async () => {
    mockExecute.mockResolvedValueOnce([[{ id: 5, author_id: 1 }]]);

    const card = await findCardOwnerById(5);

    expect(card).toEqual({ id: 5, author_id: 1 });
  });

  it("updateCardContent met à jour le contenu de la carte dans la session", async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await updateCardContent(1, 5, "Texte modifié");

    expect(mockExecute).toHaveBeenCalledWith(
      "update retro_cards set content = ? where id = ? and session_id = ?",
      ["Texte modifié", 5, 1]
    );
  });

  it("deleteVotesByCardId supprime les votes de la carte", async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 2 }]);

    await deleteVotesByCardId(5);

    expect(mockExecute).toHaveBeenCalledWith("delete from votes where card_id = ?", [5]);
  });

  it("deleteCardById supprime la carte", async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await deleteCardById(5);

    expect(mockExecute).toHaveBeenCalledWith("delete from retro_cards where id = ?", [5]);
  });
});
