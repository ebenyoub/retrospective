import { AuthRequest } from '../types';
import { Response } from "express";
import { joinSessionForUser } from "../services/session.service";

const joinSession = async (request: AuthRequest, response: Response) => {
  const { userId } = request.user;
  const { code } = request.body;

  const result = await joinSessionForUser({ userId, code });

  return response.status(result.statusCode).json({
    success: true,
    message: result.message,
    data: result.data
  });
};

export default joinSession; 
