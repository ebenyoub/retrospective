import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { transporter } from "../../authentication/utils/transporter";
import {
  deletePasswordTokenByEmail,
  findActivePasswordResetByEmail,
  findActivePasswordTokenByEmail,
  findUserByEmail,
  insertPasswordToken,
  updateUserPasswordByEmail,
} from "../models/passwordReset.model";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import type { ForgotPasswordInput, ResetPasswordInput, VerifyCodeInput } from "./types/passwordReset.service.types";

export const requestPasswordReset = async ({ email }: ForgotPasswordInput): Promise<void> => {
  if (!email || typeof email !== "string") {
    throw new AppError(401, "L'email est requis.");
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      throw new AppError(401, "Cet email n'existe pas");
    }

    const code = Math.floor(1000 + Math.random() * 9000);
    logger.info("📨 Code de récupération généré:", code);

    const jwtSecret = process.env.JWT_SECRET as string;
    const jwtExpiresIn = "10m" as SignOptions["expiresIn"];
    const signOptions: jwt.SignOptions = { expiresIn: jwtExpiresIn };
    const token = jwt.sign({ userId: user.id, email, code }, jwtSecret, signOptions);
    const expireAt = new Date(Date.now() + 10 * 60 * 1000);

    await deletePasswordTokenByEmail(email);
    await insertPasswordToken(token, email, expireAt);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? '"Range Ta Chambre" <no-reply@rangetachambre.com>',
      to: email,
      subject: "🔐 Réinitialisation",
      text: `Bonjour, voici votre code de réinitialisation : ${code}. Ce code est valable 10 minutes.`,
      html: `
                <h3>Réinitialisation de mot de passe</h3>
                <p>Bonjour ${user.username},</p>
                <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
                <p>Voici votre code de vérification : <h1>${code}</h1></p>
                <p>Ce code est valable <b>10 minutes</b>.</p>
                <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
            `,
    });

    logger.info("Message sent: %s", info.messageId);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logger.error("❌ [forgot] Erreur serveur:", error);
    throw new AppError(500, "Une erreur est survenue lors de l'envoi de l'email.");
  }
};

export const verifyPasswordResetCode = async ({ email, code }: VerifyCodeInput): Promise<string> => {
  if (!email || !code || typeof email !== "string") {
    throw new AppError(400, "L'email et le code sont requis.");
  }

  try {
    const row = await findActivePasswordTokenByEmail(email);

    if (!row) {
      throw new AppError(400, "Code invalide ou expiré.");
    }

    const storedToken = row.token;
    const jwtSecret = process.env.JWT_SECRET as string;

    try {
      const decoded = jwt.verify(storedToken, jwtSecret) as { code: number; userId: number };

      if (parseInt(String(code)) !== decoded.code) {
        throw new AppError(400, "Le code est incorrect.");
      }

      logger.info("✅ Le code est validé.");
      return storedToken;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error("❌ [verifyCode] Token invalide:", error);
      throw new AppError(400, "Session expirée, veuillez recommencer.");
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logger.error("❌ [verifyCode] Erreur SQL:", error);
    throw new AppError(500, "Erreur serveur.");
  }
};

export const resetPasswordForEmail = async ({
  email,
  code,
  newPassword,
}: ResetPasswordInput): Promise<void> => {
  if (!email || !code || !newPassword || typeof email !== "string" || typeof newPassword !== "string") {
    throw new AppError(400, "Tous les champs sont requis.");
  }

  try {
    const row = await findActivePasswordResetByEmail(email);

    if (!row) {
      throw new AppError(400, "Le délai a expiré ou le code est invalide. Recommencez.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await updateUserPasswordByEmail(email, hashedPassword);
    await deletePasswordTokenByEmail(email);

    logger.info(`✅ Mot de passe modifié pour ${email}`);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logger.error("❌ [resetPassword] Erreur SQL:", error);
    throw new AppError(500, "Erreur serveur lors de la mise à jour.");
  }
};
