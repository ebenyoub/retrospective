import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("./db", () => ({
  default: { execute: vi.fn() },
}));

import db from "./db";
import {
  deletePasswordTokenByEmail,
  findActivePasswordResetByEmail,
  findActivePasswordTokenByEmail,
  findUserByEmail,
  insertPasswordToken,
  updateUserPasswordByEmail,
} from "./passwordReset.model";

const mockExecute = db.execute as unknown as Mock;

describe("passwordReset.model", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("findUserByEmail retourne le premier utilisateur ou null", async () => {
    const row = { id: 1, username: "Elyas", hash_password: "hash" };
    mockExecute.mockResolvedValueOnce([[row]]);

    await expect(findUserByEmail("e@test.com")).resolves.toBe(row);

    mockExecute.mockResolvedValueOnce([[]]);

    await expect(findUserByEmail("missing@test.com")).resolves.toBeNull();
  });

  it("deletePasswordTokenByEmail supprime par email", async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await deletePasswordTokenByEmail("e@test.com");

    expect(mockExecute).toHaveBeenCalledWith(expect.any(String), ["e@test.com"]);
  });

  it("insertPasswordToken insère le token", async () => {
    const expireAt = new Date("2026-07-08T10:00:00.000Z");
    mockExecute.mockResolvedValueOnce([{ insertId: 1 }]);

    await insertPasswordToken("token", "e@test.com", expireAt);

    expect(mockExecute).toHaveBeenCalledWith(expect.any(String), [null, "token", "e@test.com", expireAt]);
  });

  it("findActivePasswordTokenByEmail retourne le token ou null", async () => {
    const row = { token: "token" };
    mockExecute.mockResolvedValueOnce([[row]]);

    await expect(findActivePasswordTokenByEmail("e@test.com")).resolves.toBe(row);

    mockExecute.mockResolvedValueOnce([[]]);

    await expect(findActivePasswordTokenByEmail("e@test.com")).resolves.toBeNull();
  });

  it("findActivePasswordResetByEmail retourne la ligne ou null", async () => {
    const row = { token: "token" };
    mockExecute.mockResolvedValueOnce([[row]]);

    await expect(findActivePasswordResetByEmail("e@test.com")).resolves.toBe(row);

    mockExecute.mockResolvedValueOnce([[]]);

    await expect(findActivePasswordResetByEmail("e@test.com")).resolves.toBeNull();
  });

  it("updateUserPasswordByEmail met à jour le hash", async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await updateUserPasswordByEmail("e@test.com", "hash");

    expect(mockExecute).toHaveBeenCalledWith(expect.any(String), ["hash", "e@test.com"]);
  });
});
