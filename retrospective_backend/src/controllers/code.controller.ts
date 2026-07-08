import { Request, Response } from 'express';
import { verifyPasswordResetCode } from "../services/passwordReset.service";

export const verifyCode = async (req: Request, res: Response) => {
    const { email, code } = req.body;

    const tempToken = await verifyPasswordResetCode({ email, code });

    return res.status(200).json({
        success: true,
        message: "Code validé.",
        tempToken
    });
};
