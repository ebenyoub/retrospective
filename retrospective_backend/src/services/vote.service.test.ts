import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("../models/vote.model", () => ({
  findCardSessionId: vi.fn(),
  findExistingVote: vi.fn(),
  countVotesByUserInSession: vi.fn(),
  insertVote: vi.fn(),
}));

import {
  countVotesByUserInSession,
  findCardSessionId,
  findExistingVote,
  insertVote,
} from "../models/vote.model";
import { castVote, MAX_VOTES_PER_SESSION } from "./vote.service";
import { AppError } from "../utils/AppError";

const mockFindCardSessionId = findCardSessionId as unknown as Mock;
const mockFindExistingVote = findExistingVote as unknown as Mock;
const mockCountVotes = countVotesByUserInSession as unknown as Mock;
const mockInsertVote = insertVote as unknown as Mock;

describe("vote.service", () => {
  beforeEach(() => {
    mockFindCardSessionId.mockReset();
    mockFindExistingVote.mockReset();
    mockCountVotes.mockReset();
    mockInsertVote.mockReset();
  });

  it("lève une AppError 404 si la carte n'existe pas", async () => {
    mockFindCardSessionId.mockResolvedValueOnce(null);

    await expect(castVote(1, 999)).rejects.toMatchObject({
      statusCode: 404,
      code: "CARD_NOT_FOUND",
    } satisfies Partial<AppError>);
  });

  it("lève une AppError 400 si l'utilisateur a déjà voté pour cette carte", async () => {
    mockFindCardSessionId.mockResolvedValueOnce(1);
    mockFindExistingVote.mockResolvedValueOnce(10);

    await expect(castVote(1, 5)).rejects.toMatchObject({
      statusCode: 400,
      code: "ALREADY_VOTED",
    } satisfies Partial<AppError>);
  });

  it("lève une AppError 400 si la limite de votes est atteinte", async () => {
    mockFindCardSessionId.mockResolvedValueOnce(1);
    mockFindExistingVote.mockResolvedValueOnce(null);
    mockCountVotes.mockResolvedValueOnce(MAX_VOTES_PER_SESSION);

    await expect(castVote(1, 5)).rejects.toMatchObject({
      statusCode: 400,
      code: "VOTE_LIMIT_REACHED",
    } satisfies Partial<AppError>);

    expect(mockInsertVote).not.toHaveBeenCalled();
  });

  it("enregistre le vote si tout est valide", async () => {
    mockFindCardSessionId.mockResolvedValueOnce(1);
    mockFindExistingVote.mockResolvedValueOnce(null);
    mockCountVotes.mockResolvedValueOnce(MAX_VOTES_PER_SESSION - 1);
    mockInsertVote.mockResolvedValueOnce(77);

    const result = await castVote(1, 5);

    expect(result).toEqual({ voteId: 77 });
  });
});
