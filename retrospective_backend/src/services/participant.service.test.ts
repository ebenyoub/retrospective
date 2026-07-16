import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("../models/participant.model", () => ({
  countParticipants: vi.fn(),
  deleteParticipant: vi.fn(),
  findParticipantByGuestToken: vi.fn(),
  findParticipantById: vi.fn(),
  findParticipantByName: vi.fn(),
  findParticipantByUserId: vi.fn(),
  findParticipantsBySession: vi.fn(),
  insertParticipant: vi.fn(),
  touchParticipant: vi.fn(),
  updateParticipantName: vi.fn(),
}));

vi.mock("../models/session.model", () => ({
  findSessionByCode: vi.fn(),
  findSessionById: vi.fn(),
}));

import {
  countParticipants,
  deleteParticipant,
  findParticipantByGuestToken,
  findParticipantById,
  findParticipantByName,
  findParticipantByUserId,
  findParticipantsBySession,
  insertParticipant,
  touchParticipant,
  updateParticipantName,
} from "../models/participant.model";
import { findSessionByCode, findSessionById } from "../models/session.model";
import {
  checkGuestResume,
  ensureAuthenticatedParticipant,
  getParticipantsForSession,
  joinSessionAsGuestParticipantByCode,
  joinSessionAsGuestParticipant,
  leaveSession,
  renameParticipant,
  resumeGuestParticipant,
} from "./participant.service";
import { AppError } from "../utils/AppError";

const mockCountParticipants = countParticipants as unknown as Mock;
const mockDeleteParticipant = deleteParticipant as unknown as Mock;
const mockFindParticipantByGuestToken = findParticipantByGuestToken as unknown as Mock;
const mockFindParticipantById = findParticipantById as unknown as Mock;
const mockFindParticipantByName = findParticipantByName as unknown as Mock;
const mockFindParticipantByUserId = findParticipantByUserId as unknown as Mock;
const mockFindParticipantsBySession = findParticipantsBySession as unknown as Mock;
const mockInsertParticipant = insertParticipant as unknown as Mock;
const mockTouchParticipant = touchParticipant as unknown as Mock;
const mockUpdateParticipantName = updateParticipantName as unknown as Mock;
const mockFindSessionByCode = findSessionByCode as unknown as Mock;
const mockFindSessionById = findSessionById as unknown as Mock;

const baseParticipantRow = {
  id: 1,
  session_id: 10,
  user_id: null,
  guest_token: "guest-token",
  display_name: "EBNoob",
  role: "participant" as const,
  status: "online" as const,
  joined_at: new Date(),
  last_seen_at: new Date(),
};

