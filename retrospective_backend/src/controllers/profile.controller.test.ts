import { describe, it, expect, vi } from "vitest";
import type { Response } from "express";

vi.mock("../services/auth.service", () => ({
  getProfile: vi.fn(({ userId, username }) => ({ userId, username })),
}));

import { profile } from "./profile.controller";
import { getProfile } from "../services/auth.service";
import type { AuthRequest } from '../types';

const createMockResponse = () => {
  const res = {
    body: undefined as unknown,
    json(payload: unknown) {
      res.body = payload;
      return res as unknown as Response;
    },
  };
  return res;
};

describe("profile.controller", () => {
  it("renvoie userId et username depuis req.user", () => {
    const req = { user: { userId: 1, username: "Elyas" } } as unknown as AuthRequest;
    const res = createMockResponse();

    profile(req, res as unknown as Response);

    expect(res.body).toEqual({ userId: 1, username: "Elyas" });
    expect(getProfile).toHaveBeenCalledWith({ userId: 1, username: "Elyas" });
  });
});
