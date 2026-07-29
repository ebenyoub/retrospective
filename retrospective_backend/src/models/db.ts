import mysql, { Pool } from 'mysql2/promise';
import dotenv from 'dotenv';
// import { logger } from './utils/logger';

dotenv.config();

/*interface MysqlErrorWithCode extends Error {
    code?: string;
    message: string;
}*/

const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/*async function testDatabaseConnection() {
    let connection;
    try {
        connection = await pool.getConnection();
        logger.info('✅ Connexion à la base de données réussie.');
        connection.release(); 
    } catch (error: unknown) {
        const dbError = error as MysqlErrorWithCode;

        logger.error('❌ ERREUR DE CONNEXION À LA BASE DE DONNÉES:');
        
        if (dbError.code === 'ECONNREFUSED') {
            logger.error('-> ECONNREFUSED : Vérifiez que MySQL/MariaDB est en cours d\'exécution (MAMP/XAMPP).');
        } else if (dbError.code === 'ER_ACCESS_DENIED_ERROR') {
            logger.error('-> ER_ACCESS_DENIED_ERROR : Vérifiez DB_USER et DB_PASSWORD dans le fichier .env.');
        } else if (dbError.code === 'ENOTFOUND') {
             logger.error('-> ENOTFOUND : Vérifiez DB_HOST.');
        } else if (dbError.code === 'ER_BAD_DB_ERROR') {
             logger.error('-> ER_BAD_DB_ERROR : La base de données spécifiée (DB_NAME) n\'existe pas.');
        } else {
            logger.error('-> Erreur non gérée:', dbError.message);
        }

        logger.error('-> Objet d\'erreur complet:', error);
        process.exit(1); 
    }
}*/

// testDatabaseConnection();

export default pool;
