import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../models/db", () => ({
  default: { execute: vi.fn() },
}));

vi.mock("../services/session.service", () => ({
  getSessionDetails: vi.fn(),
  updateSessionStepService: vi.fn(),
  updateSessionFormatService: vi.fn(),
}));

vi.mock("../realtime/socket", () => ({
  emitSessionStarted: vi.fn(),
}));

import { getSession, updateSessionStep, updateSessionFormat } from "./step.controller";
import { getSessionDetails, updateSessionStepService, updateSessionFormatService } from "../services/session.service";
import { emitSessionStarted } from "../realtime/socket";
import type { AuthRequest } from '../types';

const mockGetSessionDetails = getSessionDetails as unknown as Mock;
const mockUpdateSessionStepService = updateSessionStepService as unknown as Mock;
const mockUpdateSessionFormatService = updateSessionFormatService as unknown as Mock;
const mockEmitSessionStarted = emitSessionStarted as unknown as Mock;

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
    mockUpdateSessionFormatService.mockReset();
    mockEmitSessionStarted.mockReset();
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
      expect(mockEmitSessionStarted).toHaveBeenCalledWith(7, "writing");
    });
  });

  describe("updateSessionFormat", () => {
    it("met à jour le format et renvoie 200", async () => {
      const updatedSession = { id: 7, formatName: "Mad/Sad/Glad", formatColumns: ["Mad", "Sad", "Glad"] };
      mockUpdateSessionFormatService.mockResolvedValueOnce(updatedSession);

      const req = createMockRequest(1, { sessionId: "7" }, { formatName: "Mad/Sad/Glad", formatColumns: ["Mad", "Sad", "Glad"] });
      const res = createMockResponse();

      await updateSessionFormat(req, res as unknown as Response);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Format de la session mis à jour.",
        data: updatedSession,
      });
      expect(mockUpdateSessionFormatService).toHaveBeenCalledWith(7, 1, "Mad/Sad/Glad", ["Mad", "Sad", "Glad"]);
    });
  });
});
