import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("./db", () => ({
  default: { execute: vi.fn() },
}));

import db from "./db";
import {
  deleteUserById,
  findUserByUsername,
  findUsersByUsernameOrEmail,
  insertUser,
} from "./auth.model";

const mockExecute = db.execute as unknown as Mock;

describe("auth.model", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("findUserByUsername retourne le premier utilisateur ou null", async () => {
    const row = { id: 1, username: "Elyas", hash_password: "hash", email: "e@test.com" };
    mockExecute.mockResolvedValueOnce([[row]]);

    await expect(findUserByUsername("Elyas")).resolves.toBe(row);

    mockExecute.mockResolvedValueOnce([[]]);

    await expect(findUserByUsername("inconnu")).resolves.toBeNull();
  });

  it("findUsersByUsernameOrEmail retourne les lignes brutes", async () => {
    const rows = [{ id: 1, username: "Elyas", email: "e@test.com" }];
    mockExecute.mockResolvedValueOnce([rows]);

    await expect(findUsersByUsernameOrEmail("Elyas", "e@test.com")).resolves.toBe(rows);
  });

  it("insertUser retourne l'id inséré", async () => {
    mockExecute.mockResolvedValueOnce([{ insertId: 42 }]);

    await expect(insertUser("Elyas", "e@test.com", "hash")).resolves.toBe(42);
  });

  it("deleteUserById supprime par id", async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await deleteUserById(1);

    expect(mockExecute).toHaveBeenCalledWith(expect.any(String), [1]);
  });
});
