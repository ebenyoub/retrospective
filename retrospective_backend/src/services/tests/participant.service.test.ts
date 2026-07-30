import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("../../models/participant.model", () => ({
  countParticipants: vi.fn(),
  deleteParticipant: vi.fn(),
  findParticipantByGuestToken: vi.fn(),
  findParticipantById: vi.fn(),
  findParticipantByName: vi.fn(),
  findParticipantByUserId: vi.fn(),
  findParticipantsBySession: vi.fn(),
  insertParticipant: vi.fn(),
  setParticipantGuestToken: vi.fn(),
  touchParticipant: vi.fn(),
  updateParticipantName: vi.fn(),
}));

vi.mock("../../models/session.model", () => ({
  closeSessionIfExpiredByCode: vi.fn(),
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
  setParticipantGuestToken,
  touchParticipant,
  updateParticipantName,
} from "../../models/participant.model";
import { findSessionByCode, findSessionById } from "../../models/session.model";
import {
  checkGuestResume,
  ensureAuthenticatedParticipant,
  getAuthenticatedParticipantForRead,
  getGuestParticipantForRead,
  getParticipantsForSession,
  joinSessionAsGuestParticipantByCode,
  joinSessionAsGuestParticipant,
  leaveSession,
  reconnectFromResumeCookie,
  renameParticipant,
  resumeGuestParticipant,
} from "../participant.service";
import { AppError } from "../../utils/AppError";

const mockCountParticipants = countParticipants as unknown as Mock;
const mockDeleteParticipant = deleteParticipant as unknown as Mock;
const mockFindParticipantByGuestToken = findParticipantByGuestToken as unknown as Mock;
const mockFindParticipantById = findParticipantById as unknown as Mock;
const mockFindParticipantByName = findParticipantByName as unknown as Mock;
const mockFindParticipantByUserId = findParticipantByUserId as unknown as Mock;
const mockFindParticipantsBySession = findParticipantsBySession as unknown as Mock;
const mockInsertParticipant = insertParticipant as unknown as Mock;
const mockSetParticipantGuestToken = setParticipantGuestToken as unknown as Mock;
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
    mockSetParticipantGuestToken.mockReset();
    mockTouchParticipant.mockReset();
    mockUpdateParticipantName.mockReset();
    mockFindSessionByCode.mockReset();
    mockFindSessionById.mockReset();
    mockFindSessionById.mockResolvedValue({ id: 10, status: "open" });
  });

  describe("renameParticipant", () => {
    it("refuse de renommer un participant sur une session clôturée", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 10, status: "closed" });

      await expect(renameParticipant({
        sessionId: 10,
        participantId: 1,
        displayName: "Sarah",
        requesterUserId: null,
        requesterGuestToken: "guest-token",
      })).rejects.toMatchObject({ statusCode: 400, code: "SESSION_CLOSED" } satisfies Partial<AppError>);
      expect(mockUpdateParticipantName).not.toHaveBeenCalled();
    });

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

    it("refuse le renommage si le jeton invité a plus de 24h (T-PART-02)", async () => {
      const joinedOver24hAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
      mockFindParticipantById.mockResolvedValueOnce({ ...baseParticipantRow, joined_at: joinedOver24hAgo });

      await expect(renameParticipant({
        sessionId: 10,
        participantId: 1,
        displayName: "Sarah",
        requesterUserId: null,
        requesterGuestToken: "guest-token",
      })).rejects.toMatchObject({ statusCode: 401, code: "GUEST_TOKEN_EXPIRED" });

      expect(mockUpdateParticipantName).not.toHaveBeenCalled();
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

    it("refuse la reprise si le jeton invité a plus de 24h (T-PART-02)", async () => {
      const joinedOver24hAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
      mockFindSessionById.mockResolvedValueOnce({ id: 10, name: "Retro", status: "open" });
      mockFindParticipantById.mockResolvedValueOnce({ ...baseParticipantRow, joined_at: joinedOver24hAgo });

      await expect(checkGuestResume(10, 1, "guest-token")).rejects.toMatchObject({
        statusCode: 401,
        code: "GUEST_TOKEN_EXPIRED",
      });
    });
  });

  describe("joinSessionAsGuestParticipant", () => {
    it("rejoint avec un pseudo disponible et le conserve tel quel", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 10, status: "open" });
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
      mockFindSessionById.mockResolvedValueOnce({ id: 10, status: "open" });
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

    it("refuse de rejoindre une session clôturée (un invité ne peut jamais l'ouvrir)", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 10, status: "closed" });

      await expect(joinSessionAsGuestParticipant(10, "EBNoob")).rejects.toMatchObject({
        statusCode: 400,
        code: "SESSION_CLOSED",
      } satisfies Partial<AppError>);
      expect(mockInsertParticipant).not.toHaveBeenCalled();
    });
  });

  describe("joinSessionAsGuestParticipantByCode", () => {
    it("résout le code puis rejoint la session invitée", async () => {
      mockFindSessionByCode.mockResolvedValueOnce({ id: 10 });
      mockFindSessionById.mockResolvedValueOnce({ id: 10, status: "open" });
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

    it("refuse si le jeton invité a plus de 24h (T-PART-02)", async () => {
      const joinedOver24hAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
      mockFindParticipantById.mockResolvedValueOnce({ ...baseParticipantRow, joined_at: joinedOver24hAgo });

      await expect(resumeGuestParticipant(10, 1, "guest-token")).rejects.toMatchObject({
        statusCode: 401,
        code: "GUEST_TOKEN_EXPIRED",
      } satisfies Partial<AppError>);
      expect(mockTouchParticipant).not.toHaveBeenCalled();
    });

    it("accepte un jeton invité de moins de 24h", async () => {
      const joinedUnder24hAgo = new Date(Date.now() - 23 * 60 * 60 * 1000);
      mockFindParticipantById.mockResolvedValueOnce({ ...baseParticipantRow, joined_at: joinedUnder24hAgo });

      await expect(resumeGuestParticipant(10, 1, "guest-token")).resolves.toMatchObject({ id: 1 });
    });
  });

  describe("reconnectFromResumeCookie", () => {
    it("refuse si le participant n'existe pas ou n'appartient pas à la session", async () => {
      mockFindParticipantById.mockResolvedValueOnce(null);

      await expect(reconnectFromResumeCookie(10, 1)).rejects.toMatchObject({
        statusCode: 404,
        code: "PARTICIPANT_NOT_FOUND",
      } satisfies Partial<AppError>);
      expect(mockTouchParticipant).not.toHaveBeenCalled();
    });

    it("refuse si le participant appartient à une autre session", async () => {
      mockFindParticipantById.mockResolvedValueOnce({ ...baseParticipantRow, session_id: 999 });

      await expect(reconnectFromResumeCookie(10, 1)).rejects.toMatchObject({
        statusCode: 404,
        code: "PARTICIPANT_NOT_FOUND",
      } satisfies Partial<AppError>);
    });

    it("refuse si le jeton invité a plus de 24h (T-PART-02)", async () => {
      const joinedOver24hAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
      mockFindParticipantById.mockResolvedValueOnce({ ...baseParticipantRow, joined_at: joinedOver24hAgo });

      await expect(reconnectFromResumeCookie(10, 1)).rejects.toMatchObject({
        statusCode: 401,
        code: "GUEST_TOKEN_EXPIRED",
      } satisfies Partial<AppError>);
      expect(mockTouchParticipant).not.toHaveBeenCalled();
    });

    it("réutilise le jeton invité existant sans en générer un nouveau", async () => {
      mockFindParticipantById.mockResolvedValueOnce(baseParticipantRow);

      const result = await reconnectFromResumeCookie(10, 1);

      expect(result.guestToken).toBe("guest-token");
      expect(mockSetParticipantGuestToken).not.toHaveBeenCalled();
      expect(mockTouchParticipant).toHaveBeenCalledWith(1, "online");
    });

    it("génère et persiste un nouveau jeton pour une participation authentifiée sans jeton invité", async () => {
      mockFindParticipantById.mockResolvedValueOnce({ ...baseParticipantRow, user_id: 3, guest_token: null });

      const result = await reconnectFromResumeCookie(10, 1);

      expect(result.guestToken).toMatch(/^[0-9a-f]{48}$/);
      expect(mockSetParticipantGuestToken).toHaveBeenCalledWith(1, result.guestToken);
      expect(mockTouchParticipant).toHaveBeenCalledWith(1, "online");
    });
  });

  describe("getGuestParticipantForRead", () => {
    it("lit une identité invitée sur session clôturée sans mutation de présence", async () => {
      mockFindParticipantById.mockResolvedValueOnce({ ...baseParticipantRow, status: "offline" });

      const result = await getGuestParticipantForRead(10, 1, "guest-token");

      expect(result).toMatchObject({ id: 1, sessionId: 10, displayName: "EBNoob", status: "offline" });
      expect(mockTouchParticipant).not.toHaveBeenCalled();
      expect(mockInsertParticipant).not.toHaveBeenCalled();
      expect(mockUpdateParticipantName).not.toHaveBeenCalled();
      expect(mockDeleteParticipant).not.toHaveBeenCalled();
    });
  });

  describe("ensureAuthenticatedParticipant (facilitateur inclus)", () => {
    it("réutilise la ligne existante sans doublon lors d'un refresh", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 10, status: "open" });
      mockFindParticipantByUserId.mockResolvedValueOnce({ ...baseParticipantRow, user_id: 3, guest_token: null });

      const result = await ensureAuthenticatedParticipant({ sessionId: 10, userId: 3, displayName: "Elyas", role: "facilitator" });

      expect(result.id).toBe(1);
      expect(mockInsertParticipant).not.toHaveBeenCalled();
    });

    it("crée la ligne du facilitateur au premier accès", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 10, status: "open" });
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

    it("refuse une reprise authentifiée sur une session clôturée", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 10, status: "closed" });
      mockFindParticipantByUserId.mockResolvedValueOnce({ ...baseParticipantRow, user_id: 3, guest_token: null });

      await expect(ensureAuthenticatedParticipant({ sessionId: 10, userId: 3, displayName: "Elyas", role: "facilitator" }))
        .rejects.toMatchObject({ statusCode: 400, code: "SESSION_CLOSED" } satisfies Partial<AppError>);
      expect(mockFindParticipantByUserId).not.toHaveBeenCalled();
    });
  });

  describe("getAuthenticatedParticipantForRead", () => {
    it("lit une identité authentifiée existante sur session clôturée sans créer ni toucher la participation", async () => {
      mockFindParticipantByUserId.mockResolvedValueOnce({
        ...baseParticipantRow,
        user_id: 3,
        guest_token: null,
        status: "offline",
      });

      const result = await getAuthenticatedParticipantForRead(10, 3);

      expect(result).toMatchObject({ id: 1, sessionId: 10, displayName: "EBNoob", status: "offline" });
      expect(mockTouchParticipant).not.toHaveBeenCalled();
      expect(mockInsertParticipant).not.toHaveBeenCalled();
      expect(mockUpdateParticipantName).not.toHaveBeenCalled();
      expect(mockDeleteParticipant).not.toHaveBeenCalled();
    });
  });

  describe("leaveSession", () => {
    it("refuse de quitter une session clôturée", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 10, status: "closed" });

      await expect(
        leaveSession({ sessionId: 10, participantId: 1, requesterUserId: null, requesterGuestToken: "guest-token" })
      ).rejects.toMatchObject({ statusCode: 400, code: "SESSION_CLOSED" } satisfies Partial<AppError>);
      expect(mockDeleteParticipant).not.toHaveBeenCalled();
    });

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

    it("refuse de quitter si le jeton invité a plus de 24h (T-PART-02)", async () => {
      const joinedOver24hAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
      mockFindParticipantById.mockResolvedValueOnce({ ...baseParticipantRow, joined_at: joinedOver24hAgo });

      await expect(
        leaveSession({ sessionId: 10, participantId: 1, requesterUserId: null, requesterGuestToken: "guest-token" })
      ).rejects.toMatchObject({ statusCode: 401, code: "GUEST_TOKEN_EXPIRED" } satisfies Partial<AppError>);

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
