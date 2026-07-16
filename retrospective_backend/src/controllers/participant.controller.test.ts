import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response, Request } from "express";
import type { Mock } from "vitest";

vi.mock("../services/participant.service", () => ({
  ensureAuthenticatedParticipant: vi.fn(),
  getParticipantsForSession: vi.fn(),
  joinSessionAsGuestParticipantByCode: vi.fn(),
  joinSessionAsGuestParticipant: vi.fn(),
  leaveSession: vi.fn(),
  resumeGuestParticipant: vi.fn(),
  checkGuestResume: vi.fn(),
}));

vi.mock("../services/session.service", () => ({
  getSessionDetails: vi.fn(),
}));

vi.mock("../realtime/socket", () => ({
  emitParticipantsUpdated: vi.fn(),
}));

import {
  guestJoin,
  guestJoinByCode,
  joinAsSelf,
  listParticipants,
  removeParticipant,
  resumeGuest,
  checkGlobalResume,
} from "./participant.controller";
import {
  ensureAuthenticatedParticipant,
  getParticipantsForSession,
  joinSessionAsGuestParticipantByCode,
  joinSessionAsGuestParticipant,
  leaveSession,
  resumeGuestParticipant,
  checkGuestResume,
} from "../services/participant.service";
import { getSessionDetails } from "../services/session.service";
import { emitParticipantsUpdated } from "../realtime/socket";
import type { AuthRequest } from "../types";

const mockEnsureAuthenticatedParticipant = ensureAuthenticatedParticipant as unknown as Mock;
const mockGetParticipantsForSession = getParticipantsForSession as unknown as Mock;
const mockJoinSessionAsGuestParticipantByCode = joinSessionAsGuestParticipantByCode as unknown as Mock;
const mockJoinSessionAsGuestParticipant = joinSessionAsGuestParticipant as unknown as Mock;
const mockLeaveSession = leaveSession as unknown as Mock;
const mockResumeGuestParticipant = resumeGuestParticipant as unknown as Mock;
const mockCheckGuestResume = checkGuestResume as unknown as Mock;
const mockGetSessionDetails = getSessionDetails as unknown as Mock;
const mockEmitParticipantsUpdated = emitParticipantsUpdated as unknown as Mock;

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
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  };
  return res;
};

