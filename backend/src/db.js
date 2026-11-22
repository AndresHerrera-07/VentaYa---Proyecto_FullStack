import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Pool de conexiones a la base de datos MySQL / MariaDB
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vendeya_db',
  port: Number(process.env.DB_PORT) || 3306,
  socketPath: process.env.DB_SOCKET || undefined,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Función de diagnóstico para comprobar conectividad al arrancar el servidor
export async function probarConexion() {
  try {
    const conexion = await pool.getConnection();
    console.log('✅ Conexión exitosa a la base de datos MySQL (vendeya_db)');
    conexion.release();
    return true;
  } catch (error) {
    console.warn('⚠️ No se pudo conectar a la base de datos MySQL localmente:');
    console.warn(`   Mensaje: ${error.message}`);
    console.warn('   Asegúrate de que el servicio MySQL/MariaDB esté activo y las credenciales en .env sean correctas.');
    return false;
  }
}
