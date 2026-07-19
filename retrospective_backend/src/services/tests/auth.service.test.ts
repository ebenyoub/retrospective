import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
}));

vi.mock("../../models/auth.model", () => ({
  deleteUserById: vi.fn(),
  findUserByEmail: vi.fn(),
  findUsersByUsernameOrEmail: vi.fn(),
  insertUser: vi.fn(),
}));

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  deleteUserById,
  findUserByEmail,
  findUsersByUsernameOrEmail,
  insertUser,
} from "../../models/auth.model";
import {
  deleteAccountForUser,
  getProfile,
  loginUser,
  signupUser,
} from "../auth.service";
import { AppError } from "../../utils/AppError";

const mockCompare = bcrypt.compare as unknown as Mock;
const mockHash = bcrypt.hash as unknown as Mock;
const mockSign = jwt.sign as unknown as Mock;
const mockDeleteUserById = deleteUserById as unknown as Mock;
const mockFindUserByEmail = findUserByEmail as unknown as Mock;
const mockFindUsersByUsernameOrEmail = findUsersByUsernameOrEmail as unknown as Mock;
const mockInsertUser = insertUser as unknown as Mock;

describe("auth.service", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  beforeEach(() => {
    mockCompare.mockReset();
    mockHash.mockReset();
    mockSign.mockReset();
    mockDeleteUserById.mockReset();
    mockFindUserByEmail.mockReset();
    mockFindUsersByUsernameOrEmail.mockReset();
    mockInsertUser.mockReset();
  });

  it("loginUser lève une AppError 400 si un champ est manquant", async () => {
    await expect(loginUser({ email: "", password: "" })).rejects.toMatchObject({
      statusCode: 400,
    } satisfies Partial<AppError>);
  });

  it("loginUser lève une AppError 401 si l'email est inconnu", async () => {
    mockFindUserByEmail.mockResolvedValueOnce(null);

    await expect(loginUser({ email: "inconnu@test.com", password: "TEST_PASSWORD_VALUE" })).rejects.toMatchObject({
      statusCode: 401,
      message: "Email inconnu.",
    } satisfies Partial<AppError>);
  });

  it("loginUser lève une AppError 401 si le mot de passe est incorrect", async () => {
    mockFindUserByEmail.mockResolvedValueOnce({ id: 1, username: "Elyas", hash_password: "hash", email: "e@test.com" });
    mockCompare.mockResolvedValueOnce(false);

    await expect(loginUser({ email: "e@test.com", password: "TEST_PASSWORD_VALUE" })).rejects.toMatchObject({
      statusCode: 401,
      message: "Identifiants invalides.",
    } satisfies Partial<AppError>);
  });

  it("loginUser retourne un token si les identifiants sont corrects", async () => {
    mockFindUserByEmail.mockResolvedValueOnce({ id: 1, username: "Elyas", hash_password: "hash", email: "e@test.com" });
    mockCompare.mockResolvedValueOnce(true);
    mockSign.mockReturnValueOnce("token");

    await expect(loginUser({ email: "e@test.com", password: " TEST_PASSWORD_VALUE " })).resolves.toEqual({
      token: "token",
      userId: 1,
      username: "Elyas",
      email: "e@test.com",
    });
    expect(mockCompare).toHaveBeenCalledWith("TEST_PASSWORD_VALUE", "hash");
  });

  it("signupUser lève une AppError 400 si un champ est manquant", async () => {
    await expect(signupUser({ username: "", email: "", password: "" })).rejects.toMatchObject({
      statusCode: 400,
    } satisfies Partial<AppError>);
  });

  it("signupUser retourne un token si la création réussit", async () => {
    mockFindUsersByUsernameOrEmail.mockResolvedValueOnce([]);
    mockHash.mockResolvedValueOnce("hash-simule");
    mockInsertUser.mockResolvedValueOnce(42);
    mockSign.mockReturnValueOnce("token");

    await expect(signupUser({ username: "Elyas", email: "elyas@test.com", password: "TEST_PASSWORD_VALUE" })).resolves.toEqual({
      token: "token",
      userId: 42,
      username: "Elyas",
    });
    expect(mockHash).toHaveBeenCalledWith("TEST_PASSWORD_VALUE", 10);
    expect(mockInsertUser).toHaveBeenCalledWith("Elyas", "elyas@test.com", "hash-simule");
  });

  it("signupUser convertit une erreur DB en AppError 500", async () => {
    mockFindUsersByUsernameOrEmail.mockResolvedValueOnce([]);
    mockHash.mockResolvedValueOnce("hash-simule");
    mockInsertUser.mockRejectedValueOnce(new Error("ER_DUP_ENTRY"));

    await expect(signupUser({ username: "Elyas", email: "elyas@test.com", password: "TEST_PASSWORD_VALUE" })).rejects.toMatchObject({
      statusCode: 500,
    } satisfies Partial<AppError>);
  });

  it("signupUser lève une AppError 409 si le pseudo ou l'email existe déjà", async () => {
    mockFindUsersByUsernameOrEmail.mockResolvedValueOnce([{ id: 1, username: "Elyas", email: "elyas@test.com" }]);

    await expect(signupUser({ username: "Elyas", email: "elyas@test.com", password: "TEST_PASSWORD_VALUE" })).rejects.toMatchObject({
      statusCode: 409,
      message: "Ce pseudo ou cet email est déjà utilisé.",
    } satisfies Partial<AppError>);
    expect(mockInsertUser).not.toHaveBeenCalled();
  });

  it("deleteAccountForUser lève une AppError 400 sans userId", async () => {
    await expect(deleteAccountForUser({ userId: undefined, username: "Elyas" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Le userId est introuvable dans le token.",
    } satisfies Partial<AppError>);
  });

  it("deleteAccountForUser supprime l'utilisateur", async () => {
    mockDeleteUserById.mockResolvedValueOnce(undefined);

    await expect(deleteAccountForUser({ userId: 1, username: "Elyas" })).resolves.toBe("L'utilisateur Elyas a été supprimé");
    expect(mockDeleteUserById).toHaveBeenCalledWith(1);
  });

  it("getProfile retourne les champs publics du token", () => {
    expect(getProfile({ userId: 1, username: "Elyas" })).toEqual({ userId: 1, username: "Elyas" });
  });
});
