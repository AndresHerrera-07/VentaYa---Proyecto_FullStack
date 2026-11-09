import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Función que crea la base de datos y todas las tablas relacionales
 * basándose fielmente en docs/modelo-datos.md y docs/reglas-negocio.md.
 * 
 * Se realiza en puro código JavaScript con mysql2/promise (sin ORM),
 * garantizando que cualquier desarrollador o servidor nuevo pueda inicializar
 * la base de datos automáticamente con un solo comando.
 */
export async function iniciarBaseDatos(opciones = {}) {
  const resetear = opciones.resetear || false;

  // 1. Conexión administrativa inicial sin especificar base de datos
  const conexionAdmin = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: Number(process.env.DB_PORT) || 3306,
    socketPath: process.env.DB_SOCKET || undefined
  });

  const nombreBd = process.env.DB_NAME || 'vendeya_db';

  try {
    console.log(`📦 Verificando base de datos "${nombreBd}"...`);

    // Crear base de datos con codificación UTF-8 salvadoreña/multilingüe
    await conexionAdmin.query(
      `CREATE DATABASE IF NOT EXISTS \`${nombreBd}\`
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );

    // Usar la base de datos
    await conexionAdmin.changeUser({ database: nombreBd });

    // Si se solicitó reinicio completo, limpiar en orden inverso de claves foráneas
    if (resetear) {
      console.log('⚠️ Modo reset: eliminando tablas existentes...');
      await conexionAdmin.query('SET FOREIGN_KEY_CHECKS = 0');
      await conexionAdmin.query('DROP TABLE IF EXISTS detalles_pedido');
      await conexionAdmin.query('DROP TABLE IF EXISTS pedidos');
      await conexionAdmin.query('DROP TABLE IF EXISTS productos');
      await conexionAdmin.query('DROP TABLE IF EXISTS usuarios');
      await conexionAdmin.query('DROP TABLE IF EXISTS negocios');
      await conexionAdmin.query('SET FOREIGN_KEY_CHECKS = 1');
    }

    console.log('🔨 Creando tablas relacionales según docs/modelo-datos.md...');

    // 1. Tabla: negocios (Entidad raíz para multitenancy, RN-03)
    await conexionAdmin.query(`
      CREATE TABLE IF NOT EXISTS negocios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        telefono VARCHAR(20) NULL,
        direccion VARCHAR(255) NULL,
        logo_url VARCHAR(500) NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_negocios_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 2. Tabla: usuarios (Propietarios, RN-01, RN-02)
    await conexionAdmin.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        negocio_id INT NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        correo VARCHAR(120) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        rol VARCHAR(20) NOT NULL DEFAULT 'dueno',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_usuarios_negocios
          FOREIGN KEY (negocio_id) REFERENCES negocios(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        INDEX idx_usuarios_correo (correo),
        INDEX idx_usuarios_negocio (negocio_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 3. Tabla: productos (Catálogo, RN-04 precio > 0, RN-05 stock >= 0 y borrado lógico)
    await conexionAdmin.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        negocio_id INT NOT NULL,
        nombre VARCHAR(150) NOT NULL,
        descripcion TEXT NULL,
        precio DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        imagen_url MEDIUMTEXT NULL,
        categoria VARCHAR(100) NULL,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_productos_negocios
          FOREIGN KEY (negocio_id) REFERENCES negocios(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT chk_producto_precio CHECK (precio > 0),
        CONSTRAINT chk_producto_stock CHECK (stock >= 0),
        INDEX idx_productos_negocio_activo (negocio_id, activo),
        INDEX idx_productos_categoria (categoria)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 4. Tabla: pedidos (Ventas express, RN-06, RN-08 y estados RN-09)
    await conexionAdmin.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        negocio_id INT NOT NULL,
        cliente_nombre VARCHAR(100) NOT NULL,
        cliente_telefono VARCHAR(20) NOT NULL,
        total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
        fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_pedidos_negocios
          FOREIGN KEY (negocio_id) REFERENCES negocios(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        INDEX idx_pedidos_negocio_estado (negocio_id, estado),
        INDEX idx_pedidos_fecha (fecha_creacion)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 5. Tabla: detalles_pedido (Ítems individuales, precio_unitario histórico RN-08)
    await conexionAdmin.query(`
      CREATE TABLE IF NOT EXISTS detalles_pedido (
        id INT AUTO_INCREMENT PRIMARY KEY,
        negocio_id INT NOT NULL,
        pedido_id INT NOT NULL,
        producto_id INT NOT NULL,
        cantidad INT NOT NULL,
        precio_unitario DECIMAL(10,2) NOT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_detalles_negocios
          FOREIGN KEY (negocio_id) REFERENCES negocios(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_detalles_pedidos
          FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_detalles_productos
          FOREIGN KEY (producto_id) REFERENCES productos(id)
          ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT chk_detalle_cantidad CHECK (cantidad > 0),
        INDEX idx_detalles_pedido (pedido_id),
        INDEX idx_detalles_producto (producto_id),
        INDEX idx_detalles_negocio (negocio_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 6. Cargar datos de demostración si la base de datos está vacía
    const [negociosExistentes] = await conexionAdmin.query('SELECT COUNT(*) AS total FROM negocios');

    if (negociosExistentes[0].total === 0) {
      console.log('🌱 Sembrando datos salvadoreños iniciales de demostración...');

      // Insertar comercio demo
      await conexionAdmin.query(`
        INSERT INTO negocios (id, nombre, slug, telefono, direccion, logo_url)
        VALUES (
          1,
          'Café y Antojitos Santa Tecla',
          'antojitos-santa-tecla',
          '+503 7123-4567',
          '4a Calle Poniente #2-3, Santa Tecla, La Libertad',
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400'
        )
      `);

      // Insertar usuario dueño (admin123 hasheado con bcryptjs)
      await conexionAdmin.query(`
        INSERT INTO usuarios (id, negocio_id, nombre, correo, password_hash, rol)
        VALUES (
          1,
          1,
          'Carmen Ramos',
          'carmen@antojitos.sv',
          '$2b$10$TElQri9pSPy5h7sS6UjS4O3O0drAepmDpfsklhgbia0DeGtg3Ktr6',
          'dueno'
        )
      `);

      // Insertar usuario vendedor demo (admin123 hasheado con bcryptjs)
      await conexionAdmin.query(`
        INSERT INTO usuarios (id, negocio_id, nombre, correo, password_hash, rol)
        VALUES (
          2,
          1,
          'Mateo Vendedor',
          'vendedor@antojitos.sv',
          '$2b$10$TElQri9pSPy5h7sS6UjS4O3O0drAepmDpfsklhgbia0DeGtg3Ktr6',
          'vendedor'
        )
      `);

      // Insertar productos típicos salvadoreños
      await conexionAdmin.query(`
        INSERT INTO productos (id, negocio_id, nombre, descripcion, precio, stock, imagen_url, categoria, activo)
        VALUES
          (
            1, 1,
            'Pupusas Tradicionales (Revueltas)',
            'Tres pupusas de maíz hechas en comal con chicharrón, frijol y queso. Acompañadas de curtido y salsa de tomate casera.',
            3.00, 50,
            'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=500',
            'Comida Típica', 1
          ),
          (
            2, 1,
            'Café de Altura Molido (Bolsa 454g)',
            'Café 100% arábica cultivado en la cordillera El Bálsamo, tueste medio balanceado con notas a chocolate y miel.',
            6.50, 25,
            'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=500',
            'Bebidas', 1
          ),
          (
            3, 1,
            'Semita de Piña Artesanal',
            'Tradicional semita alta recién horneada rellena de dulce de piña y atado de panela.',
            2.50, 30,
            'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
            'Panadería', 1
          ),
          (
            4, 1,
            'Empanadas de Plátano con Lechepoleada (Orden de 3)',
            'Empanadas doradas de plátano maduro rellenas de lechepoleada tradicional espolvoreadas con azúcar.',
            2.25, 15,
            'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=500',
            'Comida Típica', 1
          ),
          (
            5, 1,
            'Chocolate de Tablilla Casero (Paquete de 6)',
            'Tabletas artesanales de cacao salvadoreño con canela y nuez moscada listos para preparar con leche.',
            4.00, 20,
            'https://images.unsplash.com/photo-1511381939415-e44015466834?w=500',
            'Bebidas', 1
          )
      `);

      // Insertar pedido inicial
      await conexionAdmin.query(`
        INSERT INTO pedidos (id, negocio_id, cliente_nombre, cliente_telefono, total, estado, fecha_creacion)
        VALUES (1, 1, 'Carlos Mendoza', '+503 7988-1122', 9.50, 'pendiente', NOW())
      `);

      // Insertar detalles del pedido inicial
      await conexionAdmin.query(`
        INSERT INTO detalles_pedido (id, negocio_id, pedido_id, producto_id, cantidad, precio_unitario)
        VALUES
          (1, 1, 1, 1, 1, 3.00),
          (2, 1, 1, 2, 1, 6.50)
      `);

      console.log('✅ Datos iniciales sembrados con éxito.');
    } else {
      console.log('ℹ️ La base de datos ya contiene registros. No se duplicaron datos.');
    }

    console.log('✅ Base de datos lista y sincronizada.');
    return true;
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    throw error;
  } finally {
    await conexionAdmin.end();
  }
}

// Si se ejecuta directamente desde la terminal con "node src/database/iniciarBaseDatos.js"
if (process.argv[1]?.endsWith('iniciarBaseDatos.js')) {
  const resetear = process.argv.includes('--reset');
  iniciarBaseDatos({ resetear })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
