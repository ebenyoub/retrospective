import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("../../models/session.model", () => ({
  closeExpiredSessionsForOwner: vi.fn(),
  closeActiveSessionsForOwner: vi.fn(),
  findSessionByCode: vi.fn(),
  findSessionsForUser: vi.fn(),
  findSessionUserJoin: vi.fn(),
  insertSession: vi.fn(),
  insertSessionUserJoin: vi.fn(),
  findSessionById: vi.fn(),
  updateSessionStep: vi.fn(),
  updateSessionStepDuration: vi.fn(),
  updateSessionStepDeadline: vi.fn(),
  updateSessionFormat: vi.fn(),
  closeSessionById: vi.fn(),
  updateSessionName: vi.fn(),
  deleteSessionById: vi.fn(),
}));

import {
  closeExpiredSessionsForOwner,
  closeActiveSessionsForOwner,
  findSessionByCode,
  findSessionsForUser,
  findSessionUserJoin,
  insertSession,
  insertSessionUserJoin,
  findSessionById,
  updateSessionStep,
  updateSessionStepDuration,
  updateSessionStepDeadline,
  updateSessionFormat,
  closeSessionById,
  updateSessionName,
  deleteSessionById,
} from '../../models/session.model';
import {
  createSessionForUser,
  getSessionsForUser,
  joinSessionForUser,
  getSessionDetails,
  updateSessionStepService,
  updateSessionTimerService,
  updateSessionFormatService,
  closeSessionService,
  updateSessionNameService,
  deleteSessionService,
} from "../session.service";
import { AppError } from "../../utils/AppError";
import { DEFAULT_RETRO_FORMAT_PRESET, getRetroFormatColumnLabels } from "../../constants/retroFormats";

const mockCloseExpiredSessionsForOwner = closeExpiredSessionsForOwner as unknown as Mock;
const mockCloseActiveSessionsForOwner = closeActiveSessionsForOwner as unknown as Mock;
const mockFindSessionByCode = findSessionByCode as unknown as Mock;
const mockFindSessionsForUser = findSessionsForUser as unknown as Mock;
const mockFindSessionUserJoin = findSessionUserJoin as unknown as Mock;
const mockInsertSession = insertSession as unknown as Mock;
const mockInsertSessionUserJoin = insertSessionUserJoin as unknown as Mock;
const mockFindSessionById = findSessionById as unknown as Mock;
const mockUpdateSessionStep = updateSessionStep as unknown as Mock;
const mockUpdateSessionStepDuration = updateSessionStepDuration as unknown as Mock;
const mockUpdateSessionStepDeadline = updateSessionStepDeadline as unknown as Mock;
const mockUpdateSessionFormat = updateSessionFormat as unknown as Mock;
const mockCloseSessionById = closeSessionById as unknown as Mock;
const mockUpdateSessionName = updateSessionName as unknown as Mock;
const mockDeleteSessionById = deleteSessionById as unknown as Mock;

const baseSessionRow = {
  id: 7,
  name: "S1",
  code: "1234",
  status: "open",
  step: "waiting",
  owner_id: 1,
  format_name: "Commencer / Arrêter / Continuer",
  format_columns: ["Commencer", "Arrêter", "Continuer"],
  expires_at: new Date(),
  created_at: new Date(),
};

