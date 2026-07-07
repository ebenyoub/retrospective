import { RowDataPacket } from "mysql2";
import { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import db from "../db";
import { logger } from "../utils/logger";

export const verifyCode = async (req: Request, res: Response) => {
    const { email, code } = req.body;

    if (!email || !code) {
        logger.error("❌ L'email et le code sont requis.")
        return res.status(400).json({
            success: false,
            message: "L'email et le code sont requis."
        });
    }

    try {
        const [rows] = await db.execute<RowDataPacket[]>(
            'SELECT token FROM password WHERE email = ? AND expire_at > NOW()',
            [email]
        );

        if (!rows.length) {
            logger.error("❌ Le code est invalide ou exprié.")
            return res.status(400).json({
                success: false,
                message: "Code invalide ou expiré."
            });
        }

        const storedToken = rows[0].token;
        const jwt_secret = process.env.JWT_SECRET as string;

        // Vérifier et décoder le token
        try {
            const decoded = jwt.verify(storedToken, jwt_secret) as { code: number, userId: number };

            // Comparer le code reçu (string) avec le code du token (number)
            if (parseInt(code) !== decoded.code) {
                logger.error("❌ Le code est incorrect.")
                return res.status(400).json({
                    success: false,
                    message: "Le code est incorrect."
                });
            }

            // Si tout est bon :
            logger.info("✅ Le code est validé.")
            return res.status(200).json({
                success: true,
                message: "Code validé.",
                // On peut renvoyer un token temporaire ici ou juste un succès
                // pour permettre au front d'afficher le formulaire de changement de mot de passe.
                tempToken: storedToken // On peut renvoyer le token pour l'étape suivante
            });

        } catch (err) {
            logger.error("❌ [verifyCode] Token invalide:", err);
            return res.status(400).json({
                success: false,
                message: "Session expirée, veuillez recommencer."
            });
        }

    } catch (error) {
        logger.error("❌ [verifyCode] Erreur SQL:", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur."
        });
    }
}