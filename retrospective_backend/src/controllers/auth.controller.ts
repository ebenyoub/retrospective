import { Request, Response } from "express";
import { AuthRequest } from "../types";
import { requireAuthUser } from "../utils/authUser";
import {
  AUTH_COOKIE_MAX_AGE_MS,
  AUTH_COOKIE_NAME,
  authCookieOptions,
} from "../utils/authCookie";
import {
  deleteAccountForUser,
  getProfile,
  loginUser,
  signupUser,
} from "../services/auth.service";

// Le JWT est posé en cookie HttpOnly : le navigateur le renvoie tout seul,
// le JavaScript du frontend ne peut pas le lire.
const setAuthCookie = (res: Response, token: string) => {
  res.cookie(AUTH_COOKIE_NAME, token, {
    ...authCookieOptions,
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const data = await loginUser({ email, password });
  setAuthCookie(res, data.token);

  return res.status(200).json({
    success: true,
    message: "Connexion réussie.",
    data,
  });
};

export const signup = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  const data = await signupUser({ username, email, password });
  setAuthCookie(res, data.token);

  return res.status(200).json({
    success: true,
    message: "Connexion réussie.",
    data,
  });
};

// Un cookie HttpOnly ne peut pas être supprimé par le frontend :
// cette route demande au navigateur de l'effacer.
export const logout = (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions);

  return res.status(200).json({
    success: true,
    message: "Déconnexion réussie.",
  });
};

export const profile = (req: AuthRequest, res: Response) => {
  const { userId, username } = requireAuthUser(req);

  const data = getProfile({ userId, username });

  return res.json(data);
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  const { userId, username } = requireAuthUser(req);

  const message = await deleteAccountForUser({ userId, username });

  return res.status(200).json({
    success: true,
    message,
  });
};
