import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("./db", () => ({
  default: { execute: vi.fn() },
}));

import db from "./db";
import { findCardOwnerInSession, updateCardContent } from "./card.model";

const mockExecute = db.execute as unknown as Mock;

describe("card.model", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("findCardOwnerInSession renvoie null si la carte n'existe pas dans la session", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const card = await findCardOwnerInSession(5, 1);

    expect(card).toBeNull();
  });

  it("findCardOwnerInSession renvoie la carte et son auteur", async () => {
    mockExecute.mockResolvedValueOnce([[{ id: 5, author_id: 1 }]]);

    const card = await findCardOwnerInSession(5, 1);

    expect(card).toEqual({ id: 5, author_id: 1 });
    expect(mockExecute).toHaveBeenCalledWith(
      "select id, author_id from retro_cards where id = ? and session_id = ?",
      [5, 1]
    );
  });

  it("updateCardContent met à jour le contenu de la carte dans la session", async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await updateCardContent(5, 1, "Texte modifié");

    expect(mockExecute).toHaveBeenCalledWith(
      "update retro_cards set content = ? where id = ? and session_id = ?",
      ["Texte modifié", 5, 1]
    );
  });
});