describe("participant.service", () => {
  beforeEach(() => {
    mockCountParticipants.mockReset();
    mockDeleteParticipant.mockReset();
    mockFindParticipantByGuestToken.mockReset();
    mockFindParticipantById.mockReset();
    mockFindParticipantByName.mockReset();
    mockFindParticipantByUserId.mockReset();
    mockFindParticipantsBySession.mockReset();
    mockInsertParticipant.mockReset();
    mockTouchParticipant.mockReset();
    mockUpdateParticipantName.mockReset();
    mockFindSessionByCode.mockReset();
    mockFindSessionById.mockReset();
  });

  describe("renameParticipant", () => {
    it("permet à l'invité propriétaire du jeton de changer son pseudo", async () => {
      mockFindParticipantById.mockResolvedValueOnce(baseParticipantRow);
      mockFindParticipantByName.mockResolvedValueOnce(null);

      const result = await renameParticipant({
        sessionId: 10,
        participantId: 1,
        displayName: "Sarah",
        requesterUserId: null,
        requesterGuestToken: "guest-token",
      });

      expect(mockUpdateParticipantName).toHaveBeenCalledWith(1, "Sarah");
      expect(result.displayName).toBe("Sarah");
    });

    it("refuse la modification par un autre participant (403)", async () => {
      mockFindParticipantById.mockResolvedValueOnce(baseParticipantRow);

      await expect(renameParticipant({
        sessionId: 10,
        participantId: 1,
        displayName: "Sarah",
        requesterUserId: null,
        requesterGuestToken: "jeton-de-quelqu-un-d-autre",
      })).rejects.toMatchObject({ statusCode: 403, code: "PARTICIPANT_FORBIDDEN" });

      expect(mockUpdateParticipantName).not.toHaveBeenCalled();
    });

    it("refuse un pseudo déjà pris dans la session (409)", async () => {
      mockFindParticipantById.mockResolvedValueOnce(baseParticipantRow);
      mockFindParticipantByName.mockResolvedValueOnce({ ...baseParticipantRow, id: 2 });

      await expect(renameParticipant({
        sessionId: 10,
        participantId: 1,
        displayName: "Sarah",
        requesterUserId: null,
        requesterGuestToken: "guest-token",
      })).rejects.toMatchObject({ statusCode: 409, code: "PARTICIPANT_NAME_TAKEN" });
    });

    it("ne fait rien si le pseudo est inchangé", async () => {
      mockFindParticipantById.mockResolvedValueOnce(baseParticipantRow);

      const result = await renameParticipant({
        sessionId: 10,
        participantId: 1,
        displayName: "EBNoob",
        requesterUserId: null,
        requesterGuestToken: "guest-token",
      });

      expect(mockUpdateParticipantName).not.toHaveBeenCalled();
      expect(result.displayName).toBe("EBNoob");
    });
  });

  describe("checkGuestResume", () => {
    it("valide une reprise pour une session ouverte et un jeton correct", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 10, name: "Retro", status: "open" });
      mockFindParticipantById.mockResolvedValueOnce(baseParticipantRow);

      const result = await checkGuestResume(10, 1, "guest-token");

      expect(result).toEqual({ sessionId: 10, sessionName: "Retro", displayName: "EBNoob" });
      // La vérification ne remet PAS le participant en ligne.
      expect(mockTouchParticipant).not.toHaveBeenCalled();
    });

    it("refuse la reprise si la session est fermée", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 10, name: "Retro", status: "closed" });

      await expect(checkGuestResume(10, 1, "guest-token")).rejects.toMatchObject({
        statusCode: 404,
        code: "SESSION_UNAVAILABLE",
      });
    });

    it("refuse la reprise avec un jeton invalide", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 10, name: "Retro", status: "open" });
      mockFindParticipantById.mockResolvedValueOnce(baseParticipantRow);

      await expect(checkGuestResume(10, 1, "mauvais-jeton")).rejects.toMatchObject({
        statusCode: 404,
        code: "PARTICIPANT_NOT_FOUND",
      });
    });
  });

  describe("joinSessionAsGuestParticipant", () => {
    it("rejoint avec un pseudo disponible et le conserve tel quel", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 10 });
      mockCountParticipants.mockResolvedValueOnce(1);
      mockFindParticipantByName.mockResolvedValueOnce(null);
      mockInsertParticipant.mockResolvedValueOnce(1);
      mockFindParticipantById.mockResolvedValueOnce(baseParticipantRow);

      const result = await joinSessionAsGuestParticipant(10, "EBNoob");

      expect(result.participant.displayName).toBe("EBNoob");
      expect(result.guestToken).toMatch(/^[0-9a-f]{48}$/);
      expect(mockInsertParticipant).toHaveBeenCalledWith(
        expect.objectContaining({ sessionId: 10, displayName: "EBNoob", role: "participant", userId: null })
      );
    });

    it("refuse un pseudo déjà utilisé dans cette session (409, pas de suffixe)", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 10 });
      mockCountParticipants.mockResolvedValueOnce(1);
      mockFindParticipantByName.mockResolvedValueOnce(baseParticipantRow);

      await expect(joinSessionAsGuestParticipant(10, "EBNoob")).rejects.toMatchObject({
        statusCode: 409,
        code: "PARTICIPANT_NAME_TAKEN",
      } satisfies Partial<AppError>);

      expect(mockInsertParticipant).not.toHaveBeenCalled();
    });



    it("lève une AppError 404 si la session n'existe pas", async () => {
      mockFindSessionById.mockResolvedValueOnce(null);

      await expect(joinSessionAsGuestParticipant(999, "EBNoob")).rejects.toMatchObject({
        statusCode: 404,
        code: "SESSION_NOT_FOUND",
      } satisfies Partial<AppError>);
    });
  });

  describe("joinSessionAsGuestParticipantByCode", () => {
    it("résout le code puis rejoint la session invitée", async () => {
      mockFindSessionByCode.mockResolvedValueOnce({ id: 10 });
      mockFindSessionById.mockResolvedValueOnce({ id: 10 });
      mockCountParticipants.mockResolvedValueOnce(1);
      mockFindParticipantByName.mockResolvedValueOnce(null);
      mockInsertParticipant.mockResolvedValueOnce(1);
      mockFindParticipantById.mockResolvedValueOnce(baseParticipantRow);

      const result = await joinSessionAsGuestParticipantByCode("1234", "EBNoob");

      expect(result.participant.sessionId).toBe(10);
      expect(mockFindSessionByCode).toHaveBeenCalledWith("1234");
    });

    it("lève une AppError 404 si le code ne correspond à aucune session", async () => {
      mockFindSessionByCode.mockResolvedValueOnce(null);

      await expect(joinSessionAsGuestParticipantByCode("9999", "EBNoob")).rejects.toMatchObject({
        statusCode: 404,
        code: "SESSION_CODE_NOT_FOUND",
      } satisfies Partial<AppError>);

      expect(mockInsertParticipant).not.toHaveBeenCalled();
    });
  });

  describe("resumeGuestParticipant (refresh/reconnexion)", () => {
    it("retrouve le participant existant sans en recréer un nouveau", async () => {
      mockFindParticipantById.mockResolvedValueOnce(baseParticipantRow);

      const result = await resumeGuestParticipant(10, 1, "guest-token");

      expect(result.id).toBe(1);
      expect(mockInsertParticipant).not.toHaveBeenCalled();
      expect(mockTouchParticipant).toHaveBeenCalledWith(1, "online");
    });

    it("refuse si le jeton ne correspond pas", async () => {
      mockFindParticipantById.mockResolvedValueOnce(baseParticipantRow);

      await expect(resumeGuestParticipant(10, 1, "mauvais-token")).rejects.toMatchObject({
        statusCode: 404,
        code: "PARTICIPANT_NOT_FOUND",
      } satisfies Partial<AppError>);
    });
  });

  describe("ensureAuthenticatedParticipant (facilitateur inclus)", () => {
    it("réutilise la ligne existante sans doublon lors d'un refresh", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 10 });
      mockFindParticipantByUserId.mockResolvedValueOnce({ ...baseParticipantRow, user_id: 3, guest_token: null });

      const result = await ensureAuthenticatedParticipant({ sessionId: 10, userId: 3, displayName: "Elyas", role: "facilitator" });

      expect(result.id).toBe(1);
      expect(mockInsertParticipant).not.toHaveBeenCalled();
    });

    it("crée la ligne du facilitateur au premier accès", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 10 });
      mockFindParticipantByUserId.mockResolvedValueOnce(null);
      mockCountParticipants.mockResolvedValueOnce(0);
      mockFindParticipantByName.mockResolvedValueOnce(null);
      mockInsertParticipant.mockResolvedValueOnce(2);
      mockFindParticipantById.mockResolvedValueOnce({ ...baseParticipantRow, id: 2, user_id: 3, guest_token: null, role: "facilitator" });

      const result = await ensureAuthenticatedParticipant({ sessionId: 10, userId: 3, displayName: "Elyas", role: "facilitator" });

      expect(result.role).toBe("facilitator");
      expect(mockInsertParticipant).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 3, displayName: "Elyas", role: "facilitator" })
      );
    });
  });

  describe("leaveSession", () => {
    it("supprime la participation quand le jeton invité correspond", async () => {
      mockFindParticipantById.mockResolvedValueOnce(baseParticipantRow);

      await leaveSession({ sessionId: 10, participantId: 1, requesterUserId: null, requesterGuestToken: "guest-token" });

      expect(mockDeleteParticipant).toHaveBeenCalledWith(1);
    });

    it("refuse de supprimer la participation d'un autre (403)", async () => {
      mockFindParticipantById.mockResolvedValueOnce(baseParticipantRow);

      await expect(
        leaveSession({ sessionId: 10, participantId: 1, requesterUserId: null, requesterGuestToken: "autre-token" })
      ).rejects.toMatchObject({ statusCode: 403, code: "PARTICIPANT_FORBIDDEN" } satisfies Partial<AppError>);

      expect(mockDeleteParticipant).not.toHaveBeenCalled();
    });
  });

  describe("getParticipantsForSession", () => {
    it("mappe les lignes en résumé camelCase", async () => {
      mockFindParticipantsBySession.mockResolvedValueOnce([baseParticipantRow]);

      const result = await getParticipantsForSession(10);

      expect(result).toEqual([
        {
          id: 1,
          sessionId: 10,
          displayName: "EBNoob",
          role: "participant",
          status: "online",
          joinedAt: baseParticipantRow.joined_at,
          lastSeenAt: baseParticipantRow.last_seen_at,
        },
      ]);
    });
  });
});
