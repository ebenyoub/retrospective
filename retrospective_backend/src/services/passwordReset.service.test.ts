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

vi.mock("../../authentication/utils/transporter", () => ({
  transporter: {
    sendMail: vi.fn(),
  },
}));

vi.mock("../models/passwordReset.model", () => ({
  deletePasswordTokenByEmail: vi.fn(),
  findActivePasswordResetByEmail: vi.fn(),
  findActivePasswordTokenByEmail: vi.fn(),
  findUserByEmail: vi.fn(),
  insertPasswordToken: vi.fn(),
  updateUserPasswordByEmail: vi.fn(),
}));

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { transporter } from "../../authentication/utils/transporter";
import {
  deletePasswordTokenByEmail,
  findActivePasswordResetByEmail,
  findActivePasswordTokenByEmail,
  findUserByEmail,
  insertPasswordToken,
  updateUserPasswordByEmail,
} from "../models/passwordReset.model";
import {
  requestPasswordReset,
  resetPasswordForEmail,
  verifyPasswordResetCode,
} from "./passwordReset.service";
import { AppError } from "../utils/AppError";

const mockHash = bcrypt.hash as unknown as Mock;
const mockSign = jwt.sign as unknown as Mock;
const mockVerify = jwt.verify as unknown as Mock;
const mockSendMail = transporter.sendMail as unknown as Mock;
const mockDeletePasswordTokenByEmail = deletePasswordTokenByEmail as unknown as Mock;
const mockFindActivePasswordResetByEmail = findActivePasswordResetByEmail as unknown as Mock;
const mockFindActivePasswordTokenByEmail = findActivePasswordTokenByEmail as unknown as Mock;
const mockFindUserByEmail = findUserByEmail as unknown as Mock;
const mockInsertPasswordToken = insertPasswordToken as unknown as Mock;
const mockUpdateUserPasswordByEmail = updateUserPasswordByEmail as unknown as Mock;

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
    mockFindActivePasswordResetByEmail.mockReset();
    mockFindActivePasswordTokenByEmail.mockReset();
    mockFindUserByEmail.mockReset();
    mockInsertPasswordToken.mockReset();
    mockUpdateUserPasswordByEmail.mockReset();
  });

  it("requestPasswordReset lève une AppError 401 sans email", async () => {
    await expect(requestPasswordReset({ email: "" })).rejects.toMatchObject({
      statusCode: 401,
      message: "L'email est requis.",
    } satisfies Partial<AppError>);
  });

  it("requestPasswordReset lève une AppError 401 si l'email est inconnu", async () => {
    mockFindUserByEmail.mockResolvedValueOnce(null);

    await expect(requestPasswordReset({ email: "missing@test.com" })).rejects.toMatchObject({
      statusCode: 401,
      message: "Cet email n'existe pas",
    } satisfies Partial<AppError>);
  });

  it("requestPasswordReset crée le token et envoie l'email", async () => {
    mockFindUserByEmail.mockResolvedValueOnce({ id: 1, username: "Elyas" });
    mockSign.mockReturnValueOnce("token");
    mockDeletePasswordTokenByEmail.mockResolvedValueOnce(undefined);
    mockInsertPasswordToken.mockResolvedValueOnce(undefined);
    mockSendMail.mockResolvedValueOnce({ messageId: "message-id" });

    await requestPasswordReset({ email: "e@test.com" });

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

  it("verifyPasswordResetCode retourne le token si le code est valide", async () => {
    mockFindActivePasswordTokenByEmail.mockResolvedValueOnce({ token: "token" });
    mockVerify.mockReturnValueOnce({ code: 1234, userId: 1 });

    await expect(verifyPasswordResetCode({ email: "e@test.com", code: "1234" })).resolves.toBe("token");
  });

  it("resetPasswordForEmail lève une AppError 400 si un champ manque", async () => {
    await expect(resetPasswordForEmail({ email: "", code: "", newPassword: "" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Tous les champs sont requis.",
    } satisfies Partial<AppError>);
  });

  it("resetPasswordForEmail lève une AppError 400 si le token est expiré", async () => {
    mockFindActivePasswordResetByEmail.mockResolvedValueOnce(null);

    await expect(resetPasswordForEmail({ email: "e@test.com", code: "1234", newPassword: "TEST_PASSWORD_VALUE" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Le délai a expiré ou le code est invalide. Recommencez.",
    } satisfies Partial<AppError>);
  });

  it("resetPasswordForEmail met à jour le mot de passe et supprime le token", async () => {
    mockFindActivePasswordResetByEmail.mockResolvedValueOnce({ token: "token" });
    mockHash.mockResolvedValueOnce("hash");
    mockUpdateUserPasswordByEmail.mockResolvedValueOnce(undefined);
    mockDeletePasswordTokenByEmail.mockResolvedValueOnce(undefined);

    await resetPasswordForEmail({ email: "e@test.com", code: "1234", newPassword: "TEST_PASSWORD_VALUE" });

    expect(mockHash).toHaveBeenCalledWith("TEST_PASSWORD_VALUE", 10);
    expect(mockUpdateUserPasswordByEmail).toHaveBeenCalledWith("e@test.com", "hash");
    expect(mockDeletePasswordTokenByEmail).toHaveBeenCalledWith("e@test.com");
  });
});
