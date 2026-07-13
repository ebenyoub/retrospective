import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("./db", () => ({
  default: { execute: vi.fn() },
}));

import db from "./db";
import {
  countVotesByParticipantInSession,
  findCardSessionId,
  findExistingVote,
  insertVote,
} from "./vote.model";

const mockExecute = db.execute as unknown as Mock;

describe("vote.model", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("findCardSessionId renvoie null si la carte n'existe pas", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const sessionId = await findCardSessionId(999);

    expect(sessionId).toBeNull();
  });

  it("findCardSessionId renvoie le session_id de la carte", async () => {
    mockExecute.mockResolvedValueOnce([[{ session_id: 7 }]]);

    const sessionId = await findCardSessionId(1);

    expect(sessionId).toBe(7);
  });

  it("findExistingVote renvoie null si aucun vote", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const voteId = await findExistingVote(1, 1);

    expect(voteId).toBeNull();
  });

  it("findExistingVote renvoie l'id du vote existant", async () => {
    mockExecute.mockResolvedValueOnce([[{ id: 42 }]]);

    const voteId = await findExistingVote(1, 1);

    expect(voteId).toBe(42);
  });

  it("countVotesByParticipantInSession renvoie le compteur", async () => {
    mockExecute.mockResolvedValueOnce([[{ count: 3 }]]);

    const count = await countVotesByParticipantInSession(1, 1);

    expect(count).toBe(3);
    expect(mockExecute).toHaveBeenCalledWith(expect.any(String), [1, 1]);
  });

  it("insertVote renvoie l'insertId", async () => {
    mockExecute.mockResolvedValueOnce([{ insertId: 15 }]);

    const voteId = await insertVote(1, 1);

    expect(voteId).toBe(15);
  });
});
