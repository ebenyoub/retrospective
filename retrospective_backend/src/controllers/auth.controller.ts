import { Request, Response } from "express";
import { AuthRequest } from "../types";
import { requireAuthUser } from "../utils/authUser";
import {
  deleteAccountForUser,
  getProfile,
  loginUser,
  signupUser,
} from "../services/auth.service";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const data = await loginUser({ email, password });

  return res.status(200).json({
    success: true,
    message: "Connexion réussie.",
    data,
  });
};

export const signup = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  const data = await signupUser({ username, email, password });

  return res.status(200).json({
    success: true,
    message: "Connexion réussie.",
    data,
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
