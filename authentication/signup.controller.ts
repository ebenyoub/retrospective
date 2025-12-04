import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import jwt, { SignOptions } from "jsonwebtoken";
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from "../db";
import { logger } from "../utils/logger";

interface UserRow extends RowDataPacket {
    id: number;
    username: string;
    hash_password: string;
}

export const signup = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    if (!username || !password || !email) {
        logger.error("❌ Username, email et mot de passe requis.")
        return res.status(400).json({
            success: false,
            message: 'Des champs sont requis.'
        });
    }

    try {
        // on cherche si l'utilisateur existe
        const [users] = await db.execute<UserRow[]>(
            'SELECT * FROM users WHERE username = ? || email = ?',
            [username, email]
        );

        let userId: number;

        if (!users) {
            logger.error('❌ [signup] Utilisateur non trouvé.');
            return res.status(401).json({ success: false, message: 'Cet utilisateur n\'existe pas.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute<ResultSetHeader>(
            'INSERT INTO users (username, email, hash_password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        logger.info("✅ Création de l'utilisateur dans la BDD", result);

        userId = result.insertId;

        const jwt_secret = process.env.JWT_SECRET as string;
        const jwt_expires_in = (process.env.JWT_EXPIRES_IN ?? "1h") as SignOptions["expiresIn"];

        const signOptions: jwt.SignOptions = {
            expiresIn: jwt_expires_in
        };

        const token = jwt.sign(
            { userId, username },
            jwt_secret,
            signOptions
        );

        logger.info(`✅ Connexion réussie, bienvenue ${username}`);

        return res.status(200).json({
            success: true,
            message: 'Connexion réussie.',
            data: {
                token: token,
                userId: userId,
                username: username
            }
        });

    } catch (error) {
        logger.error('❌ Erreur SQL lors de la connexion/création:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur. Le pseudo est peut-être déjà pris.' });
    }
}