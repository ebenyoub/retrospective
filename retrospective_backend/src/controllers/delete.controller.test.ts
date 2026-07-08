import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../services/auth.service", () => ({
  deleteAccountForUser: vi.fn(),
}));

import { deleteAccount } from "./delete.controller";
import { deleteAccountForUser } from "../services/auth.service";
import type { AuthRequest } from "../types";

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

describe("delete.controller", () => {
  beforeEach(() => {
    mockDeleteAccountForUser.mockReset();
  });

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
