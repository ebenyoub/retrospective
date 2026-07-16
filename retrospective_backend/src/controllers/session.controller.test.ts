import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../models/db", () => ({
  default: { execute: vi.fn() },
}));

vi.mock("../services/session.service", () => ({
  createSessionForUser: vi.fn(),
  joinSessionForUser: vi.fn(),
  getSessionsForUser: vi.fn(),
  getSessionDetails: vi.fn(),
  updateSessionStepService: vi.fn(),
  updateSessionTimerService: vi.fn(),
  updateSessionFormatService: vi.fn(),
  closeSessionService: vi.fn(),
  updateSessionNameService: vi.fn(),
  deleteSessionService: vi.fn(),
}));

vi.mock("../realtime/socket", () => ({
  emitSessionStarted: vi.fn(),
  emitSessionTimerUpdated: vi.fn(),
  emitSessionClosed: vi.fn(),
}));

import {
  createSession,
  joinSession,
  listSessions,
  getSession,
  updateSessionStep,
  updateSessionFormat,
  updateSessionTimer,
  closeSession,
  updateSessionName,
  deleteSession,
} from "./session.controller";
import {
  createSessionForUser,
  joinSessionForUser,
  getSessionsForUser,
  getSessionDetails,
  updateSessionStepService,
  updateSessionTimerService,
  updateSessionFormatService,
  closeSessionService,
  updateSessionNameService,
  deleteSessionService,
} from "../services/session.service";
import { emitSessionStarted, emitSessionTimerUpdated, emitSessionClosed } from "../realtime/socket";
import type { AuthRequest } from "../types";

const mockCreateSessionForUser = createSessionForUser as unknown as Mock;
const mockJoinSessionForUser = joinSessionForUser as unknown as Mock;
const mockGetSessionsForUser = getSessionsForUser as unknown as Mock;
const mockGetSessionDetails = getSessionDetails as unknown as Mock;
const mockUpdateSessionStepService = updateSessionStepService as unknown as Mock;
const mockUpdateSessionTimerService = updateSessionTimerService as unknown as Mock;
const mockUpdateSessionFormatService = updateSessionFormatService as unknown as Mock;
const mockCloseSessionService = closeSessionService as unknown as Mock;
const mockUpdateSessionNameService = updateSessionNameService as unknown as Mock;
const mockDeleteSessionService = deleteSessionService as unknown as Mock;
const mockEmitSessionStarted = emitSessionStarted as unknown as Mock;
const mockEmitSessionTimerUpdated = emitSessionTimerUpdated as unknown as Mock;
const mockEmitSessionClosed = emitSessionClosed as unknown as Mock;

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

const createMockRequest = (userId?: number, params?: Record<string, unknown>, body?: Record<string, unknown>): AuthRequest =>
  ({
    user: userId ? { userId, username: "Elyas" } : {},
    params: params || {},
    body: body || {},
  }) as unknown as AuthRequest;

