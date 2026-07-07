import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken"; import { logger } from "../utils/logger";

export interface AuthRequest extends Request {
  user?: any;
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      logger.warn("❌ Token manquant.")
      return res.status(401).json({ message: "Token manquant" });
    }

    const token = header.split(" ")[1];

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.warn("❌ JWT_SECRET manquant.")
      throw new Error("JWT_SECRET manquant");
    }

    const decoded = jwt.verify(token, jwtSecret);
    // logger.info("➡️ Token décodé.")
    req.user = decoded;

    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      logger.error("❌ JWT expiré :", err.expiredAt);
      return res.status(401).json({ success: false, message: "Token expiré", valide: false });
    }

    logger.error("❌ Erreur JWT:", err);
    return res.status(401).json({ success: false, message: "Token invalide", valide: false });
  }
};
