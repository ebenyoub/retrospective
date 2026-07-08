import { Request, Response } from 'express';
import { requestPasswordReset } from "../services/passwordReset.service";

interface AuthRequest extends Request {
  user?: any;
}

export const forgot = async (req: AuthRequest, res: Response) => {
  const { email } = req.body;

  await requestPasswordReset({ email });

  return res.status(200).json({
    success: true,
    message: "Un code de vérification a été envoyé à votre adresse email."
  });
};
