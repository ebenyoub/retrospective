import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { findActionsBySessionId, insertAction } from "../action.model";
import db from "../db";

vi.mock("../db", () => ({
  default: {
    execute: vi.fn(),
  },
}));

const mockExecute = db.execute as unknown as Mock;

describe("action.model", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findActionsBySessionId", () => {
    it("devrait retourner la liste des actions de la session", async () => {
      const mockRows = [
        {
          id: 1,
          session_id: 10,
          description: "Action 1",
          owner: "John",
          deadline: "2026-07-20",
          priority: "high",
          created_at: new Date(),
        },
      ];
      mockExecute.mockResolvedValueOnce([mockRows, []]);

      const result = await findActionsBySessionId(10);
      expect(result).toEqual(mockRows);
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining("select"),
        [10]
      );
    });
  });

  describe("insertAction", () => {
    it("devrait insérer une action et retourner son insertId", async () => {
      const mockResult = { insertId: 42, affectedRows: 1 };
      mockExecute.mockResolvedValueOnce([mockResult, []]);

      const result = await insertAction(10, "Action 2", "Alice", "medium", "2026-07-21");
      expect(result).toEqual({ insertId: 42, affectedRows: 1 });
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining("insert into session_actions"),
        [10, "Action 2", "Alice", "medium", "2026-07-21"]
      );
    });
  });
});
