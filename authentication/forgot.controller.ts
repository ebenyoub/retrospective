import { RowDataPacket } from 'mysql2/promise';
import jwt, { SignOptions } from "jsonwebtoken";
import { Request, Response } from 'express';
import db from '../db';
import { transporter } from './utils/transporter';
import { logger } from '../utils/logger';

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  hash_password: string;
}

interface AuthRequest extends Request {
  user?: any;
}

export const forgot = async (req: AuthRequest, res: Response) => {
  const { email } = req.body;

  if (!email) {
    logger.error("❌ [forgot] Email manquant.");
    return res.status(401).json({
      success: false,
      message: "L'email est requis."
    });
  }

  try {
    const [users] = await db.execute<UserRow[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!users.length) {
      logger.error("❌ [forgot] Email non existant dans la base de donnée.");
      return res.status(401).json({
        success: false,
        message: "Cet email n'existe pas"
      });
    }

    const user = users[0];
    const userId = user.id;
    const username = user.username;

    const code = Math.floor(1000 + Math.random() * 9000);
    logger.info("📨 Code de récupération généré:", code);

    const jwt_secret = process.env.JWT_SECRET as string;
    const jwt_expires_in = "10m" as SignOptions["expiresIn"];
    const signOptions: jwt.SignOptions = { expiresIn: jwt_expires_in };

    const token = jwt.sign({ userId, email, code }, jwt_secret, signOptions);
    const expireAt = new Date(Date.now() + 10 * 60 * 1000);

    // Nettoyage token bdd
    await db.execute<UserRow[]>(
      'delete from password where email = ?',
      [email]
    )

    await db.execute<UserRow[]>(
      'insert into password (id, token, email, expire_at) values (?, ?, ?, ?)',
      [null, token, email, expireAt]
    );

    const info = await transporter.sendMail({
      from: '"Range Ta Chambre" <no-reply@rangetachambre.com>', // Expéditeur personnalisé
      to: email,
      subject: "🔐 Réinitialisation",
      text: `Bonjour, voici votre code de réinitialisation : ${code}. Ce code est valable 10 minutes.`,
      html: `
                <h3>Réinitialisation de mot de passe</h3>
                <p>Bonjour ${username},</p>
                <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
                <p>Voici votre code de vérification : <h1>${code}</h1></p>
                <p>Ce code est valable <b>10 minutes</b>.</p>
                <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
            `,
    });

    logger.info("Message sent: %s", info.messageId);

    return res.status(200).json({
      success: true,
      message: "Un code de vérification a été envoyé à votre adresse email."
    });

  } catch (error) {
    logger.error("❌ [forgot] Erreur serveur:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'envoi de l'email."
    });
  }
}
