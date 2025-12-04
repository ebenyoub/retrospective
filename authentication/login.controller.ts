import { RowDataPacket } from 'mysql2/promise';
import jwt, { SignOptions } from "jsonwebtoken";
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../db';
import { logger } from '../utils/logger';

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  hash_password: string;
  email: string;
}

interface AuthRequest extends Request {
  user?: any;
}

export const login = async (req: AuthRequest, res: Response) => {
  // On récupère les données
  const { username, password } = req.body;

  if (!username || !password) {
    logger.error("❌ Le pseudo et le mot de passe sont requis.")
    return res.status(400).json({
      success: false,
      message: 'Le pseudo et le mot de passe sont requis.'
    });
  }

  try {
    // on cherche si l'utilisateur existe
    const [users] = await db.execute<UserRow[]>(
      'SELECT id, username, hash_password, email FROM users WHERE username = ?',
      [username]
    );

    if (!users.length) {
      logger.error('❌ [signup] Utilisateur non trouvé.');
      return res.status(401).json({ success: false, message: 'Pseudo inconnu.' });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password.trim(), user.hash_password);

    if (!passwordMatch) {
      logger.error("❌ Le mot de passe ne correspond pas au hash de la BDD.");
      return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
    }

    const userId = user.id;
    const jwt_secret = process.env.JWT_SECRET as string;
    const jwt_expires_in = (process.env.JWT_EXPIRES_IN ?? "1h") as SignOptions["expiresIn"];
    const signOptions: jwt.SignOptions = { expiresIn: jwt_expires_in };
    const token = jwt.sign({ userId, username }, jwt_secret, signOptions);

    logger.info(`✅ Connexion réussie, bienvenue ${username}`);

    return res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      data: {
        token: token,
        userId: userId,
        username: username,
        email: user.email
      }
    });

  } catch (error) {
    logger.error('❌ Erreur SQL lors de la connexion/création:', error);
    return res.status(500).json({ success: false, message: 'Erreur interne du serveur. Le pseudo est peut-être déjà pris.' });
  }
}
