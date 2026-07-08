import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../services/passwordReset.service", () => ({
  requestPasswordReset: vi.fn(),
}));

import { forgot } from "./forgot.controller";
import { requestPasswordReset } from "../services/passwordReset.service";

const mockRequestPasswordReset = requestPasswordReset as unknown as Mock;

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

describe("forgot.controller", () => {
  beforeEach(() => {
    mockRequestPasswordReset.mockReset();
  });

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
