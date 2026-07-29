import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("../db", () => ({
  default: { execute: vi.fn() },
}));

import db from "../db";
import {
  deleteCommentById,
  findCommentById,
  findCommentOwner,
  findCommentsByCardId,
  insertComment,
} from "../comment.model";

const mockExecute = db.execute as unknown as Mock;

describe("comment.model", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("insertComment renvoie l'insertId", async () => {
    mockExecute.mockResolvedValueOnce([{ insertId: 12 }]);

    const commentId = await insertComment(1, 9, "Peut-on préciser ce point ?");

    expect(commentId).toBe(12);
    expect(mockExecute).toHaveBeenCalledWith(expect.any(String), [1, 9, "Peut-on préciser ce point ?"]);
  });

  it("findCommentsByCardId renvoie la liste triée par date", async () => {
    const rows = [
      { id: 1, card_id: 5, author_participant_id: 9, author_name: "Sarah", content: "Un premier commentaire", created_at: new Date() },
    ];
    mockExecute.mockResolvedValueOnce([rows]);

    const comments = await findCommentsByCardId(5);

    expect(comments).toEqual(rows);
    expect(mockExecute).toHaveBeenCalledWith(expect.any(String), [5]);
  });

  it("findCommentById renvoie null si le commentaire n'existe pas", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const comment = await findCommentById(999);

    expect(comment).toBeNull();
  });

  it("findCommentById renvoie le commentaire trouvé", async () => {
    const row = { id: 1, card_id: 5, author_participant_id: 9, author_name: "Sarah", content: "Un commentaire", created_at: new Date() };
    mockExecute.mockResolvedValueOnce([[row]]);

    const comment = await findCommentById(1);

    expect(comment).toEqual(row);
  });

  it("findCommentOwner renvoie null si le commentaire n'existe pas", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const owner = await findCommentOwner(999);

    expect(owner).toBeNull();
  });

  it("findCommentOwner renvoie le propriétaire du commentaire", async () => {
    mockExecute.mockResolvedValueOnce([[{ id: 1, card_id: 5, author_participant_id: 9 }]]);

    const owner = await findCommentOwner(1);

    expect(owner).toEqual({ id: 1, card_id: 5, author_participant_id: 9 });
  });

  it("deleteCommentById exécute la suppression", async () => {
    mockExecute.mockResolvedValueOnce([{}]);

    await deleteCommentById(1);

    expect(mockExecute).toHaveBeenCalledWith(expect.any(String), [1]);
  });
});
