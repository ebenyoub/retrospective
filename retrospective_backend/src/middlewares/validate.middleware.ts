import { Request, Response, NextFunction } from "express";
import { ZodError, type ZodTypeAny } from "zod";
import { AppError } from "../utils/AppError";
import type { ValidatedRequestParts } from "./types/validate.middleware.types";

export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as ValidatedRequestParts;
      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }
      if (parsed.query !== undefined) {
        Object.defineProperty(req, "query", {
          value: parsed.query,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
      if (parsed.params !== undefined) {
        req.params = parsed.params;
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map(err => ({
          field: err.path.slice(1).join('.'),
          message: err.message
        }));
        return next(new AppError(400, "Données d'entrée invalides.", "VALIDATION_ERROR", details));
      }
      return next(error);
    }
  };
};
