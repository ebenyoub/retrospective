import { Request, Response } from 'express';
import { resetPasswordForEmail } from "../services/passwordReset.service";

export const resetPassword = async (req: Request, res: Response) => {
    const { email, code, newPassword } = req.body;

    await resetPasswordForEmail({ email, code, newPassword });

    return res.status(200).json({
        success: true,
        message: "Votre mot de passe a été modifié avec succès."
    });
};
