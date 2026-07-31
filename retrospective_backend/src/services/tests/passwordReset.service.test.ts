import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

vi.mock("../../../authentication/utils/transporter", () => ({
  transporter: {
    sendMail: vi.fn(),
  },
}));

vi.mock("../../models/passwordReset.model", () => ({
  consumePasswordResetAndUpdateUserPassword: vi.fn(),
  deletePasswordTokenByEmail: vi.fn(),
  deleteExpiredPasswordTokens: vi.fn(),
  findActivePasswordTokenByEmail: vi.fn(),
  findUserByEmail: vi.fn(),
  insertPasswordToken: vi.fn(),
}));

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { transporter } from "../../../authentication/utils/transporter";
import {
  consumePasswordResetAndUpdateUserPassword,
  deletePasswordTokenByEmail,
  deleteExpiredPasswordTokens,
  findActivePasswordTokenByEmail,
  findUserByEmail,
  insertPasswordToken,
} from "../../models/passwordReset.model";
import {
  requestPasswordReset,
  resetPasswordForEmail,
  verifyPasswordResetCode,
} from "../passwordReset.service";
import { AppError } from "../../utils/AppError";

const mockHash = bcrypt.hash as unknown as Mock;
const mockSign = jwt.sign as unknown as Mock;
const mockVerify = jwt.verify as unknown as Mock;
const mockSendMail = transporter.sendMail as unknown as Mock;
const mockDeletePasswordTokenByEmail = deletePasswordTokenByEmail as unknown as Mock;
const mockConsumePasswordResetAndUpdateUserPassword = consumePasswordResetAndUpdateUserPassword as unknown as Mock;
const mockDeleteExpiredPasswordTokens = deleteExpiredPasswordTokens as unknown as Mock;
const mockFindActivePasswordTokenByEmail = findActivePasswordTokenByEmail as unknown as Mock;
const mockFindUserByEmail = findUserByEmail as unknown as Mock;
const mockInsertPasswordToken = insertPasswordToken as unknown as Mock;