describe("participant.controller", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
    mockEnsureAuthenticatedParticipant.mockReset();
    mockGetParticipantsForSession.mockReset();
    mockJoinSessionAsGuestParticipantByCode.mockReset();
    mockJoinSessionAsGuestParticipant.mockReset();
    mockLeaveSession.mockReset();
    mockResumeGuestParticipant.mockReset();
    mockGetSessionDetails.mockReset();
    mockEmitParticipantsUpdated.mockReset();
  });

  it("listParticipants renvoie la liste de la session", async () => {
    mockGetParticipantsForSession.mockResolvedValueOnce([{ id: 1, displayName: "Elyas" }]);
    const req = { params: { sessionId: "10" } } as unknown as Request;
    const res = createMockResponse();

    await listParticipants(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    expect(mockGetParticipantsForSession).toHaveBeenCalledWith(10);
  });

  it("joinAsSelf détermine le rôle facilitateur via ownerId et diffuse la mise à jour", async () => {
    mockGetSessionDetails.mockResolvedValueOnce({ ownerId: 5 });
    mockEnsureAuthenticatedParticipant.mockResolvedValueOnce({ id: 1, role: "facilitator" });

    const req = { params: { sessionId: "10" }, user: { userId: 5, username: "Elyas" } } as unknown as AuthRequest;
    const res = createMockResponse();

    await joinAsSelf(req, res as unknown as Response);

    expect(mockEnsureAuthenticatedParticipant).toHaveBeenCalledWith({
      sessionId: 10,
      userId: 5,
      displayName: "Elyas",
      role: "facilitator",
    });
    expect(mockEmitParticipantsUpdated).toHaveBeenCalledWith(10);
  });

  it("joinAsSelf assigne le rôle participant si l'utilisateur n'est pas le propriétaire", async () => {
    mockGetSessionDetails.mockResolvedValueOnce({ ownerId: 999 });
    mockEnsureAuthenticatedParticipant.mockResolvedValueOnce({ id: 2, role: "participant" });

    const req = { params: { sessionId: "10" }, user: { userId: 5, username: "Elyas" } } as unknown as AuthRequest;
    const res = createMockResponse();

    await joinAsSelf(req, res as unknown as Response);

    expect(mockEnsureAuthenticatedParticipant).toHaveBeenCalledWith(
      expect.objectContaining({ role: "participant" })
    );
  });

  it("guestJoin renvoie 201 avec le participant et le guestToken", async () => {
    mockJoinSessionAsGuestParticipant.mockResolvedValueOnce({
      participant: { id: 1, displayName: "EBNoob" },
      guestToken: "secret-token",
    });

    const req = { params: { sessionId: "10" }, body: { pseudo: "EBNoob" } } as unknown as Request;
    const res = createMockResponse();

    await guestJoin(req, res as unknown as Response);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      success: true,
      data: { id: 1, displayName: "EBNoob", guestToken: "secret-token" },
    });
    expect(mockEmitParticipantsUpdated).toHaveBeenCalledWith(10);
  });

  it("guestJoinByCode renvoie 201 avec le participant, le guestToken et diffuse sur la session résolue", async () => {
    mockJoinSessionAsGuestParticipantByCode.mockResolvedValueOnce({
      participant: { id: 1, sessionId: 10, displayName: "EBNoob" },
      guestToken: "secret-token",
    });

    const req = { body: { code: "1234", pseudo: "EBNoob" } } as unknown as Request;
    const res = createMockResponse();

    await guestJoinByCode(req, res as unknown as Response);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      success: true,
      data: { id: 1, sessionId: 10, displayName: "EBNoob", guestToken: "secret-token" },
    });
    expect(mockJoinSessionAsGuestParticipantByCode).toHaveBeenCalledWith("1234", "EBNoob");
    expect(mockEmitParticipantsUpdated).toHaveBeenCalledWith(10);
  });

  it("guestJoin ne capture pas les erreurs du service (ex. pseudo déjà pris)", async () => {
    mockJoinSessionAsGuestParticipant.mockRejectedValueOnce(new Error("boom"));
    const req = { params: { sessionId: "10" }, body: { pseudo: "EBNoob" } } as unknown as Request;
    const res = createMockResponse();

    await expect(guestJoin(req, res as unknown as Response)).rejects.toThrow("boom");
  });

  it("resumeGuest renvoie le participant existant sans le recréer", async () => {
    mockResumeGuestParticipant.mockResolvedValueOnce({ id: 1, displayName: "EBNoob" });
    const req = { params: { sessionId: "10" }, body: { participantId: 1, guestToken: "tok" } } as unknown as Request;
    const res = createMockResponse();

    await resumeGuest(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    expect(mockResumeGuestParticipant).toHaveBeenCalledWith(10, 1, "tok");
  });

  it("removeParticipant supprime puis diffuse la mise à jour", async () => {
    mockLeaveSession.mockResolvedValueOnce(undefined);
    const req = {
      params: { sessionId: "10", participantId: "1" },
      body: { guestToken: "tok" },
      headers: {},
    } as unknown as Request;
    const res = createMockResponse();

    await removeParticipant(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    expect(mockLeaveSession).toHaveBeenCalledWith({
      sessionId: 10,
      participantId: 1,
      requesterUserId: null,
      requesterGuestToken: "tok",
    });
    expect(mockEmitParticipantsUpdated).toHaveBeenCalledWith(10);
  });

  describe("checkGlobalResume", () => {
    beforeEach(() => {
      process.env.JWT_SECRET = "test-secret";
      mockCheckGuestResume.mockReset();
    });

    it("renvoie null si le cookie n'est pas fourni", async () => {
      const req = { cookies: {} } as unknown as Request;
      const res = createMockResponse();

      await checkGlobalResume(req, res as unknown as Response);

      expect(res.body).toEqual({ success: true, data: null });
    });

    it("renvoie null et efface le cookie si le token de reprise est invalide ou expiré", async () => {
      const req = { cookies: { retro_resume: "invalid-token" } } as unknown as Request;
      const res = createMockResponse();

      await checkGlobalResume(req, res as unknown as Response);

      expect(res.body).toEqual({ success: true, data: null });
      expect(res.clearCookie).toHaveBeenCalledWith("retro_resume", expect.any(Object));
    });

    it("renvoie les données de reprise si le token est valide et la session accessible", async () => {
      // Nous allons signer un token de test valide
      const jwt = require("jsonwebtoken");
      const validToken = jwt.sign(
        { sessionId: 10, participantId: 1, displayName: "Elyas", guestToken: "secret" },
        "test-secret"
      );

      mockCheckGuestResume.mockResolvedValueOnce({
        sessionId: 10,
        sessionName: "Super Rétro",
        displayName: "Elyas",
      });

      const req = { cookies: { retro_resume: validToken } } as unknown as Request;
      const res = createMockResponse();

      await checkGlobalResume(req, res as unknown as Response);

      expect(res.body).toEqual({
        success: true,
        data: {
          sessionId: 10,
          sessionName: "Super Rétro",
          displayName: "Elyas",
        },
      });
      expect(mockCheckGuestResume).toHaveBeenCalledWith(10, 1, "secret");
    });

    it("efface le cookie et renvoie null si le service lève une erreur (ex. session fermée)", async () => {
      const jwt = require("jsonwebtoken");
      const validToken = jwt.sign(
        { sessionId: 10, participantId: 1, displayName: "Elyas", guestToken: "secret" },
        "test-secret"
      );

      mockCheckGuestResume.mockRejectedValueOnce(new Error("session non dispo"));

      const req = { cookies: { retro_resume: validToken } } as unknown as Request;
      const res = createMockResponse();

      await checkGlobalResume(req, res as unknown as Response);

      expect(res.body).toEqual({ success: true, data: null });
      expect(res.clearCookie).toHaveBeenCalledWith("retro_resume", expect.any(Object));
    });
  });
});
