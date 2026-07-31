import bcrypt from "bcrypt";
import { randomInt } from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import { transporter } from "../../authentication/utils/transporter";
import {
  consumePasswordResetAndUpdateUserPassword,
  deletePasswordTokenByEmail,
  deleteExpiredPasswordTokens,
  findActivePasswordTokenByEmail,
  findUserByEmail,
  insertPasswordToken,
} from "../models/passwordReset.model";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import type { ForgotPasswordInput, ResetPasswordInput, VerifyCodeInput } from "./types/passwordReset.service.types";

export const requestPasswordReset = async ({ email }: ForgotPasswordInput): Promise<void> => {
  if (!email || typeof email !== "string") {
    throw new AppError(401, "L'email est requis.");
  }

  try {
    await deleteExpiredPasswordTokens();
    const user = await findUserByEmail(email);

    if (!user) {
      return;
    }

    const code = randomInt(1000, 10000);

    const jwtSecret = process.env.JWT_SECRET as string;
    const jwtExpiresIn = "10m" as SignOptions["expiresIn"];
    const signOptions: jwt.SignOptions = { expiresIn: jwtExpiresIn };
    const token = jwt.sign({ purpose: "password-reset-code", userId: user.id, email, code }, jwtSecret, signOptions);
    const expireAt = new Date(Date.now() + 10 * 60 * 1000);

    await deletePasswordTokenByEmail(email);
    await insertPasswordToken(token, email, expireAt);

    await transporter.sendMail({
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

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logger.error("❌ [forgot] Erreur serveur:", error);
    throw new AppError(500, "Une erreur est survenue lors de l'envoi de l'email.");
  }
};

export const verifyPasswordResetCode = async ({ email, code }: VerifyCodeInput): Promise<string> => {
  if (!email || typeof email !== "string" || typeof code !== "string" || !/^\d{4}$/.test(code)) {
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
      const decoded = jwt.verify(storedToken, jwtSecret) as {
        code?: number;
        email?: string;
        purpose?: string;
      };

      if (decoded.purpose !== "password-reset-code" || decoded.email !== email || Number(code) !== decoded.code) {
        throw new AppError(400, "Le code est incorrect.");
      }

      const tempToken = jwt.sign(
        { purpose: "password-reset", email, passwordResetId: row.id },
        jwtSecret,
        { expiresIn: "5m" as SignOptions["expiresIn"] }
      );
      return tempToken;
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
  tempToken,
  newPassword,
}: ResetPasswordInput): Promise<void> => {
  if (!email || !tempToken || !newPassword || typeof email !== "string" || typeof tempToken !== "string" || typeof newPassword !== "string") {
    throw new AppError(400, "Tous les champs sont requis.");
  }

  try {
    const jwtSecret = process.env.JWT_SECRET as string;
    let decoded: { purpose?: string; email?: string; passwordResetId?: number };

    try {
      decoded = jwt.verify(tempToken, jwtSecret) as { purpose?: string; email?: string; passwordResetId?: number };
    } catch {
      throw new AppError(400, "Le jeton temporaire est invalide ou expiré.");
    }

    if (
      decoded.purpose !== "password-reset" ||
      decoded.email !== email ||
      typeof decoded.passwordResetId !== "number" ||
      !Number.isInteger(decoded.passwordResetId)
    ) {
      throw new AppError(400, "Le jeton temporaire est invalide ou expiré.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const wasConsumed = await consumePasswordResetAndUpdateUserPassword(
      decoded.passwordResetId,
      email,
      hashedPassword
    );

    if (!wasConsumed) {
      throw new AppError(400, "Le jeton temporaire est invalide ou expiré.");
    }

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logger.error("❌ [resetPassword] Erreur SQL:", error);
    throw new AppError(500, "Erreur serveur lors de la mise à jour.");
  }
};
