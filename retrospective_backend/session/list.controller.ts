import { Response } from "express";
import { AuthRequest } from "../types";
import { getSessionsForUser } from "./session.service";

export const listSessions = async (req: AuthRequest, res: Response) => {
  const { userId } = req.user;
  const data = await getSessionsForUser(userId);

  return res.status(200).json({
    success: true,
    data,
  });
};