describe("passwordReset.service", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  beforeEach(() => {
    mockHash.mockReset();
    mockSign.mockReset();
    mockVerify.mockReset();
    mockSendMail.mockReset();
    mockDeletePasswordTokenByEmail.mockReset();
    mockConsumePasswordResetAndUpdateUserPassword.mockReset();
    mockDeleteExpiredPasswordTokens.mockReset();
    mockFindActivePasswordTokenByEmail.mockReset();
    mockFindUserByEmail.mockReset();
    mockInsertPasswordToken.mockReset();
  });

  it("requestPasswordReset lève une AppError 401 sans email", async () => {
    await expect(requestPasswordReset({ email: "" })).rejects.toMatchObject({
      statusCode: 401,
      message: "L'email est requis.",
    } satisfies Partial<AppError>);
  });

  it("requestPasswordReset reste neutre si l'email est inconnu", async () => {
    mockFindUserByEmail.mockResolvedValueOnce(null);

    await expect(requestPasswordReset({ email: "missing@test.com" })).resolves.toBeUndefined();
    expect(mockInsertPasswordToken).not.toHaveBeenCalled();
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("requestPasswordReset crée le token et envoie l'email", async () => {
    mockFindUserByEmail.mockResolvedValueOnce({ id: 1, username: "Elyas" });
    mockSign.mockReturnValueOnce("token");
    mockDeletePasswordTokenByEmail.mockResolvedValueOnce(undefined);
    mockInsertPasswordToken.mockResolvedValueOnce(undefined);
    mockSendMail.mockResolvedValueOnce({ messageId: "message-id" });

    await requestPasswordReset({ email: "e@test.com" });

    expect(mockDeleteExpiredPasswordTokens).toHaveBeenCalledOnce();
    expect(mockDeletePasswordTokenByEmail).toHaveBeenCalledWith("e@test.com");
    expect(mockInsertPasswordToken).toHaveBeenCalledWith("token", "e@test.com", expect.any(Date));
    expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "e@test.com" }));
  });

  it("verifyPasswordResetCode lève une AppError 400 sans email ou code", async () => {
    await expect(verifyPasswordResetCode({ email: "", code: "" })).rejects.toMatchObject({
      statusCode: 400,
      message: "L'email et le code sont requis.",
    } satisfies Partial<AppError>);
  });

  it("verifyPasswordResetCode lève une AppError 400 si aucun token actif", async () => {
    mockFindActivePasswordTokenByEmail.mockResolvedValueOnce(null);

    await expect(verifyPasswordResetCode({ email: "e@test.com", code: "1234" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Code invalide ou expiré.",
    } satisfies Partial<AppError>);
  });

  it("verifyPasswordResetCode lève une AppError 400 si le code est incorrect", async () => {
    mockFindActivePasswordTokenByEmail.mockResolvedValueOnce({ token: "token" });
    mockVerify.mockReturnValueOnce({ code: 1234, userId: 1 });

    await expect(verifyPasswordResetCode({ email: "e@test.com", code: "9999" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Le code est incorrect.",
    } satisfies Partial<AppError>);
  });

  it("verifyPasswordResetCode émet un tempToken seulement si le code est valide", async () => {
    mockFindActivePasswordTokenByEmail.mockResolvedValueOnce({ id: 12, token: "token" });
    mockVerify.mockReturnValueOnce({ code: 1234, email: "e@test.com", purpose: "password-reset-code" });
    mockSign.mockReturnValueOnce("temp-token");

    await expect(verifyPasswordResetCode({ email: "e@test.com", code: "1234" })).resolves.toBe("temp-token");
    expect(mockSign).toHaveBeenCalledWith(
      { purpose: "password-reset", email: "e@test.com", passwordResetId: 12 },
      "test-secret",
      expect.objectContaining({ expiresIn: "5m" })
    );
  });

  it("resetPasswordForEmail lève une AppError 400 si un champ manque", async () => {
    await expect(resetPasswordForEmail({ email: "", tempToken: "", newPassword: "" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Tous les champs sont requis.",
    } satisfies Partial<AppError>);
  });

  it("resetPasswordForEmail refuse un tempToken invalide avant toute mise à jour", async () => {
    mockVerify.mockImplementationOnce(() => { throw new Error("expired"); });

    await expect(resetPasswordForEmail({ email: "e@test.com", tempToken: "expired-token", newPassword: "TEST_PASSWORD_VALUE" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Le jeton temporaire est invalide ou expiré.",
    } satisfies Partial<AppError>);
    expect(mockConsumePasswordResetAndUpdateUserPassword).not.toHaveBeenCalled();
  });

  it("resetPasswordForEmail refuse un code arbitraire utilisé comme tempToken", async () => {
    mockVerify.mockImplementationOnce(() => { throw new Error("invalid signature"); });

    await expect(resetPasswordForEmail({ email: "e@test.com", tempToken: "9999", newPassword: "TEST_PASSWORD_VALUE" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Le jeton temporaire est invalide ou expiré.",
    } satisfies Partial<AppError>);
    expect(mockConsumePasswordResetAndUpdateUserPassword).not.toHaveBeenCalled();
  });

  it("resetPasswordForEmail refuse un tempToken non lié à l'email", async () => {
    mockVerify.mockReturnValueOnce({ purpose: "password-reset", email: "other@test.com", passwordResetId: 12 });

    await expect(resetPasswordForEmail({ email: "e@test.com", tempToken: "token", newPassword: "TEST_PASSWORD_VALUE" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Le jeton temporaire est invalide ou expiré.",
    } satisfies Partial<AppError>);
    expect(mockConsumePasswordResetAndUpdateUserPassword).not.toHaveBeenCalled();
  });

  it("resetPasswordForEmail met à jour le mot de passe et consomme la demande vérifiée", async () => {
    mockVerify.mockReturnValueOnce({ purpose: "password-reset", email: "e@test.com", passwordResetId: 12 });
    mockHash.mockResolvedValueOnce("hash");
    mockConsumePasswordResetAndUpdateUserPassword.mockResolvedValueOnce(true);

    await resetPasswordForEmail({ email: "e@test.com", tempToken: "verified-token", newPassword: "TEST_PASSWORD_VALUE" });

    expect(mockHash).toHaveBeenCalledWith("TEST_PASSWORD_VALUE", 10);
    expect(mockConsumePasswordResetAndUpdateUserPassword).toHaveBeenCalledWith(12, "e@test.com", "hash");
  });

  it("resetPasswordForEmail refuse la réutilisation d'un tempToken déjà consommé", async () => {
    mockVerify.mockReturnValueOnce({ purpose: "password-reset", email: "e@test.com", passwordResetId: 12 });
    mockHash.mockResolvedValueOnce("hash");
    mockConsumePasswordResetAndUpdateUserPassword.mockResolvedValueOnce(false);

    await expect(resetPasswordForEmail({ email: "e@test.com", tempToken: "used-token", newPassword: "TEST_PASSWORD_VALUE" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Le jeton temporaire est invalide ou expiré.",
    } satisfies Partial<AppError>);
    expect(mockConsumePasswordResetAndUpdateUserPassword).toHaveBeenCalledWith(12, "e@test.com", "hash");
  });

  it("resetPasswordForEmail n'autorise qu'une consommation concurrente du même tempToken", async () => {
    let resetRequestIsConsumed = false;
    let storedPasswordHash = "old-hash";

    mockVerify.mockReturnValue({ purpose: "password-reset", email: "e@test.com", passwordResetId: 12 });
    mockHash.mockImplementation(async (password: string) => `hash-${password}`);
    mockConsumePasswordResetAndUpdateUserPassword.mockImplementation(async (_id: number, _email: string, hash: string) => {
      if (resetRequestIsConsumed) {
        return false;
      }

      resetRequestIsConsumed = true;
      storedPasswordHash = hash;
      return true;
    });

    const results = await Promise.allSettled([
      resetPasswordForEmail({ email: "e@test.com", tempToken: "verified-token", newPassword: "FIRST_PASSWORD_VALUE" }),
      resetPasswordForEmail({ email: "e@test.com", tempToken: "verified-token", newPassword: "SECOND_PASSWORD_VALUE" }),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
    expect(resetRequestIsConsumed).toBe(true);
    expect(["hash-FIRST_PASSWORD_VALUE", "hash-SECOND_PASSWORD_VALUE"]).toContain(storedPasswordHash);
  });
});
