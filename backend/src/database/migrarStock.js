import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script de migración idempotente para la columna `stock` en la tabla `productos`.
 * Compatible con MySQL 8.0 y TiDB Cloud.
 */
export async function migrarStock() {
  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vendeya_db',
    port: Number(process.env.DB_PORT) || 3306,
    socketPath: process.env.DB_SOCKET || undefined,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
  });

  try {
    const nombreBd = process.env.DB_NAME || 'vendeya_db';
    console.log(`🔍 Verificando estructura de la tabla "productos" en la base "${nombreBd}"...`);

    // 1. Verificar si la columna `stock` existe consultando INFORMATION_SCHEMA
    const [columnas] = await conexion.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'productos' AND COLUMN_NAME = 'stock'`,
      [nombreBd]
    );

    if (columnas.length === 0) {
      console.log('🔨 Columna "stock" no encontrada. Ejecutando ALTER TABLE productos ADD COLUMN stock INT NOT NULL DEFAULT 0...');
      await conexion.query(
        'ALTER TABLE productos ADD COLUMN stock INT NOT NULL DEFAULT 0'
      );
      console.log('✅ Columna "stock" agregada con éxito a la tabla "productos".');
    } else {
      console.log('ℹ️ La columna "stock" ya existe en la tabla "productos". No se requiere alterar la tabla.');
    }

    // 2. Asignar stock inicial (20 unidades) únicamente a productos que tengan stock en 0 o NULL
    console.log('📦 Asignando stock inicial a productos con existencias en 0...');
    const [resultadoActualizacion] = await conexion.query(
      'UPDATE productos SET stock = 20 WHERE stock IS NULL OR stock = 0'
    );

    if (resultadoActualizacion.affectedRows > 0) {
      console.log(`✅ Se actualizó el stock inicial a 20 unidades en ${resultadoActualizacion.affectedRows} producto(s).`);
    } else {
      console.log('ℹ️ Todos los productos ya cuentan con inventario mayor a 0. No se modificaron existencias.');
    }

    console.log('🎉 Migración de stock completada exitosamente.');
  } catch (error) {
    console.error('❌ Error durante la migración de stock:', error.message);
    throw error;
  } finally {
    await conexion.end();
  }
}

// Ejecución directa cuando se invoca desde CLI
migrarStock()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
