-- ============================================================
-- Proyecto: VendeYa
-- Script: Inicialización Completa para TiDB Cloud (Esquema + Datos)
-- Compatible con: TiDB Cloud Serverless / MySQL 8.0
-- Base de datos objetivo: test
-- ============================================================

USE test;

-- Desactivar temporalmente revisión de llaves foráneas para orden de limpieza
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS detalles_pedido;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS negocios;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- 1. Tabla: negocios
-- Almacena la información de cada negocio o comercio local.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS negocios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  telefono VARCHAR(20) NULL,
  direccion VARCHAR(255) NULL,
  logo_url MEDIUMTEXT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_negocios_slug (slug)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. Tabla: usuarios
-- Almacena credenciales de propietarios y colaboradores.
-- ------------------------------------------------------------
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
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. Tabla: productos
-- Almacena el catálogo de productos ofrecidos por cada comercio.
-- ------------------------------------------------------------
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
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. Tabla: pedidos
-- Almacena las compras recibidas por cada comercio.
-- ------------------------------------------------------------
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
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. Tabla: detalles_pedido
-- Almacena los ítems individuales que componen cada compra.
-- ------------------------------------------------------------
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
) ENGINE=InnoDB;

-- ============================================================
-- DATOS INICIALES DE DEMOSTRACIÓN
-- ============================================================

-- 1. Negocio de demostración
INSERT INTO negocios (id, nombre, slug, telefono, direccion, logo_url)
VALUES (
  1,
  'Café y Antojitos Santa Tecla',
  'antojitos-santa-tecla',
  '+503 7123-4567',
  '4a Calle Poniente #2-3, Santa Tecla, La Libertad',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400'
);

-- 2. Usuarios del sistema
-- Dueño: testeo@antojitos.sv (clave: admin123)
-- Vendedor: vendedor@antojitos.sv (clave: admin123)
INSERT INTO usuarios (id, negocio_id, nombre, correo, password_hash, rol)
VALUES
  (
    1, 1,
    'Carmen Ramos',
    'testeo@antojitos.sv',
    '$2b$10$TElQri9pSPy5h7sS6UjS4O3O0drAepmDpfsklhgbia0DeGtg3Ktr6',
    'dueno'
  ),
  (
    2, 1,
    'Mateo Vendedor',
    'vendedor@antojitos.sv',
    '$2b$10$TElQri9pSPy5h7sS6UjS4O3O0drAepmDpfsklhgbia0DeGtg3Ktr6',
    'vendedor'
  );

-- 3. Catálogo de productos salvadoreños
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
  ),
  (
    8, 1,
    'Pupusas de Queso con Loroco (Orden de 3)',
    'Tres deliciosas pupusas artesanales rellenas de abundante quesillo derretido y flor fresca de loroco. Acompañadas de curtido y salsa de tomate.',
    3.25, 45,
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=500',
    'Comida Típica', 1
  ),
  (
    9, 1,
    'Pupusas de Frijol con Queso (Orden de 3)',
    'Tradicionales pupusas de maíz con frijoles molidos de seda y quesillo salvadoreño hechas a mano en comal.',
    2.75, 50,
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500',
    'Comida Típica', 1
  ),
  (
    10, 1,
    'Yuca Frita con Chicharrón y Pescaítas',
    'Trozos de yuca crujientes por fuera y suaves por dentro, servidos con chicharrón carnudo, pescaítas secas, curtido y salsa.',
    4.50, 30,
    'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500',
    'Comida Típica', 1
  ),
  (
    11, 1,
    'Tamales de Elote con Crema y Queso (Orden de 2)',
    'Tiernos tamales de maíz dulce recién cosechado cocidos en su tuza, acompañados de crema fresca y queso duro blanco.',
    2.50, 35,
    'https://images.unsplash.com/photo-1505253758473-96b3015f27eb?w=500',
    'Comida Típica', 1
  ),
  (
    12, 1,
    'Tamales de Gallina Criolla (Orden de 2)',
    'Masa de maíz criollo sazonada con recaudo salvadoreño, chile verde, papa y tierna carne de gallina, envueltos en hoja de plátano.',
    2.75, 30,
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
    'Comida Típica', 1
  ),
  (
    13, 1,
    'Pastelitos Típicos de Carne y Verdura (Orden de 4)',
    'Empanaditas de maíz crujientes rellenas de picadillo de carne y verduras, acompañadas de curtido picante.',
    2.25, 40,
    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500',
    'Comida Típica', 1
  ),
  (
    14, 1,
    'Chilate con Nuégados de Yuca y Atado de Panela',
    'Bebida caliente de maíz blanco tostado con pimienta gorda, servida con 3 buñuelos de yuca bañados en miel de panela.',
    3.25, 25,
    'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500',
    'Comida Típica', 1
  ),
  (
    15, 1,
    'Plátanos Fritos con Frijoles y Crema',
    'Rebanadas doradas de plátano maduro acompañadas de frijoles refritos caseros y crema salvadoreña de hacienda.',
    3.00, 35,
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500',
    'Comida Típica', 1
  ),
  (
    16, 1,
    'Quesadilla Tradicional Salvadoreña (Porción)',
    'Pastel tradicional de queso duro, crema, harina de arroz y ajonjolí tostado recién salido del horno.',
    2.75, 30,
    'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500',
    'Panadería', 1
  ),
  (
    17, 1,
    'Horchata de Morro Salvadoreña (Vaso 16oz)',
    'Bebida emblemática hecha con semilla de morro tostada, canela, cacao, ajonjolí y leche fría.',
    1.75, 60,
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500',
    'Bebidas', 1
  ),
  (
    18, 1,
    'Refresco de Ensalada Tradicional (Vaso 16oz)',
    'Refresco dulce de jugo de piña con piña picada, manzana, marañón y hojas tiernas de berro.',
    1.75, 45,
    'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=500',
    'Bebidas', 1
  ),
  (
    19, 1,
    'Atol de Elote Caliente (Taza)',
    'Atol caliente de maíz tierno molido en piedra con leche, azúcar y toque de canela espolvoreada.',
    1.50, 40,
    'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500',
    'Bebidas', 1
  );

-- 4. Pedido inicial de prueba
INSERT INTO pedidos (id, negocio_id, cliente_nombre, cliente_telefono, total, estado, fecha_creacion)
VALUES (
  1, 1,
  'Carlos Mendoza',
  '+503 7988-1122',
  9.50,
  'pendiente',
  NOW()
);

-- 5. Detalles del pedido inicial
INSERT INTO detalles_pedido (id, negocio_id, pedido_id, producto_id, cantidad, precio_unitario)
VALUES
  (1, 1, 1, 1, 1, 3.00),
  (2, 1, 1, 2, 1, 6.50);
