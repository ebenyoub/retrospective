import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../models/db", () => ({
  default: { execute: vi.fn() },
}));

vi.mock("../services/session.service", () => ({
  joinSessionForUser: vi.fn(),
}));

import joinSession from "./join.controller";
import { joinSessionForUser } from "../services/session.service";
import type { AuthRequest } from '../types';

const mockJoinSessionForUser = joinSessionForUser as unknown as Mock;

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

const createMockRequest = (body: Record<string, unknown>): AuthRequest =>
  ({ user: { userId: 1, username: "Elyas" }, body }) as unknown as AuthRequest;

describe("join.controller", () => {
  beforeEach(() => {
    mockJoinSessionForUser.mockReset();
  });

  it("appelle le service puis renvoie son statut et ses données", async () => {
    mockJoinSessionForUser.mockResolvedValueOnce({
      statusCode: 201,
      message: "Session jointe avec succès.",
      data: { joinId: 9, sessionId: 1 },
    });
    const req = createMockRequest({ code: "1234" });
    const res = createMockResponse();

    await joinSession(req, res as unknown as Response);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      success: true,
      message: "Session jointe avec succès.",
      data: { joinId: 9, sessionId: 1 },
    });
    expect(mockJoinSessionForUser).toHaveBeenCalledWith({ userId: 1, code: "1234" });
  });

  it("ne capture pas les erreurs du service", async () => {
    mockJoinSessionForUser.mockRejectedValueOnce(new Error("boom"));
    const req = createMockRequest({ code: "1234" });
    const res = createMockResponse();

    await expect(joinSession(req, res as unknown as Response)).rejects.toThrow("boom");
  });
});
