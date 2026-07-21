import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("../db", () => ({
  default: { execute: vi.fn(), getConnection: vi.fn() },
}));

import db from "../db";
import {
  countVotesByParticipantInSession,
  findCardSessionId,
  findExistingVote,
  insertVote,
  insertVoteAtomically,
} from "../vote.model";

const mockExecute = db.execute as unknown as Mock;
const mockGetConnection = db.getConnection as unknown as Mock;

describe("vote.model", () => {
  beforeEach(() => {
    mockExecute.mockReset();
    mockGetConnection.mockReset();
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

  it("verrouille le participant avant le décompte, ce qui maintient la limite à 5 votes", async () => {
    const connection = {
      beginTransaction: vi.fn(),
      commit: vi.fn(),
      rollback: vi.fn(),
      release: vi.fn(),
      execute: vi.fn()
        .mockResolvedValueOnce([[{ id: 1 }]])
        .mockResolvedValueOnce([[{ session_id: 7 }]])
        .mockResolvedValueOnce([[{ status: "open", step: "voting" }]])
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[{ count: 4 }]])
        .mockResolvedValueOnce([{ insertId: 15 }])
        .mockResolvedValueOnce([[{ votes_count: 2 }]]),
    };
    mockGetConnection.mockResolvedValueOnce(connection);

    await expect(insertVoteAtomically(1, 7, 5)).resolves.toEqual({
      ok: true,
      voteId: 15,
      votesUsed: 5,
      cardVotesCount: 2,
    });
    expect(connection.beginTransaction).toHaveBeenCalledOnce();
    expect(connection.commit).toHaveBeenCalledOnce();
    expect(connection.release).toHaveBeenCalledOnce();

    const queries = connection.execute.mock.calls.map(([query]) => query as string);
    const participantLockIndex = queries.findIndex((query) =>
      query.includes("from session_participants") && query.includes("for update")
    );
    const voteCountIndex = queries.findIndex((query) => query.includes("select count(*) as count"));

    expect(participantLockIndex).toBeGreaterThanOrEqual(0);
    expect(voteCountIndex).toBeGreaterThan(participantLockIndex);
  });
});
