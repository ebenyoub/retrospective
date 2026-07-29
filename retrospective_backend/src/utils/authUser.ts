import { AuthRequest, AuthUser } from "../types";
import { AppError } from "./AppError";

// Renvoie l'utilisateur authentifié attaché par le middleware `auth`, en le
// typant proprement (pas de `any`). Lève une 401 si `user` est absent — ce
// qui ne devrait pas arriver sur une route protégée, mais garantit le typage.
export const requireAuthUser = (req: AuthRequest): AuthUser => {
  if (!req.user) {
    throw new AppError(401, "Authentification requise.", "AUTH_REQUIRED");
  }
  return req.user;
};
