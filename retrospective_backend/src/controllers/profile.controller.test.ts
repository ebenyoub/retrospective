import { describe, it, expect } from "vitest";
import type { Response } from "express";
import { profile } from "./profile.controller";
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
  });
});
