import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../services/auth.service", () => ({
  loginUser: vi.fn(),
}));

import { login } from "./login.controller";
import { loginUser } from "../services/auth.service";

const mockLoginUser = loginUser as unknown as Mock;

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
  ({ body }) as unknown as Parameters<typeof login>[0];

describe("login.controller", () => {
  beforeEach(() => {
    mockLoginUser.mockReset();
  });

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
