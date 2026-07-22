import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import type { Request } from "express";

vi.mock("jsonwebtoken", () => ({
  default: { verify: vi.fn() },
}));

vi.mock("../../services/participant.service", () => ({
  ensureAuthenticatedParticipant: vi.fn(),
  getAuthenticatedParticipantForRead: vi.fn(),
  getGuestParticipantForRead: vi.fn(),
  resumeGuestParticipant: vi.fn(),
}));

vi.mock("../../services/session.service", () => ({
  assertSessionOpen: vi.fn(),
  getSessionDetails: vi.fn(),
}));

import jwt from "jsonwebtoken";
import {
  ensureAuthenticatedParticipant,
  getAuthenticatedParticipantForRead,
  getGuestParticipantForRead,
  resumeGuestParticipant,
} from "../../services/participant.service";
import { assertSessionOpen, getSessionDetails } from "../../services/session.service";
import { resolveSessionActor } from "../sessionActor";

const mockVerify = jwt.verify as unknown as Mock;
const mockEnsureAuthenticatedParticipant = ensureAuthenticatedParticipant as unknown as Mock;
const mockGetAuthenticatedParticipantForRead = getAuthenticatedParticipantForRead as unknown as Mock;
const mockGetGuestParticipantForRead = getGuestParticipantForRead as unknown as Mock;
const mockResumeGuestParticipant = resumeGuestParticipant as unknown as Mock;
const mockAssertSessionOpen = assertSessionOpen as unknown as Mock;
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
    mockGetAuthenticatedParticipantForRead.mockReset();
    mockGetGuestParticipantForRead.mockReset();
    mockResumeGuestParticipant.mockReset();
    mockAssertSessionOpen.mockReset();
    mockGetSessionDetails.mockReset();
  });

  it("valide un participant invité via participantId + guestToken", async () => {
    mockGetGuestParticipantForRead.mockResolvedValueOnce({
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
    expect(mockGetGuestParticipantForRead).toHaveBeenCalledWith(1, 9, "guest-9");
    expect(mockResumeGuestParticipant).not.toHaveBeenCalled();
    expect(mockAssertSessionOpen).not.toHaveBeenCalled();
  });

  it("refuse une identité invitée incomplète", async () => {
    const req = createRequest({ "x-guest-token": "guest-9" });

    await expect(resolveSessionActor(req, 1)).rejects.toMatchObject({
      statusCode: 401,
      code: "GUEST_IDENTITY_INCOMPLETE",
    });
  });

  it("propage le refus backend si le jeton invité ne correspond pas à la session", async () => {
    mockGetGuestParticipantForRead.mockRejectedValueOnce({
      statusCode: 404,
      code: "PARTICIPANT_NOT_FOUND",
    });

    const req = createRequest({ "x-participant-id": "9", "x-guest-token": "guest-9" });

    await expect(resolveSessionActor(req, 2)).rejects.toMatchObject({
      statusCode: 404,
      code: "PARTICIPANT_NOT_FOUND",
    });
    expect(mockGetGuestParticipantForRead).toHaveBeenCalledWith(2, 9, "guest-9");
  });

  it("valide un utilisateur connecté via JWT et session_participants", async () => {
    mockVerify.mockReturnValueOnce({ userId: 1, username: "Elyas" });
    mockGetSessionDetails.mockResolvedValueOnce({ ownerId: 1 });
    mockGetAuthenticatedParticipantForRead.mockResolvedValueOnce({
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
    expect(mockGetAuthenticatedParticipantForRead).toHaveBeenCalledWith(1, 1);
    expect(mockEnsureAuthenticatedParticipant).not.toHaveBeenCalled();
    expect(mockAssertSessionOpen).not.toHaveBeenCalled();
  });

  it("lit un invité d'une session clôturée sans reprise mutatrice", async () => {
    mockGetGuestParticipantForRead.mockResolvedValueOnce({
      id: 9,
      displayName: "Sarah",
      role: "participant",
    });

    const req = createRequest({ "x-participant-id": "9", "x-guest-token": "guest-9" });

    await expect(resolveSessionActor(req, 1)).resolves.toMatchObject({ participantId: 9 });
    expect(mockGetGuestParticipantForRead).toHaveBeenCalledWith(1, 9, "guest-9");
    expect(mockResumeGuestParticipant).not.toHaveBeenCalled();
    expect(mockAssertSessionOpen).not.toHaveBeenCalled();
  });

  it("lit un utilisateur authentifié d'une session clôturée sans jointure mutatrice", async () => {
    mockVerify.mockReturnValueOnce({ userId: 1, username: "Elyas" });
    mockGetSessionDetails.mockResolvedValueOnce({ ownerId: 1, status: "closed" });
    mockGetAuthenticatedParticipantForRead.mockResolvedValueOnce({
      id: 3,
      displayName: "Elyas",
      role: "facilitator",
    });

    const req = createRequest({ authorization: "Bearer token" });

    await expect(resolveSessionActor(req, 1)).resolves.toMatchObject({ participantId: 3 });
    expect(mockGetAuthenticatedParticipantForRead).toHaveBeenCalledWith(1, 1);
    expect(mockEnsureAuthenticatedParticipant).not.toHaveBeenCalled();
    expect(mockAssertSessionOpen).not.toHaveBeenCalled();
  });

  it("utilise la reprise mutatrice uniquement lorsqu'une écriture exige une session ouverte", async () => {
    mockGetSessionDetails.mockResolvedValueOnce({ ownerId: 1, status: "open" });
    mockResumeGuestParticipant.mockResolvedValueOnce({ id: 9, displayName: "Sarah", role: "participant" });

    const req = createRequest({ "x-participant-id": "9", "x-guest-token": "guest-9" });

    await expect(resolveSessionActor(req, 1, { requireOpen: true })).resolves.toMatchObject({ participantId: 9 });
    expect(mockAssertSessionOpen).toHaveBeenCalledWith(expect.objectContaining({ status: "open" }));
    expect(mockResumeGuestParticipant).toHaveBeenCalledWith(1, 9, "guest-9");
    expect(mockGetGuestParticipantForRead).not.toHaveBeenCalled();
  });

  it("utilise la jointure authentifiée uniquement lorsqu'une écriture exige une session ouverte", async () => {
    mockVerify.mockReturnValueOnce({ userId: 1, username: "Elyas" });
    mockGetSessionDetails.mockResolvedValueOnce({ ownerId: 1, status: "open" });
    mockEnsureAuthenticatedParticipant.mockResolvedValueOnce({
      id: 3,
      displayName: "Elyas",
      role: "facilitator",
    });

    const req = createRequest({ authorization: "Bearer token" });

    await expect(resolveSessionActor(req, 1, { requireOpen: true })).resolves.toMatchObject({ participantId: 3 });
    expect(mockAssertSessionOpen).toHaveBeenCalledWith(expect.objectContaining({ status: "open" }));
    expect(mockEnsureAuthenticatedParticipant).toHaveBeenCalledWith({
      sessionId: 1,
      userId: 1,
      displayName: "Elyas",
      role: "facilitator",
    });
    expect(mockGetAuthenticatedParticipantForRead).not.toHaveBeenCalled();
  });
});