describe("session.controller", () => {
  beforeEach(() => {
    mockCreateSessionForUser.mockReset();
    mockJoinSessionForUser.mockReset();
    mockGetSessionsForUser.mockReset();
    mockGetSessionDetails.mockReset();
    mockUpdateSessionStepService.mockReset();
    mockUpdateSessionTimerService.mockReset();
    mockUpdateSessionFormatService.mockReset();
    mockCloseSessionService.mockReset();
    mockUpdateSessionNameService.mockReset();
    mockDeleteSessionService.mockReset();
    mockEmitSessionStarted.mockReset();
    mockEmitSessionTimerUpdated.mockReset();
    mockEmitSessionClosed.mockReset();
  });

  describe("createSession", () => {
    it("appelle le service puis renvoie son statut et ses données", async () => {
      mockCreateSessionForUser.mockResolvedValueOnce({
        statusCode: 201,
        message: "Session créée.",
        data: { sessionId: 7, code: "1234", expiresAt: "2026-07-08T11:00:00.000Z" },
      });
      const req = createMockRequest(undefined, {}, {
        name: "Ma Super Session",
        formatName: "Succès / Difficultés / Idées",
        formatColumns: ["Succès", "Difficultés", "Idées"],
      });
      const res = createMockResponse();

      await createSession(req, res as unknown as Response);

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        success: true,
        message: "Session créée.",
        data: { sessionId: 7, code: "1234", expiresAt: "2026-07-08T11:00:00.000Z" },
      });
      expect(mockCreateSessionForUser).toHaveBeenCalledWith({
        userId: undefined,
        name: "Ma Super Session",
        formatName: "Succès / Difficultés / Idées",
        formatColumns: ["Succès", "Difficultés", "Idées"],
      });
    });

    it("ne capture pas les erreurs du service", async () => {
      mockCreateSessionForUser.mockRejectedValueOnce(new Error("boom"));
      const req = createMockRequest(1);
      const res = createMockResponse();

      await expect(createSession(req, res as unknown as Response)).rejects.toThrow("boom");
    });
  });

  describe("joinSession", () => {
    it("appelle le service puis renvoie son statut et ses données", async () => {
      mockJoinSessionForUser.mockResolvedValueOnce({
        statusCode: 201,
        message: "Session jointe avec succès.",
        data: { joinId: 9, sessionId: 1 },
      });
      const req = createMockRequest(1, {}, { code: "1234" });
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
      const req = createMockRequest(1, {}, { code: "1234" });
      const res = createMockResponse();

      await expect(joinSession(req, res as unknown as Response)).rejects.toThrow("boom");
    });
  });

  describe("listSessions", () => {
    it("renvoie 200 et une liste vide si le service ne renvoie aucune session", async () => {
      mockGetSessionsForUser.mockResolvedValueOnce([]);
      const req = createMockRequest(1);
      const res = createMockResponse();

      await listSessions(req, res as unknown as Response);

      expect(res.statusCode).toBe(200);
      const body = res.body as { success: boolean; data: unknown[] };
      expect(body.data).toEqual([]);
    });

    it("renvoie 200 et les sessions telles que fournies par le service", async () => {
      const createdAt = new Date("2026-07-08T09:00:00.000Z");
      const expiresAt = new Date("2026-07-08T10:00:00.000Z");
      const sessions = [
        { id: 1, code: "1234", status: "open", expiresAt, createdAt, role: "facilitator" as const },
      ];
      mockGetSessionsForUser.mockResolvedValueOnce(sessions);
      const req = createMockRequest(1);
      const res = createMockResponse();

      await listSessions(req, res as unknown as Response);

      expect(res.statusCode).toBe(200);
      const body = res.body as { success: boolean; data: unknown[] };
      expect(body.data).toEqual(sessions);
      expect(mockGetSessionsForUser).toHaveBeenCalledWith(1);
    });

    it("ne capture pas les erreurs du service (remontée au middleware d'erreur)", async () => {
      mockGetSessionsForUser.mockRejectedValueOnce(new Error("boom"));
      const req = createMockRequest(1);
      const res = createMockResponse();

      await expect(listSessions(req, res as unknown as Response)).rejects.toThrow("boom");
    });
  });

  describe("getSession", () => {
    it("renvoie les détails de session", async () => {
      const mockSession = { id: 7, name: "S1", code: "1234", status: "open", step: "waiting" };
      mockGetSessionDetails.mockResolvedValueOnce(mockSession);
      const req = createMockRequest(1, { sessionId: "7" });
      const res = createMockResponse();

      await getSession(req, res as unknown as Response);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ success: true, data: mockSession });
      expect(mockGetSessionDetails).toHaveBeenCalledWith(7);
    });
  });

  describe("updateSessionStep", () => {
    it("met à jour l'étape et renvoie 200", async () => {
      mockUpdateSessionStepService.mockResolvedValueOnce({ stepEndsAt: "2026-07-15T15:05:00.000Z" });
      const req = createMockRequest(1, { sessionId: "7" }, { step: "writing" });
      const res = createMockResponse();

      await updateSessionStep(req, res as unknown as Response);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Étape de la session mise à jour.",
        data: { step: "writing", stepEndsAt: "2026-07-15T15:05:00.000Z" },
      });
      expect(mockUpdateSessionStepService).toHaveBeenCalledWith(7, 1, "writing");
      // L'échéance calculée par le serveur est diffusée à toute la room.
      expect(mockEmitSessionStarted).toHaveBeenCalledWith(7, "writing", "2026-07-15T15:05:00.000Z");
    });
  });

  describe("updateSessionTimer", () => {
    it("met à jour le timer et diffuse la nouvelle échéance", async () => {
      mockUpdateSessionTimerService.mockResolvedValueOnce({
        stepEndsAt: "2026-07-15T15:10:00.000Z",
        stepDurationMinutes: 5,
      });
      const req = createMockRequest(1, { sessionId: "7" }, { minutes: 10 });
      const res = createMockResponse();

      await updateSessionTimer(req, res as unknown as Response);

      expect(res.statusCode).toBe(200);
      expect(mockUpdateSessionTimerService).toHaveBeenCalledWith(7, 1, 10);
      expect(mockEmitSessionTimerUpdated).toHaveBeenCalledWith(7, "2026-07-15T15:10:00.000Z");
    });

    it("en salle d'attente (pas d'échéance), ne diffuse rien", async () => {
      mockUpdateSessionTimerService.mockResolvedValueOnce({ stepEndsAt: null, stepDurationMinutes: 10 });
      const req = createMockRequest(1, { sessionId: "7" }, { minutes: 10 });
      const res = createMockResponse();

      await updateSessionTimer(req, res as unknown as Response);

      expect(res.statusCode).toBe(200);
      expect(mockEmitSessionTimerUpdated).not.toHaveBeenCalled();
    });
  });

  describe("updateSessionFormat", () => {
    it("met à jour le format et renvoie 200", async () => {
      const updatedSession = { id: 7, formatName: "Succès / Difficultés / Idées", formatColumns: ["Succès", "Difficultés", "Idées"] };
      mockUpdateSessionFormatService.mockResolvedValueOnce(updatedSession);
      const req = createMockRequest(1, { sessionId: "7" }, { formatName: "Succès / Difficultés / Idées", formatColumns: ["Succès", "Difficultés", "Idées"] });
      const res = createMockResponse();

      await updateSessionFormat(req, res as unknown as Response);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Format de la session mis à jour.",
        data: updatedSession,
      });
      expect(mockUpdateSessionFormatService).toHaveBeenCalledWith(7, 1, "Succès / Difficultés / Idées", ["Succès", "Difficultés", "Idées"]);
    });
  });

  describe("closeSession", () => {
    it("ferme la session et renvoie 200", async () => {
      mockCloseSessionService.mockResolvedValueOnce(undefined);
      const req = createMockRequest(1, { sessionId: "7" });
      const res = createMockResponse();

      await closeSession(req, res as unknown as Response);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "La session a été fermée avec succès.",
      });
      expect(mockCloseSessionService).toHaveBeenCalledWith(7, 1);
      expect(mockEmitSessionClosed).toHaveBeenCalledWith(7);
    });

    it("lève une erreur si l'ID de session est absent", async () => {
      const req = createMockRequest(1, { sessionId: "" });
      const res = createMockResponse();

      await expect(closeSession(req, res as unknown as Response)).rejects.toMatchObject({
        statusCode: 400,
        code: "SESSION_ID_REQUIRED",
      });
      expect(mockCloseSessionService).not.toHaveBeenCalled();
    });
  });

  describe("updateSessionName", () => {
    it("renomme la session et renvoie 200", async () => {
      mockUpdateSessionNameService.mockResolvedValueOnce(undefined);
      const req = createMockRequest(1, { sessionId: "7" }, { name: "Sprint 42 Rétro" });
      const res = createMockResponse();

      await updateSessionName(req, res as unknown as Response);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Le nom de la session a été mis à jour avec succès.",
      });
      expect(mockUpdateSessionNameService).toHaveBeenCalledWith(7, 1, "Sprint 42 Rétro");
    });

    it("lève une erreur si l'ID de session est absent", async () => {
      const req = createMockRequest(1, { sessionId: "" }, { name: "Sprint 42 Rétro" });
      const res = createMockResponse();

      await expect(updateSessionName(req, res as unknown as Response)).rejects.toMatchObject({
        statusCode: 400,
        code: "SESSION_ID_REQUIRED",
      });
    });
  });

  describe("deleteSession", () => {
    it("supprime la session et renvoie 200", async () => {
      mockDeleteSessionService.mockResolvedValueOnce(undefined);
      const req = createMockRequest(1, { sessionId: "7" });
      const res = createMockResponse();

      await deleteSession(req, res as unknown as Response);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "La session a été supprimée avec succès.",
      });
      expect(mockDeleteSessionService).toHaveBeenCalledWith(7, 1);
    });

    it("lève une erreur si l'ID de session est absent", async () => {
      const req = createMockRequest(1, { sessionId: "" });
      const res = createMockResponse();

      await expect(deleteSession(req, res as unknown as Response)).rejects.toMatchObject({
        statusCode: 400,
        code: "SESSION_ID_REQUIRED",
      });
    });
  });
});
