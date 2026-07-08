import { Response } from 'express';
import { deleteAccountForUser } from "../services/auth.service";
import { AuthRequest } from '../types';

export const deleteAccount = async (req: AuthRequest, res: Response) => {
    const { userId, username } = req.user;

    const message = await deleteAccountForUser({ userId, username });

    return res.status(200).json({
        success: true,
        message
    });
};
