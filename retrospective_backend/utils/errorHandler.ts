import { NextFunction, Request, Response } from "express";
import { logger } from "./logger";

// Middleware d'erreur centralisé Express (4 arguments = signature reconnue par Express).
// N'est atteint que par les routes qui transmettent leurs erreurs via next(error)
// (voir asyncHandler.ts) — n'affecte pas les contrôleurs existants avec leur propre try/catch.
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(`❌ Erreur non gérée : ${err}`);

  return res.status(500).json({
    success: false,
    message: "Une erreur est survenue.",
  });
};
