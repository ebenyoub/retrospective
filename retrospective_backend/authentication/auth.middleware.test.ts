import { describe, it, expect, vi, beforeAll } from "vitest";
import jwt from "jsonwebtoken";
import type { Response, NextFunction } from "express";
import { auth, type AuthRequest } from "./auth.middleware";

const TEST_SECRET = "test-secret";

// Mock minimal de Response : capture le code HTTP et le corps JSON envoyés.
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

const createMockRequest = (authorizationHeader?: string): AuthRequest =>
  ({
    headers: { authorization: authorizationHeader },
  }) as unknown as AuthRequest;

describe("auth.middleware", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = TEST_SECRET;
  });

  it("renvoie 401 si le header Authorization est absent", () => {
    const req = createMockRequest(undefined);
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    auth(req, res as unknown as Response, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("renvoie 401 si le token est invalide", () => {
    const req = createMockRequest("Bearer token-invalide");
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    auth(req, res as unknown as Response, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("appelle next() si le token est valide", () => {
    const token = jwt.sign({ userId: 1, username: "Elyas" }, TEST_SECRET);
    const req = createMockRequest(`Bearer ${token}`);
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    auth(req, res as unknown as Response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.statusCode).toBe(0);
  });
});
