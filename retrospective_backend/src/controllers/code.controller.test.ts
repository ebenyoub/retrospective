import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../services/passwordReset.service", () => ({
  verifyPasswordResetCode: vi.fn(),
}));

import { verifyCode } from "./code.controller";
import { verifyPasswordResetCode } from "../services/passwordReset.service";

const mockVerifyPasswordResetCode = verifyPasswordResetCode as unknown as Mock;

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

describe("code.controller", () => {
  beforeEach(() => {
    mockVerifyPasswordResetCode.mockReset();
  });

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
