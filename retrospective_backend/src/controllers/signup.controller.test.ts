import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../services/auth.service", () => ({
  signupUser: vi.fn(),
}));

import { signup } from "./signup.controller";
import { signupUser } from "../services/auth.service";

const mockSignupUser = signupUser as unknown as Mock;

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
  ({ body }) as unknown as Parameters<typeof signup>[0];

describe("signup.controller", () => {
  beforeEach(() => {
    mockSignupUser.mockReset();
  });

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
