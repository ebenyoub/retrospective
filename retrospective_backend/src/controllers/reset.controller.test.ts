import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../services/passwordReset.service", () => ({
  resetPasswordForEmail: vi.fn(),
}));

import { resetPassword } from "./reset.controller";
import { resetPasswordForEmail } from "../services/passwordReset.service";

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

describe("reset.controller", () => {
  beforeEach(() => {
    mockResetPasswordForEmail.mockReset();
  });

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
