import { describe, it, expect, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "./asyncHandler";

describe("asyncHandler", () => {
  it("appelle le handler normalement s'il résout", async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const next = vi.fn() as unknown as NextFunction;
    const wrapped = asyncHandler(handler);

    await wrapped({} as Request, {} as Response, next);

    expect(handler).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("transmet l'erreur à next() si le handler rejette", async () => {
    const error = new Error("boom");
    const handler = vi.fn().mockRejectedValue(error);
    const next = vi.fn() as unknown as NextFunction;
    const wrapped = asyncHandler(handler);

    await wrapped({} as Request, {} as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
