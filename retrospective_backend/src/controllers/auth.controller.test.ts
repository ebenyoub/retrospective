import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../services/auth.service", () => ({
  loginUser: vi.fn(),
  signupUser: vi.fn(),
  getProfile: vi.fn(),
  deleteAccountForUser: vi.fn(),
}));

import { login, signup, profile, deleteAccount } from "./auth.controller";
import { loginUser, signupUser, getProfile, deleteAccountForUser } from "../services/auth.service";
import type { AuthRequest } from "../types";

const mockLoginUser = loginUser as unknown as Mock;
const mockSignupUser = signupUser as unknown as Mock;
const mockGetProfile = getProfile as unknown as Mock;
const mockDeleteAccountForUser = deleteAccountForUser as unknown as Mock;

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
  };
  return res;
};

const createMockRequest = (body: Record<string, unknown>) =>
  ({ body }) as unknown as AuthRequest;

describe("auth.controller", () => {
  beforeEach(() => {
    mockLoginUser.mockReset();
    mockSignupUser.mockReset();
    mockGetProfile.mockReset();
    mockDeleteAccountForUser.mockReset();
  });

  describe("login", () => {
    it("appelle le service puis renvoie 200", async () => {
      mockLoginUser.mockResolvedValueOnce({
        token: "token",
        userId: 1,
        username: "Elyas",
        email: "e@test.com",
      });
      const req = createMockRequest({ email: "e@test.com", password: "TEST_PASSWORD_VALUE" });
      const res = createMockResponse();

      await login(req, res as unknown as Response);

      expect(res.statusCode).toBe(200);
      const body = res.body as { success: boolean; data: { token: string } };
      expect(body.success).toBe(true);
      expect(body.data.token).toBe("token");
      expect(mockLoginUser).toHaveBeenCalledWith({
        email: "e@test.com",
        password: "TEST_PASSWORD_VALUE",
      });
    });

    it("ne capture pas les erreurs du service", async () => {
      mockLoginUser.mockRejectedValueOnce(new Error("boom"));
      const req = createMockRequest({ email: "", password: "" });
      const res = createMockResponse();

      await expect(login(req, res as unknown as Response)).rejects.toThrow("boom");
    });
  });

  describe("signup", () => {
    it("appelle le service puis renvoie 200", async () => {
      mockSignupUser.mockResolvedValueOnce({
        token: "token",
        userId: 42,
        username: "Elyas",
      });
      const req = createMockRequest({ username: "Elyas", email: "elyas@test.com", password: "TEST_PASSWORD_VALUE" });
      const res = createMockResponse();

      await signup(req, res as unknown as Response);

      expect(res.statusCode).toBe(200);
      const body = res.body as { success: boolean; data: { token: string; userId: number } };
      expect(body.success).toBe(true);
      expect(body.data.userId).toBe(42);
      expect(body.data.token).toBe("token");
      expect(mockSignupUser).toHaveBeenCalledWith({
        username: "Elyas",
        email: "elyas@test.com",
        password: "TEST_PASSWORD_VALUE",
      });
    });

    it("ne capture pas les erreurs du service", async () => {
      mockSignupUser.mockRejectedValueOnce(new Error("boom"));
      const req = createMockRequest({ username: "", email: "", password: "" });
      const res = createMockResponse();

      await expect(signup(req, res as unknown as Response)).rejects.toThrow("boom");
    });
  });

  describe("profile", () => {
    it("renvoie userId et username depuis req.user", () => {
      mockGetProfile.mockImplementation(({ userId, username }: { userId: number; username: string }) => ({ userId, username }));
      const req = { user: { userId: 1, username: "Elyas" } } as unknown as AuthRequest;
      const res = createMockResponse();

      profile(req, res as unknown as Response);

      expect(res.body).toEqual({ userId: 1, username: "Elyas" });
      expect(mockGetProfile).toHaveBeenCalledWith({ userId: 1, username: "Elyas" });
    });
  });

  describe("deleteAccount", () => {
    it("appelle le service puis renvoie 200", async () => {
      mockDeleteAccountForUser.mockResolvedValueOnce("L'utilisateur Elyas a été supprimé");
      const req = { user: { userId: 1, username: "Elyas" } } as unknown as AuthRequest;
      const res = createMockResponse();

      await deleteAccount(req, res as unknown as Response);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "L'utilisateur Elyas a été supprimé",
      });
      expect(mockDeleteAccountForUser).toHaveBeenCalledWith({ userId: 1, username: "Elyas" });
    });

    it("ne capture pas les erreurs du service", async () => {
      mockDeleteAccountForUser.mockRejectedValueOnce(new Error("boom"));
      const req = { user: { userId: 1, username: "Elyas" } } as unknown as AuthRequest;
      const res = createMockResponse();

      await expect(deleteAccount(req, res as unknown as Response)).rejects.toThrow("boom");
    });
  });
});
