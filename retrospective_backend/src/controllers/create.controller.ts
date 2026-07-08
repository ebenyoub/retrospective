import { Response } from "express";
import { createSessionForUser } from "../services/session.service";
import { AuthRequest } from '../types';

export const createSession = async (req: AuthRequest, res: Response) => {
  const { userId } = req.user;

  const result = await createSessionForUser({ userId });

  return res.status(result.statusCode).json({
    success: true,
    message: result.message,
    data: result.data
  });
};
