import { afterEach, describe, expect, it, vi } from "vitest";
import { resetPasswordApi, verifyCodeApi } from "../authApi";

describe("authApi password reset", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lit le jeton temporaire renvoyé après la vérification du code", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: { tempToken: "temporary-token" },
    }), { status: 200, headers: { "Content-Type": "application/json" } })));

    const result = await verifyCodeApi("test@example.com", "1234");

    expect(result).toMatchObject({ ok: true, data: { tempToken: "temporary-token" } });
  });

  it("envoie le jeton temporaire au reset, sans code de vérification", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: null,
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await resetPasswordApi("test@example.com", "temporary-token", "password123");

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/auth/reset-password"), expect.objectContaining({
      method: "PATCH",
      body: JSON.stringify({
        email: "test@example.com",
        tempToken: "temporary-token",
        newPassword: "password123",
      }),
    }));
  });
});
