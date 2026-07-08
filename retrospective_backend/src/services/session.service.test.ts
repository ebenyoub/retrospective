import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("../models/session.model", () => ({
  closeExpiredSessionsForOwner: vi.fn(),
  findActiveSessionForOwner: vi.fn(),
  findSessionByCode: vi.fn(),
  findSessionsForUser: vi.fn(),
  findSessionUserJoin: vi.fn(),
  insertSession: vi.fn(),
  insertSessionUserJoin: vi.fn(),
}));

import {
  closeExpiredSessionsForOwner,
  findActiveSessionForOwner,
  findSessionByCode,
  findSessionsForUser,
  findSessionUserJoin,
  insertSession,
  insertSessionUserJoin,
} from '../models/session.model';
import { createSessionForUser, getSessionsForUser, joinSessionForUser } from "./session.service";
import { AppError } from "../utils/AppError";

const mockCloseExpiredSessionsForOwner = closeExpiredSessionsForOwner as unknown as Mock;
const mockFindActiveSessionForOwner = findActiveSessionForOwner as unknown as Mock;
const mockFindSessionByCode = findSessionByCode as unknown as Mock;
const mockFindSessionsForUser = findSessionsForUser as unknown as Mock;
const mockFindSessionUserJoin = findSessionUserJoin as unknown as Mock;
const mockInsertSession = insertSession as unknown as Mock;
const mockInsertSessionUserJoin = insertSessionUserJoin as unknown as Mock;

describe("session.service", () => {
  beforeEach(() => {
    mockCloseExpiredSessionsForOwner.mockReset();
    mockFindActiveSessionForOwner.mockReset();
    mockFindSessionByCode.mockReset();
    mockFindSessionsForUser.mockReset();
    mockFindSessionUserJoin.mockReset();
    mockInsertSession.mockReset();
    mockInsertSessionUserJoin.mockReset();
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

  it("createSessionForUser réutilise une session active", async () => {
    const activeSession = { id: 1, code: "1234", owner_id: 1, status: "open" };
    mockCloseExpiredSessionsForOwner.mockResolvedValueOnce({ changedRows: 0, affectedRows: 0 });
    mockFindActiveSessionForOwner.mockResolvedValueOnce(activeSession);

    await expect(createSessionForUser({ userId: 1, name: "Active Session" })).resolves.toEqual({
      statusCode: 200,
      message: "Session active récupérée.",
      data: activeSession,
    });
  });

  it("createSessionForUser crée une session si aucune n'est active", async () => {
    mockCloseExpiredSessionsForOwner.mockResolvedValueOnce({ changedRows: 0, affectedRows: 0 });
    mockFindActiveSessionForOwner.mockResolvedValueOnce(null);
    mockInsertSession.mockResolvedValueOnce(7);

    const result = await createSessionForUser({ userId: 1, name: "Nouvelle Session" });

    expect(result.statusCode).toBe(201);
    expect(result.message).toBe("Session créée.");
    expect(result.data).toMatchObject({ sessionId: 7, name: "Nouvelle Session" });
    expect((result.data as { code: string }).code).toMatch(/^\d{4}$/);
    expect((result.data as { expiresAt: string }).expiresAt).toEqual(expect.any(String));
  });

  it("createSessionForUser convertit une erreur d'insertion en AppError 500", async () => {
    mockCloseExpiredSessionsForOwner.mockResolvedValueOnce({ changedRows: 0, affectedRows: 0 });
    mockFindActiveSessionForOwner.mockResolvedValueOnce(null);
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
});
