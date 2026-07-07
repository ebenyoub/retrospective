import { NextFunction, Request, Response } from "express";
import { logger } from "./logger";
import { AppError } from "./AppError";

// Middleware d'erreur centralisé Express (4 arguments = signature reconnue par Express).
// N'est atteint que par les routes qui transmettent leurs erreurs via next(error)
// (voir asyncHandler.ts) — n'affecte pas les contrôleurs existants avec leur propre try/catch.
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.code ? { code: err.code } : {}),
      ...(err.details !== undefined ? { details: err.details } : {}),
    });
  }

  logger.error(`❌ Erreur non gérée : ${err instanceof Error ? err.stack : err}`);

  return res.status(500).json({
    success: false,
    message: "Une erreur est survenue.",
    ...(process.env.NODE_ENV !== "production" && err instanceof Error
      ? { stack: err.stack }
      : {}),
  });
};
