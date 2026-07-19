import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../../services/passwordReset.service", () => ({
  requestPasswordReset: vi.fn(),
  verifyPasswordResetCode: vi.fn(),
  resetPasswordForEmail: vi.fn(),
}));

import { forgot, verifyCode, resetPassword } from "../passwordReset.controller";
import {
  requestPasswordReset,
  verifyPasswordResetCode,
  resetPasswordForEmail,
} from "../../services/passwordReset.service";

const mockRequestPasswordReset = requestPasswordReset as unknown as Mock;
const mockVerifyPasswordResetCode = verifyPasswordResetCode as unknown as Mock;
const mockResetPasswordForEmail = resetPasswordForEmail as unknown as Mock;

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

describe("passwordReset.controller", () => {
  beforeEach(() => {
    mockRequestPasswordReset.mockReset();
    mockVerifyPasswordResetCode.mockReset();
    mockResetPasswordForEmail.mockReset();
  });

  describe("forgot", () => {
    it("appelle le service puis renvoie 200", async () => {
      mockRequestPasswordReset.mockResolvedValueOnce(undefined);
      const req = { body: { email: "e@test.com" } } as Parameters<typeof forgot>[0];
      const res = createMockResponse();

      await forgot(req, res as unknown as Response);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Un code de vérification a été envoyé à votre adresse email.",
      });
      expect(mockRequestPasswordReset).toHaveBeenCalledWith({ email: "e@test.com" });
    });

    it("ne capture pas les erreurs du service", async () => {
      mockRequestPasswordReset.mockRejectedValueOnce(new Error("boom"));
      const req = { body: { email: "" } } as Parameters<typeof forgot>[0];
      const res = createMockResponse();

      await expect(forgot(req, res as unknown as Response)).rejects.toThrow("boom");
    });
  });

  describe("verifyCode", () => {
    it("appelle le service puis renvoie 200 avec le tempToken", async () => {
      mockVerifyPasswordResetCode.mockResolvedValueOnce("token");
      const req = { body: { email: "e@test.com", code: "1234" } } as Parameters<typeof verifyCode>[0];
      const res = createMockResponse();

      await verifyCode(req, res as unknown as Response);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Code validé.",
        tempToken: "token",
      });
      expect(mockVerifyPasswordResetCode).toHaveBeenCalledWith({ email: "e@test.com", code: "1234" });
    });

    it("ne capture pas les erreurs du service", async () => {
      mockVerifyPasswordResetCode.mockRejectedValueOnce(new Error("boom"));
      const req = { body: { email: "", code: "" } } as Parameters<typeof verifyCode>[0];
      const res = createMockResponse();

      await expect(verifyCode(req, res as unknown as Response)).rejects.toThrow("boom");
    });
  });

  describe("resetPassword", () => {
    it("appelle le service puis renvoie 200", async () => {
      mockResetPasswordForEmail.mockResolvedValueOnce(undefined);
      const req = { body: { email: "e@test.com", code: "1234", newPassword: "TEST_PASSWORD_VALUE" } } as Parameters<typeof resetPassword>[0];
      const res = createMockResponse();

      await resetPassword(req, res as unknown as Response);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Votre mot de passe a été modifié avec succès.",
      });
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith({
        email: "e@test.com",
        code: "1234",
        newPassword: "TEST_PASSWORD_VALUE",
      });
    });

    it("ne capture pas les erreurs du service", async () => {
      mockResetPasswordForEmail.mockRejectedValueOnce(new Error("boom"));
      const req = { body: { email: "", code: "", newPassword: "" } } as Parameters<typeof resetPassword>[0];
      const res = createMockResponse();

      await expect(resetPassword(req, res as unknown as Response)).rejects.toThrow("boom");
    });
  });
});
