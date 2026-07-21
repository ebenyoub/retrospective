import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("../../models/vote.model", () => ({
  insertVoteAtomically: vi.fn(),
}));

import { insertVoteAtomically } from "../../models/vote.model";
import { castVote, MAX_VOTES_PER_SESSION } from "../vote.service";
import { AppError } from "../../utils/AppError";

const mockInsertVoteAtomically = insertVoteAtomically as unknown as Mock;

describe("vote.service", () => {
  beforeEach(() => {
    mockInsertVoteAtomically.mockReset();
  });

  it("lève une AppError 404 si la carte n'existe pas", async () => {
    mockInsertVoteAtomically.mockResolvedValueOnce({ ok: false, failure: "CARD_NOT_FOUND" });

    await expect(castVote(1, 1, 999)).rejects.toMatchObject({
      statusCode: 404,
      code: "CARD_NOT_FOUND",
    } satisfies Partial<AppError>);
  });

  it("lève une AppError 400 si l'utilisateur a déjà voté pour cette carte", async () => {
    mockInsertVoteAtomically.mockResolvedValueOnce({ ok: false, failure: "ALREADY_VOTED" });

    await expect(castVote(1, 1, 5)).rejects.toMatchObject({
      statusCode: 400,
      code: "ALREADY_VOTED",
    } satisfies Partial<AppError>);
  });

  it("lève une AppError 400 si la limite de votes est atteinte", async () => {
    mockInsertVoteAtomically.mockResolvedValueOnce({ ok: false, failure: "VOTE_LIMIT_REACHED" });

    await expect(castVote(1, 1, 5)).rejects.toMatchObject({
      statusCode: 400,
      code: "VOTE_LIMIT_REACHED",
    } satisfies Partial<AppError>);

    expect(mockInsertVoteAtomically).toHaveBeenCalledWith(1, 1, 5);
  });

  it("lève une AppError 403 si le participant n'appartient pas à la session", async () => {
    mockInsertVoteAtomically.mockResolvedValueOnce({ ok: false, failure: "PARTICIPANT_NOT_IN_SESSION" });

    await expect(castVote(1, 1, 5)).rejects.toMatchObject({
      statusCode: 403,
      code: "PARTICIPANT_NOT_IN_SESSION",
    } satisfies Partial<AppError>);
  });

  it("lève une AppError 400 si la session est clôturée", async () => {
    mockInsertVoteAtomically.mockResolvedValueOnce({ ok: false, failure: "SESSION_CLOSED" });

    await expect(castVote(1, 1, 5)).rejects.toMatchObject({
      statusCode: 400,
      code: "SESSION_CLOSED",
    } satisfies Partial<AppError>);
  });

  it("refuse une carte appartenant à une autre session", async () => {
    mockInsertVoteAtomically.mockResolvedValueOnce({ ok: false, failure: "CARD_SESSION_MISMATCH" });

    await expect(castVote(1, 1, 5)).rejects.toMatchObject({
      statusCode: 404,
      code: "CARD_SESSION_MISMATCH",
    } satisfies Partial<AppError>);
  });

  it("refuse un vote hors étape voting", async () => {
    mockInsertVoteAtomically.mockResolvedValueOnce({ ok: false, failure: "VOTING_NOT_OPEN" });

    await expect(castVote(1, 1, 5)).rejects.toMatchObject({
      statusCode: 400,
      code: "VOTING_NOT_OPEN",
    } satisfies Partial<AppError>);
  });

  it("renvoie le quota et le compteur de carte après un vote valide", async () => {
    mockInsertVoteAtomically.mockResolvedValueOnce({
      ok: true,
      voteId: 77,
      votesUsed: MAX_VOTES_PER_SESSION,
      cardVotesCount: 3,
    });

    const result = await castVote(1, 1, 5);

    expect(result).toEqual({ voteId: 77, votesUsed: 5, votesLeft: 0, cardVotesCount: 3 });
  });
});
