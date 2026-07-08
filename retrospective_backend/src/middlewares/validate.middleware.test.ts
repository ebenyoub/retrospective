import { describe, it, expect, vi } from "vitest";
import { validate } from "./validate.middleware";
import { z } from "zod";
import { Request, Response } from "express";
import { AppError } from "../utils/AppError";

describe("validate middleware", () => {
  const schema = z.object({
    body: z.object({
      username: z.string().min(3),
    }),
  });

  it("appelle next() si la validation réussit", async () => {
    const middleware = validate(schema);
    const req = { body: { username: "Elyas" } } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("ne réassigne pas req.query si le schéma ne valide pas query", async () => {
    const middleware = validate(schema);
    const req = { body: { username: "Elyas" } } as unknown as Request;
    Object.defineProperty(req, "query", {
      get: () => ({}),
      enumerable: true,
      configurable: true,
    });
    const res = {} as Response;
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("appelle next() avec une AppError si la validation échoue", async () => {
    const middleware = validate(schema);
    const req = { body: { username: "El" } } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
  });
});
