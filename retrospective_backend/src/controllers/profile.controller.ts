import { Response } from 'express';
import { AuthRequest } from '../types';
import { getProfile } from "../services/auth.service";

export const profile = (req: AuthRequest, res: Response) => {
  const data = getProfile({
    userId: req.user.userId,
    username: req.user.username,
  });

  return res.json(data);
};
