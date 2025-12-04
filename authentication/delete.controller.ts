import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { Response } from 'express';
import db from '../db';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types';



export const deleteAccount = async (req: AuthRequest, res: Response) => {
    const { userId, username } = req.user;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: 'Le userId est introuvable dans le token.'
        });
    }

    try {
        const [result] = await db.execute<ResultSetHeader>(
            'delete from users where id = ?',
            [userId]
        );

        logger.info("✅ Suppression de l'utilisateur dans la BDD");

        return res.status(200).json({
            success: true,
            message: `L'utilisateur ${username} a été supprimé`
        });

    } catch (error) {
        logger.error('❌ Erreur SQL lors de la suppression de l\'utilisateur: ', error);
        return res.status(400).json({
            success: false,
            message: "Erreur interne du serveur."
        })
    }
}