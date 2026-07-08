import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../models/db", () => ({
  default: { execute: vi.fn() },
}));

vi.mock("../services/session.service", () => ({
  getSessionDetails: vi.fn(),
  updateSessionStepService: vi.fn(),
}));

import { getSession, updateSessionStep } from "./step.controller";
import { getSessionDetails, updateSessionStepService } from "../services/session.service";
import type { AuthRequest } from '../types';

const mockGetSessionDetails = getSessionDetails as unknown as Mock;
const mockUpdateSessionStepService = updateSessionStepService as unknown as Mock;

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

const createMockRequest = (userId?: number, params?: any, body?: any): AuthRequest =>
  ({
    user: userId ? { userId, username: "Elyas" } : {},
    params: params || {},
    body: body || {}
  }) as unknown as AuthRequest;

describe("step.controller", () => {
  beforeEach(() => {
    mockGetSessionDetails.mockReset();
    mockUpdateSessionStepService.mockReset();
  });

  describe("getSession", () => {
    it("renvoie les détails de session", async () => {
      const mockSession = { id: 7, name: "S1", code: "1234", status: "open", step: "waiting" };
      mockGetSessionDetails.mockResolvedValueOnce(mockSession);

      const req = createMockRequest(1, { sessionId: "7" });
      const res = createMockResponse();

      await getSession(req, res as unknown as Response);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: mockSession,
      });
      expect(mockGetSessionDetails).toHaveBeenCalledWith(7);
    });
  });

  describe("updateSessionStep", () => {
    it("met à jour l'étape et renvoie 200", async () => {
      mockUpdateSessionStepService.mockResolvedValueOnce(true);

      const req = createMockRequest(1, { sessionId: "7" }, { step: "writing" });
      const res = createMockResponse();

      await updateSessionStep(req, res as unknown as Response);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Étape de la session mise à jour.",
        data: { step: "writing" },
      });
      expect(mockUpdateSessionStepService).toHaveBeenCalledWith(7, 1, "writing");
    });
  });
});
