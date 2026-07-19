import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("../db", () => ({
  default: { execute: vi.fn() },
}));

import db from '../db';
import {
  closeExpiredSessionsForOwner,
  closeActiveSessionsForOwner,
  findActiveSessionForOwner,
  findSessionByCode,
  findSessionsForUser,
  findSessionUserJoin,
  insertSession,
  insertSessionUserJoin,
} from "../session.model";

const mockExecute = db.execute as unknown as Mock;

describe("session.model", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("renvoie un tableau vide si l'utilisateur n'a aucune session", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const rows = await findSessionsForUser(1);

    expect(rows).toEqual([]);
  });

  it("interroge avec le bon userId répété 3 fois (owner, participant, exclusion)", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    await findSessionsForUser(42);

    expect(mockExecute).toHaveBeenCalledWith(expect.any(String), [42, 42, 42]);
  });

  it("renvoie les lignes brutes telles que reçues de la base", async () => {
    const row = {
      id: 1,
      code: "1234",
      status: "open",
      expires_at: new Date("2026-07-08T10:00:00.000Z"),
      created_at: new Date("2026-07-08T09:00:00.000Z"),
      role: "facilitator" as const,
    };
    mockExecute.mockResolvedValueOnce([[row]]);

    const rows = await findSessionsForUser(1);

    expect(rows).toEqual([row]);
  });

  it("closeExpiredSessionsForOwner retourne affectedRows et changedRows", async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 2, changedRows: 1 }]);

    await expect(closeExpiredSessionsForOwner(1, "now")).resolves.toEqual({
      affectedRows: 2,
      changedRows: 1,
    });
  });

  it("closeActiveSessionsForOwner retourne affectedRows", async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 3 }]);

    await expect(closeActiveSessionsForOwner(1)).resolves.toEqual({
      affectedRows: 3,
    });
  });

  it("findActiveSessionForOwner retourne la première session active ou null", async () => {
    const row = { id: 1, code: "1234" };
    mockExecute.mockResolvedValueOnce([[row]]);

    await expect(findActiveSessionForOwner(1, "now")).resolves.toBe(row);

    mockExecute.mockResolvedValueOnce([[]]);

    await expect(findActiveSessionForOwner(1, "now")).resolves.toBeNull();
  });

  it("insertSession retourne l'id inséré", async () => {
    mockExecute.mockResolvedValueOnce([{ insertId: 7 }]);

    await expect(insertSession(
      "Ma Super Session",
      "1234",
      1,
      "2026-07-08 11:00:00",
      "Commencer / Arrêter / Continuer",
      ["Commencer", "Arrêter", "Continuer"],
      5
    )).resolves.toBe(7);

    expect(mockExecute).toHaveBeenCalledWith(
      expect.any(String),
      [
        "Ma Super Session",
        "1234",
        1,
        "open",
        "2026-07-08 11:00:00",
        "Commencer / Arrêter / Continuer",
        JSON.stringify(["Commencer", "Arrêter", "Continuer"]),
        5,
      ]
    );
  });

  it("findSessionByCode retourne la première session ou null", async () => {
    const row = { id: 1 };
    mockExecute.mockResolvedValueOnce([[row]]);

    await expect(findSessionByCode("1234")).resolves.toBe(row);

    mockExecute.mockResolvedValueOnce([[]]);

    await expect(findSessionByCode("9999")).resolves.toBeNull();
  });

  it("findSessionUserJoin retourne la première jointure ou null", async () => {
    const row = { id: 5, user_id: 1, session_id: 1 };
    mockExecute.mockResolvedValueOnce([[row]]);

    await expect(findSessionUserJoin(1, 1)).resolves.toBe(row);

    mockExecute.mockResolvedValueOnce([[]]);

    await expect(findSessionUserJoin(1, 1)).resolves.toBeNull();
  });

  it("insertSessionUserJoin retourne affectedRows et insertId", async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1, insertId: 9 }]);

    await expect(insertSessionUserJoin(1, 1)).resolves.toEqual({
      affectedRows: 1,
      insertId: 9,
    });
  });
});
