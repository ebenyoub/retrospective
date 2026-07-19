import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../../services/vote.service", () => ({
  castVote: vi.fn(),
}));

vi.mock("../../utils/sessionActor", () => ({
  resolveSessionActor: vi.fn(),
}));

import { castVote } from "../../services/vote.service";
import { resolveSessionActor } from "../../utils/sessionActor";
import { voteForCard } from "../vote.controller";
import type { AuthRequest } from "../../types";

const mockCastVote = castVote as unknown as Mock;
const mockResolveSessionActor = resolveSessionActor as unknown as Mock;

const createMockResponse = () => {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code;
      return res as unknown as Response;
    },
    json(payload: unknown) {
      res.body = payload;
      return res as unknown as Response;
    },
  };
  return res;
};

const createMockRequest = (cardId: string): AuthRequest =>
  ({
    user: { userId: 1, username: "Elyas" },
    params: { sessionId: "1", cardId },
  }) as unknown as AuthRequest;

describe("vote.controller", () => {
  beforeEach(() => {
    mockCastVote.mockReset();
    mockResolveSessionActor.mockReset();
    mockResolveSessionActor.mockResolvedValue({ participantId: 9, displayName: "Sarah", role: "participant" });
  });

  it("renvoie 201 et l'id du vote si le service réussit", async () => {
    mockCastVote.mockResolvedValueOnce({ voteId: 42 });

    const req = createMockRequest("5");
    const res = createMockResponse();

    await voteForCard(req, res as unknown as Response);

    expect(res.statusCode).toBe(201);
    const body = res.body as { success: boolean; data: { voteId: number } };
    expect(body.success).toBe(true);
    expect(body.data.voteId).toBe(42);
    expect(mockResolveSessionActor).toHaveBeenCalledWith(req, 1);
    expect(mockCastVote).toHaveBeenCalledWith(9, 5);
  });

  it("ne capture pas les erreurs du service (remontée au middleware d'erreur)", async () => {
    mockCastVote.mockRejectedValueOnce(new Error("boom"));

    const req = createMockRequest("5");
    const res = createMockResponse();

    await expect(voteForCard(req, res as unknown as Response)).rejects.toThrow("boom");
  });
});
