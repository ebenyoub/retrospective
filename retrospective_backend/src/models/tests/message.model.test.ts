import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("../db", () => ({
  default: { execute: vi.fn() },
}));

import db from "../db";
import {
  insertMessage,
  findMessagesBySessionId,
  findMessageById,
} from "../message.model";

const mockExecute = db.execute as unknown as Mock;

describe("message.model", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("insertMessage insère et retourne l'id généré", async () => {
    mockExecute.mockResolvedValueOnce([{ insertId: 42 }]);

    const id = await insertMessage(1, 2, "Un message");
    expect(id).toBe(42);
    expect(mockExecute).toHaveBeenCalledWith(
      "insert into session_messages (session_id, author_participant_id, content) values (?, ?, ?)",
      [1, 2, "Un message"]
    );
  });

  it("findMessagesBySessionId retourne la liste des messages", async () => {
    const list = [
      { id: 1, session_id: 1, author_participant_id: 2, author_name: "Sarah", content: "Hey", created_at: new Date() },
    ];
    mockExecute.mockResolvedValueOnce([list]);

    const res = await findMessagesBySessionId(1);
    expect(res).toEqual(list);
  });

  it("findMessageById retourne le message ou null si absent", async () => {
    const msg = { id: 1, session_id: 1, author_participant_id: 2, author_name: "Sarah", content: "Hey", created_at: new Date() };
    mockExecute.mockResolvedValueOnce([[msg]]);

    const res = await findMessageById(1);
    expect(res).toEqual(msg);
  });
});
