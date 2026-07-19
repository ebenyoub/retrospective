import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import type { Request } from "express";

vi.mock("jsonwebtoken", () => ({
  default: { verify: vi.fn() },
}));

vi.mock("../../services/participant.service", () => ({
  ensureAuthenticatedParticipant: vi.fn(),
  resumeGuestParticipant: vi.fn(),
}));

vi.mock("../../services/session.service", () => ({
  getSessionDetails: vi.fn(),
}));

import jwt from "jsonwebtoken";
import { ensureAuthenticatedParticipant, resumeGuestParticipant } from "../../services/participant.service";
import { getSessionDetails } from "../../services/session.service";
import { resolveSessionActor } from "../sessionActor";

const mockVerify = jwt.verify as unknown as Mock;
const mockEnsureAuthenticatedParticipant = ensureAuthenticatedParticipant as unknown as Mock;
const mockResumeGuestParticipant = resumeGuestParticipant as unknown as Mock;
const mockGetSessionDetails = getSessionDetails as unknown as Mock;

const createRequest = (headers: Record<string, string>): Request =>
  ({
    headers,
    header(name: string) {
      return headers[name.toLowerCase()];
    },
  }) as unknown as Request;

describe("resolveSessionActor", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
    mockVerify.mockReset();
    mockEnsureAuthenticatedParticipant.mockReset();
    mockResumeGuestParticipant.mockReset();
    mockGetSessionDetails.mockReset();
  });

  it("valide un participant invité via participantId + guestToken", async () => {
    mockResumeGuestParticipant.mockResolvedValueOnce({
      id: 9,
      displayName: "Sarah",
      role: "participant",
    });

    const req = createRequest({ "x-participant-id": "9", "x-guest-token": "guest-9" });

    await expect(resolveSessionActor(req, 1)).resolves.toEqual({
      participantId: 9,
      displayName: "Sarah",
      role: "participant",
    });
    expect(mockResumeGuestParticipant).toHaveBeenCalledWith(1, 9, "guest-9");
  });

  it("refuse une identité invitée incomplète", async () => {
    const req = createRequest({ "x-guest-token": "guest-9" });

    await expect(resolveSessionActor(req, 1)).rejects.toMatchObject({
      statusCode: 401,
      code: "GUEST_IDENTITY_INCOMPLETE",
    });
  });

  it("propage le refus backend si le jeton invité ne correspond pas à la session", async () => {
    mockResumeGuestParticipant.mockRejectedValueOnce({
      statusCode: 404,
      code: "PARTICIPANT_NOT_FOUND",
    });

    const req = createRequest({ "x-participant-id": "9", "x-guest-token": "guest-9" });

    await expect(resolveSessionActor(req, 2)).rejects.toMatchObject({
      statusCode: 404,
      code: "PARTICIPANT_NOT_FOUND",
    });
    expect(mockResumeGuestParticipant).toHaveBeenCalledWith(2, 9, "guest-9");
  });

  it("valide un utilisateur connecté via JWT et session_participants", async () => {
    mockVerify.mockReturnValueOnce({ userId: 1, username: "Elyas" });
    mockGetSessionDetails.mockResolvedValueOnce({ ownerId: 1 });
    mockEnsureAuthenticatedParticipant.mockResolvedValueOnce({
      id: 3,
      displayName: "Elyas",
      role: "facilitator",
    });

    const req = createRequest({ authorization: "Bearer token" });

    await expect(resolveSessionActor(req, 1)).resolves.toEqual({
      participantId: 3,
      displayName: "Elyas",
      role: "facilitator",
    });
  });
});
