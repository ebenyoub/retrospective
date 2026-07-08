import { Request, Response } from 'express';
import { loginUser } from "../services/auth.service";

interface AuthRequest extends Request {
  user?: any;
}

export const login = async (req: AuthRequest, res: Response) => {
  const { username, password } = req.body;

  const data = await loginUser({ username, password });

  return res.status(200).json({
    success: true,
    message: 'Connexion réussie.',
    data
  });
};
