import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("../db", () => ({
  default: { execute: vi.fn(), getConnection: vi.fn() },
}));

import db from "../db";
import {
  deletePasswordTokenByEmail,
  deletePasswordTokenByIdAndEmail,
  deleteExpiredPasswordTokens,
  findActivePasswordTokenByIdAndEmail,
  findActivePasswordTokenByEmail,
  findUserByEmail,
  insertPasswordToken,
  consumePasswordResetAndUpdateUserPassword,
  updateUserPasswordByEmail,
} from "../passwordReset.model";

const mockExecute = db.execute as unknown as Mock;
const mockGetConnection = db.getConnection as unknown as Mock;

describe("passwordReset.model", () => {
  beforeEach(() => {
    mockExecute.mockReset();
    mockGetConnection.mockReset();
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

  it("deletePasswordTokenByIdAndEmail consomme uniquement la demande concernée", async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await deletePasswordTokenByIdAndEmail(12, "e@test.com");

    expect(mockExecute).toHaveBeenCalledWith(expect.any(String), [12, "e@test.com"]);
  });

  it("deleteExpiredPasswordTokens purge les demandes expirées", async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await deleteExpiredPasswordTokens();

    expect(mockExecute).toHaveBeenCalledWith('DELETE FROM password WHERE expire_at <= NOW()');
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

  it("findActivePasswordTokenByIdAndEmail lie la demande à son email", async () => {
    const row = { token: "token" };
    mockExecute.mockResolvedValueOnce([[row]]);

    await expect(findActivePasswordTokenByIdAndEmail(12, "e@test.com")).resolves.toBe(row);
    expect(mockExecute).toHaveBeenCalledWith(expect.any(String), [12, "e@test.com"]);

    mockExecute.mockResolvedValueOnce([[]]);

    await expect(findActivePasswordTokenByIdAndEmail(12, "e@test.com")).resolves.toBeNull();
  });

  it("updateUserPasswordByEmail met à jour le hash", async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await updateUserPasswordByEmail("e@test.com", "hash");

    expect(mockExecute).toHaveBeenCalledWith(expect.any(String), ["hash", "e@test.com"]);
  });

  it("consomme atomiquement la demande et met à jour le mot de passe", async () => {
    const connection = {
      beginTransaction: vi.fn(),
      commit: vi.fn(),
      rollback: vi.fn(),
      release: vi.fn(),
      execute: vi.fn()
        .mockResolvedValueOnce([[{ id: 12 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([{ affectedRows: 1 }]),
    };
    mockGetConnection.mockResolvedValueOnce(connection);

    await expect(consumePasswordResetAndUpdateUserPassword(12, "e@test.com", "hash")).resolves.toBe(true);

    expect(connection.beginTransaction).toHaveBeenCalledOnce();
    expect(connection.commit).toHaveBeenCalledOnce();
    expect(connection.rollback).not.toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalledOnce();
    expect(connection.execute.mock.calls[0][0]).toContain("FOR UPDATE");
  });

  it("annule la transaction si la demande n'est plus active", async () => {
    const connection = {
      beginTransaction: vi.fn(),
      commit: vi.fn(),
      rollback: vi.fn(),
      release: vi.fn(),
      execute: vi.fn().mockResolvedValueOnce([[]]),
    };
    mockGetConnection.mockResolvedValueOnce(connection);

    await expect(consumePasswordResetAndUpdateUserPassword(12, "e@test.com", "hash")).resolves.toBe(false);

    expect(connection.rollback).toHaveBeenCalledOnce();
    expect(connection.commit).not.toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalledOnce();
  });
});