describe("session.service", () => {
  beforeEach(() => {
    mockCloseExpiredSessionsForOwner.mockReset();
    mockCloseActiveSessionsForOwner.mockReset();
    mockFindSessionByCode.mockReset();
    mockFindSessionsForUser.mockReset();
    mockFindSessionUserJoin.mockReset();
    mockInsertSession.mockReset();
    mockInsertSessionUserJoin.mockReset();
    mockFindSessionById.mockReset();
    mockUpdateSessionStep.mockReset();
    mockUpdateSessionStepDuration.mockReset();
    mockUpdateSessionStepDeadline.mockReset();
    mockUpdateSessionFormat.mockReset();
    mockCloseSessionById.mockReset();
    mockUpdateSessionName.mockReset();
    mockDeleteSessionById.mockReset();
  });

  it("renvoie un tableau vide si le modèle ne renvoie aucune session", async () => {
    mockFindSessionsForUser.mockResolvedValueOnce([]);

    const result = await getSessionsForUser(1);

    expect(result).toEqual([]);
  });

  it("mappe les lignes snake_case du modèle en camelCase", async () => {
    const createdAt = new Date("2026-07-08T09:00:00.000Z");
    const expiresAt = new Date("2026-07-08T10:00:00.000Z");

    mockFindSessionsForUser.mockResolvedValueOnce([
      {
        id: 1,
        code: "1234",
        status: "open",
        expires_at: expiresAt,
        created_at: createdAt,
        role: "facilitator",
      },
      {
        id: 2,
        code: "5678",
        status: "closed",
        expires_at: expiresAt,
        created_at: createdAt,
        role: "participant",
      },
    ]);

    const result = await getSessionsForUser(1);

    expect(result).toEqual([
      { id: 1, code: "1234", status: "open", expiresAt, createdAt, role: "facilitator" },
      { id: 2, code: "5678", status: "closed", expiresAt, createdAt, role: "participant" },
    ]);
  });

  it("propage l'erreur du modèle sans la capturer (remontée au contrôleur)", async () => {
    mockFindSessionsForUser.mockRejectedValueOnce(new Error("boom"));

    await expect(getSessionsForUser(1)).rejects.toThrow("boom");
  });

  it("createSessionForUser lève une AppError 401 sans userId", async () => {
    await expect(createSessionForUser({ userId: undefined, name: "Test" })).rejects.toMatchObject({
      statusCode: 401,
      code: "USER_NOT_IDENTIFIED",
    } satisfies Partial<AppError>);
  });

  it("createSessionForUser lève une AppError 400 sans nom de session", async () => {
    await expect(createSessionForUser({ userId: 1, name: "" })).rejects.toMatchObject({
      statusCode: 400,
      code: "SESSION_NAME_REQUIRED",
    } satisfies Partial<AppError>);

    await expect(createSessionForUser({ userId: 1, name: "   " })).rejects.toMatchObject({
      statusCode: 400,
      code: "SESSION_NAME_REQUIRED",
    } satisfies Partial<AppError>);

    await expect(createSessionForUser({ userId: 1, name: undefined })).rejects.toMatchObject({
      statusCode: 400,
      code: "SESSION_NAME_REQUIRED",
    } satisfies Partial<AppError>);
  });

  it("createSessionForUser ferme la session active et en crée une nouvelle", async () => {
    mockCloseExpiredSessionsForOwner.mockResolvedValueOnce({ changedRows: 0, affectedRows: 0 });
    mockCloseActiveSessionsForOwner.mockResolvedValueOnce({ affectedRows: 1 });
    mockInsertSession.mockResolvedValueOnce(9);

    const result = await createSessionForUser({ userId: 1, name: "Nouvelle Session" });

    expect(mockCloseActiveSessionsForOwner).toHaveBeenCalledWith(1);
    expect(mockInsertSession).toHaveBeenCalledWith(
      "Nouvelle Session",
      expect.any(String),
      1,
      expect.any(String),
      DEFAULT_RETRO_FORMAT_PRESET.name,
      getRetroFormatColumnLabels(DEFAULT_RETRO_FORMAT_PRESET),
      5
    );
    expect(result.statusCode).toBe(201);
    expect(result.message).toBe("Session créée.");
    expect(result.data).toMatchObject({ sessionId: 9, name: "Nouvelle Session" });
  });

  it("createSessionForUser crée une session si aucune n'est active", async () => {
    mockCloseExpiredSessionsForOwner.mockResolvedValueOnce({ changedRows: 0, affectedRows: 0 });
    mockCloseActiveSessionsForOwner.mockResolvedValueOnce({ affectedRows: 0 });
    mockInsertSession.mockResolvedValueOnce(7);

    const result = await createSessionForUser({ userId: 1, name: "Nouvelle Session" });

    expect(result.statusCode).toBe(201);
    expect(result.message).toBe("Session créée.");
    expect(result.data).toMatchObject({ sessionId: 7, name: "Nouvelle Session" });
    expect((result.data as { code: string }).code).toMatch(/^\d{4}$/);
    expect((result.data as { expiresAt: string }).expiresAt).toEqual(expect.any(String));
  });

  it("createSessionForUser enregistre un format MVP fourni", async () => {
    const formatName = "Succès / Difficultés / Idées";
    const formatColumns = ["Succès", "Difficultés", "Idées"];
    mockCloseExpiredSessionsForOwner.mockResolvedValueOnce({ changedRows: 0, affectedRows: 0 });
    mockCloseActiveSessionsForOwner.mockResolvedValueOnce({ affectedRows: 0 });
    mockInsertSession.mockResolvedValueOnce(7);

    await createSessionForUser({ userId: 1, name: "Nouvelle Session", formatName, formatColumns });

    expect(mockInsertSession).toHaveBeenCalledWith(
      "Nouvelle Session",
      expect.any(String),
      1,
      expect.any(String),
      formatName,
      formatColumns,
      5
    );
  });

  it("createSessionForUser refuse un format absent des formats MVP", async () => {
    await expect(createSessionForUser({
      userId: 1,
      name: "Nouvelle Session",
      formatName: "Mad / Sad / Glad",
      formatColumns: ["Mad", "Sad", "Glad"],
    })).rejects.toMatchObject({
      statusCode: 400,
      code: "FORMAT_INVALID",
    } satisfies Partial<AppError>);
    expect(mockCloseExpiredSessionsForOwner).not.toHaveBeenCalled();
    expect(mockCloseActiveSessionsForOwner).not.toHaveBeenCalled();
    expect(mockInsertSession).not.toHaveBeenCalled();
  });

  it("createSessionForUser convertit une erreur d'insertion en AppError 500", async () => {
    mockCloseExpiredSessionsForOwner.mockResolvedValueOnce({ changedRows: 0, affectedRows: 0 });
    mockCloseActiveSessionsForOwner.mockResolvedValueOnce({ affectedRows: 0 });
    mockInsertSession.mockRejectedValueOnce(new Error("boom"));

    await expect(createSessionForUser({ userId: 1, name: "Nouvelle Session" })).rejects.toMatchObject({
      statusCode: 500,
      code: "SESSION_CREATE_FAILED",
    } satisfies Partial<AppError>);
  });

  it("joinSessionForUser lève une AppError 401 sans code", async () => {
    await expect(joinSessionForUser({ userId: 1, code: "" })).rejects.toMatchObject({
      statusCode: 401,
      code: "SESSION_CODE_AND_USER_REQUIRED",
    } satisfies Partial<AppError>);
  });

  it("joinSessionForUser lève une AppError 404 si le code est inconnu", async () => {
    mockFindSessionByCode.mockResolvedValueOnce(null);

    await expect(joinSessionForUser({ userId: 1, code: "9999" })).rejects.toMatchObject({
      statusCode: 404,
      code: "SESSION_CODE_NOT_FOUND",
    } satisfies Partial<AppError>);
  });

  it("joinSessionForUser retourne 200 si l'utilisateur a déjà rejoint", async () => {
    mockFindSessionByCode.mockResolvedValueOnce({ id: 1 });
    mockFindSessionUserJoin.mockResolvedValueOnce({ id: 5, user_id: 1, session_id: 1 });

    await expect(joinSessionForUser({ userId: 1, code: "1234" })).resolves.toEqual({
      statusCode: 200,
      message: "Vous avez déjà rejoint cette session.",
      data: { joinId: 5, sessionId: 1 },
    });
  });

  it("joinSessionForUser crée la jointure", async () => {
    mockFindSessionByCode.mockResolvedValueOnce({ id: 1 });
    mockFindSessionUserJoin.mockResolvedValueOnce(null);
    mockInsertSessionUserJoin.mockResolvedValueOnce({ affectedRows: 1, insertId: 9 });

    await expect(joinSessionForUser({ userId: 1, code: "1234" })).resolves.toEqual({
      statusCode: 201,
      message: "Session jointe avec succès.",
      data: { joinId: 9, sessionId: 1 },
    });
  });

  it("joinSessionForUser lève une AppError 500 si l'insertion n'affecte aucune ligne", async () => {
    mockFindSessionByCode.mockResolvedValueOnce({ id: 1 });
    mockFindSessionUserJoin.mockResolvedValueOnce(null);
    mockInsertSessionUserJoin.mockResolvedValueOnce({ affectedRows: 0, insertId: 0 });

    await expect(joinSessionForUser({ userId: 1, code: "1234" })).rejects.toMatchObject({
      statusCode: 500,
      code: "SESSION_JOIN_CREATE_FAILED",
    } satisfies Partial<AppError>);
  });

  describe("getSessionDetails", () => {
    it("lève une AppError 404 si la session n'existe pas", async () => {
      mockFindSessionById.mockResolvedValueOnce(null);
      await expect(getSessionDetails(999)).rejects.toMatchObject({
        statusCode: 404,
        code: "SESSION_NOT_FOUND",
      });
    });

    it("renvoie les détails de la session si elle existe", async () => {
      mockFindSessionById.mockResolvedValueOnce(baseSessionRow);

      const result = await getSessionDetails(7);
      expect(result).toMatchObject({ id: 7, name: "S1", step: "waiting", formatName: "Commencer / Arrêter / Continuer" });
    });
  });

  describe("updateSessionStepService", () => {
    it("lève une AppError 403 si l'utilisateur n'est pas le facilitateur", async () => {
      const mockSession = { id: 7, owner_id: 2 };
      mockFindSessionById.mockResolvedValueOnce(mockSession);

      await expect(updateSessionStepService(7, 1, "writing")).rejects.toMatchObject({
        statusCode: 403,
        code: "FORBIDDEN",
      });
    });

    it("met à jour l'étape avec succès si l'utilisateur est le facilitateur", async () => {
      const mockSession = { id: 7, owner_id: 1, step_duration_minutes: 5 };
      mockFindSessionById.mockResolvedValueOnce(mockSession);
      mockUpdateSessionStep.mockResolvedValueOnce(true);

      const result = await updateSessionStepService(7, 1, "writing");

      // L'échéance est calculée par le serveur pour les étapes chronométrées.
      expect(result.stepEndsAt).toEqual(expect.any(String));
      expect(mockUpdateSessionStep).toHaveBeenCalledWith(7, "writing", expect.any(String));
    });

    it("ne fixe pas d'échéance pour l'écran des résultats", async () => {
      const mockSession = { id: 7, owner_id: 1, step_duration_minutes: 5 };
      mockFindSessionById.mockResolvedValueOnce(mockSession);
      mockUpdateSessionStep.mockResolvedValueOnce(true);

      const result = await updateSessionStepService(7, 1, "results");

      expect(result.stepEndsAt).toBeNull();
      expect(mockUpdateSessionStep).toHaveBeenCalledWith(7, "results", null);
    });
  });

  describe("updateSessionTimerService", () => {
    it("lève une AppError 403 si l'utilisateur n'est pas le facilitateur", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 7, owner_id: 2, step: "waiting" });

      await expect(updateSessionTimerService(7, 1, 10)).rejects.toMatchObject({
        statusCode: 403,
        code: "FORBIDDEN",
      });
    });

    it("en salle d'attente, remplace la durée par défaut des étapes", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 7, owner_id: 1, step: "waiting", step_duration_minutes: 5 });
      mockUpdateSessionStepDuration.mockResolvedValueOnce(true);

      const result = await updateSessionTimerService(7, 1, 10);

      expect(mockUpdateSessionStepDuration).toHaveBeenCalledWith(7, 10);
      expect(result).toEqual({ stepEndsAt: null, stepDurationMinutes: 10 });
    });

    it("pendant une étape chronométrée, redéfinit l'échéance à maintenant + minutes", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 7, owner_id: 1, step: "writing", step_duration_minutes: 5 });
      mockUpdateSessionStepDeadline.mockResolvedValueOnce(true);

      const before = Date.now();
      const result = await updateSessionTimerService(7, 1, 10);
      const after = Date.now();

      expect(mockUpdateSessionStepDeadline).toHaveBeenCalledWith(7, expect.any(String));
      const endsAt = new Date(result.stepEndsAt as string).getTime();
      expect(endsAt).toBeGreaterThanOrEqual(before + 10 * 60 * 1000);
      expect(endsAt).toBeLessThanOrEqual(after + 10 * 60 * 1000);
    });

    it("refuse la modification sur l'écran des résultats", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 7, owner_id: 1, step: "results", step_duration_minutes: 5 });

      await expect(updateSessionTimerService(7, 1, 10)).rejects.toMatchObject({
        statusCode: 400,
        code: "TIMER_STEP_INVALID",
      });
    });

    it("refuse une durée hors bornes", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 7, owner_id: 1, step: "waiting", step_duration_minutes: 5 });

      await expect(updateSessionTimerService(7, 1, 0)).rejects.toMatchObject({
        statusCode: 400,
        code: "TIMER_DURATION_INVALID",
      });
    });
  });

  describe("updateSessionFormatService", () => {
    it("lève une AppError 404 si la session n'existe pas", async () => {
      mockFindSessionById.mockResolvedValueOnce(null);

      await expect(updateSessionFormatService(7, 1, "Succès / Difficultés / Idées", ["Succès", "Difficultés", "Idées"])).rejects.toMatchObject({
        statusCode: 404,
        code: "SESSION_NOT_FOUND",
      });
    });

    it("lève une AppError 403 si l'utilisateur n'est pas le facilitateur", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 7, owner_id: 2 });

      await expect(updateSessionFormatService(7, 1, "Succès / Difficultés / Idées", ["Succès", "Difficultés", "Idées"])).rejects.toMatchObject({
        statusCode: 403,
        code: "FORBIDDEN",
      });
    });

    it("lève une AppError 400 si le format n'est pas un format MVP", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 7, owner_id: 1 });

      await expect(updateSessionFormatService(7, 1, "Solo", ["Une seule colonne"])).rejects.toMatchObject({
        statusCode: 400,
        code: "FORMAT_INVALID",
      });
    });

    it("met à jour le format avec succès si l'utilisateur est le facilitateur", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 7, owner_id: 1 });
      mockUpdateSessionFormat.mockResolvedValueOnce(true);
      mockFindSessionById.mockResolvedValueOnce({ ...baseSessionRow, format_name: "Succès / Difficultés / Idées", format_columns: ["Succès", "Difficultés", "Idées"] });

      const result = await updateSessionFormatService(7, 1, "Succès / Difficultés / Idées", ["Succès", "Difficultés", "Idées"]);

      expect(mockUpdateSessionFormat).toHaveBeenCalledWith(7, "Succès / Difficultés / Idées", ["Succès", "Difficultés", "Idées"]);
      expect(result.formatName).toBe("Succès / Difficultés / Idées");
      expect(result.formatColumns).toEqual(["Succès", "Difficultés", "Idées"]);
    });
  });

  describe("closeSessionService", () => {
    it("lève une AppError 404 si la session n'existe pas", async () => {
      mockFindSessionById.mockResolvedValueOnce(null);

      await expect(closeSessionService(7, 1)).rejects.toMatchObject({
        statusCode: 404,
        code: "SESSION_NOT_FOUND",
      });
    });

    it("lève une AppError 403 si l'utilisateur n'est pas le facilitateur", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 7, owner_id: 2 });

      await expect(closeSessionService(7, 1)).rejects.toMatchObject({
        statusCode: 403,
        code: "FORBIDDEN",
      });
    });

    it("lève une AppError 500 si la fermeture échoue", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 7, owner_id: 1 });
      mockCloseSessionById.mockResolvedValueOnce(false);

      await expect(closeSessionService(7, 1)).rejects.toMatchObject({
        statusCode: 500,
        code: "SESSION_CLOSE_FAILED",
      });
    });

    it("ferme la session avec succès si l'utilisateur est le facilitateur", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 7, owner_id: 1 });
      mockCloseSessionById.mockResolvedValueOnce(true);

      await expect(closeSessionService(7, 1)).resolves.toBeUndefined();
      expect(mockCloseSessionById).toHaveBeenCalledWith(7, 1);
    });
  });

  describe("updateSessionNameService", () => {
    it("lève une AppError 404 si la session n'existe pas", async () => {
      mockFindSessionById.mockResolvedValueOnce(null);

      await expect(updateSessionNameService(7, 1, "Nouveau Nom")).rejects.toMatchObject({
        statusCode: 404,
        code: "SESSION_NOT_FOUND",
      });
    });

    it("lève une AppError 403 si l'utilisateur n'est pas le facilitateur", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 7, owner_id: 2 });

      await expect(updateSessionNameService(7, 1, "Nouveau Nom")).rejects.toMatchObject({
        statusCode: 403,
        code: "FORBIDDEN",
      });
    });

    it("lève une AppError 400 si le nom est vide", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 7, owner_id: 1 });

      await expect(updateSessionNameService(7, 1, "")).rejects.toMatchObject({
        statusCode: 400,
        code: "SESSION_NAME_REQUIRED",
      });
    });

    it("lève une AppError 500 si la mise à jour SQL échoue", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 7, owner_id: 1 });
      mockUpdateSessionName.mockResolvedValueOnce(false);

      await expect(updateSessionNameService(7, 1, "Nouveau Nom")).rejects.toMatchObject({
        statusCode: 500,
        code: "SESSION_RENAME_FAILED",
      });
    });

    it("renomme la session avec succès", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 7, owner_id: 1, name: "Ancien Nom" });
      mockUpdateSessionName.mockResolvedValueOnce(true);

      await expect(updateSessionNameService(7, 1, "Sprint 4 Rétro")).resolves.toBeUndefined();
      expect(mockUpdateSessionName).toHaveBeenCalledWith(7, 1, "Sprint 4 Rétro");
    });

    it("ne fait rien et résout avec succès si le nom est identique", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 7, owner_id: 1, name: "Identique" });

      await expect(updateSessionNameService(7, 1, "Identique")).resolves.toBeUndefined();
      expect(mockUpdateSessionName).not.toHaveBeenCalled();
    });
  });

  describe("deleteSessionService", () => {
    it("lève une AppError 404 si la session n'existe pas", async () => {
      mockFindSessionById.mockResolvedValueOnce(null);

      await expect(deleteSessionService(7, 1)).rejects.toMatchObject({
        statusCode: 404,
        code: "SESSION_NOT_FOUND",
      });
    });

    it("lève une AppError 403 si l'utilisateur n'est pas le facilitateur", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 7, owner_id: 2 });

      await expect(deleteSessionService(7, 1)).rejects.toMatchObject({
        statusCode: 403,
        code: "FORBIDDEN",
      });
    });

    it("lève une AppError 500 si la suppression SQL échoue", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 7, owner_id: 1 });
      mockDeleteSessionById.mockResolvedValueOnce(false);

      await expect(deleteSessionService(7, 1)).rejects.toMatchObject({
        statusCode: 500,
        code: "SESSION_DELETE_FAILED",
      });
    });

    it("supprime la session avec succès", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 7, owner_id: 1 });
      mockDeleteSessionById.mockResolvedValueOnce(true);

      await expect(deleteSessionService(7, 1)).resolves.toBeUndefined();
      expect(mockDeleteSessionById).toHaveBeenCalledWith(7, 1);
    });
  });
});
