import { describe, it, expect, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { errorHandler } from "./errorHandler";

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
  it("renvoie 500 avec un message générique quel que soit l'objet d'erreur reçu", () => {
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    errorHandler(new Error("boom"), {} as Request, res as unknown as Response, next);

    expect(res.statusCode).toBe(500);
    const body = res.body as { success: boolean; message: string };
    expect(body.success).toBe(false);
    expect(typeof body.message).toBe("string");
  });
});
