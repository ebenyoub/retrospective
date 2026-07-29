import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("../db", () => ({
  default: { execute: vi.fn() },
}));

import db from "../db";
import {
  countParticipants,
  deleteParticipant,
  findParticipantByGuestToken,
  findParticipantById,
  findParticipantByName,
  findParticipantByUserId,
  findParticipantsBySession,
  insertParticipant,
  touchParticipant,
} from "../participant.model";

const mockExecute = db.execute as unknown as Mock;

describe("participant.model", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("countParticipants retourne le total", async () => {
    mockExecute.mockResolvedValueOnce([[{ total: 3 }]]);

    await expect(countParticipants(1)).resolves.toBe(3);
  });

  it("countParticipants retourne 0 si aucune ligne", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    await expect(countParticipants(1)).resolves.toBe(0);
  });

  it("findParticipantByName retourne la première ligne ou null", async () => {
    const row = { id: 1, display_name: "Elyas" };
    mockExecute.mockResolvedValueOnce([[row]]);
    await expect(findParticipantByName(1, "Elyas")).resolves.toBe(row);

    mockExecute.mockResolvedValueOnce([[]]);
    await expect(findParticipantByName(1, "Inconnu")).resolves.toBeNull();
  });

  it("findParticipantByUserId retourne la première ligne ou null", async () => {
    mockExecute.mockResolvedValueOnce([[{ id: 1 }]]);
    await expect(findParticipantByUserId(1, 5)).resolves.toEqual({ id: 1 });
  });

  it("findParticipantByGuestToken retourne la première ligne ou null", async () => {
    mockExecute.mockResolvedValueOnce([[{ id: 2 }]]);
    await expect(findParticipantByGuestToken(1, "token")).resolves.toEqual({ id: 2 });
  });

  it("findParticipantById retourne la première ligne ou null", async () => {
    mockExecute.mockResolvedValueOnce([[{ id: 3 }]]);
    await expect(findParticipantById(3)).resolves.toEqual({ id: 3 });
  });

  it("findParticipantsBySession renvoie toutes les lignes", async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    mockExecute.mockResolvedValueOnce([rows]);
    await expect(findParticipantsBySession(1)).resolves.toBe(rows);
  });

  it("insertParticipant retourne l'id inséré", async () => {
    mockExecute.mockResolvedValueOnce([{ insertId: 9 }]);

    await expect(
      insertParticipant({ sessionId: 1, userId: null, guestToken: "tok", displayName: "Sarah", role: "participant" })
    ).resolves.toBe(9);
  });

  it("touchParticipant met à jour statut et last_seen_at", async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await touchParticipant(1, "offline");

    expect(mockExecute).toHaveBeenCalledWith(expect.any(String), ["offline", 1]);
  });

  it("deleteParticipant supprime par id", async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await deleteParticipant(1);

    expect(mockExecute).toHaveBeenCalledWith(expect.any(String), [1]);
  });
});
