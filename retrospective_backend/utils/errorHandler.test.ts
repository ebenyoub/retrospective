import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { errorHandler } from "./errorHandler";
import { AppError } from "./AppError";

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

describe("errorHandler", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("renvoie le statusCode et le message d'une AppError 400", () => {
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    errorHandler(new AppError(400, "Contenu invalide"), {} as Request, res as unknown as Response, next);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ success: false, message: "Contenu invalide" });
  });

  it("renvoie le statusCode, le message, le code et les details d'une AppError 404", () => {
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    errorHandler(
      new AppError(404, "Session introuvable", "SESSION_NOT_FOUND", { sessionId: 42 }),
      {} as Request,
      res as unknown as Response,
      next
    );

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Session introuvable",
      code: "SESSION_NOT_FOUND",
      details: { sessionId: 42 },
    });
  });

  it("renvoie 500 générique pour une erreur inconnue (non AppError)", () => {
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    errorHandler(new Error("boom"), {} as Request, res as unknown as Response, next);

    expect(res.statusCode).toBe(500);
    const body = res.body as { success: boolean; message: string };
    expect(body.success).toBe(false);
    expect(typeof body.message).toBe("string");
  });

  it("n'expose pas la stack en production", () => {
    process.env.NODE_ENV = "production";
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    errorHandler(new Error("boom"), {} as Request, res as unknown as Response, next);

    const body = res.body as { stack?: string };
    expect(body.stack).toBeUndefined();
  });

  it("expose la stack hors production", () => {
    process.env.NODE_ENV = "development";
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    errorHandler(new Error("boom"), {} as Request, res as unknown as Response, next);

    const body = res.body as { stack?: string };
    expect(typeof body.stack).toBe("string");
  });
});
