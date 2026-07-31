import { Request, Response } from "express";
import {
  requestPasswordReset,
  resetPasswordForEmail,
  verifyPasswordResetCode,
} from "../services/passwordReset.service";

export const forgot = async (req: Request, res: Response) => {
  const { email } = req.body;

  await requestPasswordReset({ email });

  return res.status(200).json({
    success: true,
    message: "Un code de vérification a été envoyé à votre adresse email.",
  });
};

export const verifyCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  const tempToken = await verifyPasswordResetCode({ email, code });

  return res.status(200).json({
    success: true,
    message: "Code validé.",
    data: { tempToken },
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, tempToken, newPassword } = req.body;

  await resetPasswordForEmail({ email, tempToken, newPassword });

  return res.status(200).json({
    success: true,
    message: "Votre mot de passe a été modifié avec succès.",
  });
};
