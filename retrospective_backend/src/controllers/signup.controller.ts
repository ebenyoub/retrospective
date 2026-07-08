import { Request, Response } from 'express';
import { signupUser } from "../services/auth.service";

export const signup = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    const data = await signupUser({ username, email, password });

    return res.status(200).json({
        success: true,
        message: 'Connexion réussie.',
        data
    });
};
