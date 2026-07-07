import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("./db", () => ({
  default: { execute: vi.fn() },
}));

import db from './db';
import { findSessionsForUser } from "./session.model";

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
});
