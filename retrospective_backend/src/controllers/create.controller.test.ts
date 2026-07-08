import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../models/db", () => ({
  default: { execute: vi.fn() },
}));

vi.mock("../services/session.service", () => ({
  createSessionForUser: vi.fn(),
}));

import { createSession } from "./create.controller";
import { createSessionForUser } from "../services/session.service";
import type { AuthRequest } from '../types';

const mockCreateSessionForUser = createSessionForUser as unknown as Mock;

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

const createMockRequest = (userId?: number, body?: any): AuthRequest =>
  ({
    user: userId ? { userId, username: "Elyas" } : {},
    body: body || {}
  }) as unknown as AuthRequest;

describe("create.controller", () => {
  beforeEach(() => {
    mockCreateSessionForUser.mockReset();
  });

  it("appelle le service puis renvoie son statut et ses données", async () => {
    mockCreateSessionForUser.mockResolvedValueOnce({
      statusCode: 201,
      message: "Session créée.",
      data: { sessionId: 7, code: "1234", expiresAt: "2026-07-08T11:00:00.000Z" },
    });
    const req = createMockRequest(undefined, { name: "Ma Super Session" });
    const res = createMockResponse();

    await createSession(req, res as unknown as Response);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      success: true,
      message: "Session créée.",
      data: { sessionId: 7, code: "1234", expiresAt: "2026-07-08T11:00:00.000Z" },
    });
    expect(mockCreateSessionForUser).toHaveBeenCalledWith({ userId: undefined, name: "Ma Super Session" });
  });

  it("ne capture pas les erreurs du service", async () => {
    mockCreateSessionForUser.mockRejectedValueOnce(new Error("boom"));
    const req = createMockRequest(1);
    const res = createMockResponse();

    await expect(createSession(req, res as unknown as Response)).rejects.toThrow("boom");
  });
});
