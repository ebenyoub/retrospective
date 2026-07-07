import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("../../session/session.model", () => ({
  findSessionsForUser: vi.fn(),
}));

import { findSessionsForUser } from '../../session/session.model';
import { getSessionsForUser } from "./session.service";

const mockFindSessionsForUser = findSessionsForUser as unknown as Mock;

describe("session.service", () => {
  beforeEach(() => {
    mockFindSessionsForUser.mockReset();
  });

  it("renvoie un tableau vide si le modèle ne renvoie aucune session", async () => {
    mockFindSessionsForUser.mockResolvedValueOnce([]);

    const result = await getSessionsForUser(1);

    expect(result).toEqual([]);
  });

  it("mappe les lignes snake_case du modèle en camelCase", async () => {
    const createdAt = new Date("2026-07-08T09:00:00.000Z");
    const expiresAt = new Date("2026-07-08T10:00:00.000Z");

    mockFindSessionsForUser.mockResolvedValueOnce([
      {
        id: 1,
        code: "1234",
        status: "open",
        expires_at: expiresAt,
        created_at: createdAt,
        role: "facilitator",
      },
      {
        id: 2,
        code: "5678",
        status: "closed",
        expires_at: expiresAt,
        created_at: createdAt,
        role: "participant",
      },
    ]);

    const result = await getSessionsForUser(1);

    expect(result).toEqual([
      { id: 1, code: "1234", status: "open", expiresAt, createdAt, role: "facilitator" },
      { id: 2, code: "5678", status: "closed", expiresAt, createdAt, role: "participant" },
    ]);
  });

  it("propage l'erreur du modèle sans la capturer (remontée au contrôleur)", async () => {
    mockFindSessionsForUser.mockRejectedValueOnce(new Error("boom"));

    await expect(getSessionsForUser(1)).rejects.toThrow("boom");
  });
});
