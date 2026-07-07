import { Response } from 'express';
import { AuthRequest } from '../src/types';
import { logger } from '../src/utils/logger';

export const profile = (req: AuthRequest, res: Response) => {
  // logger.info("ℹ️ Récupération de l'id de l'utilisateur.");
  return res.json({
    userId: req.user.userId,
    username: req.user.username
  });
}
