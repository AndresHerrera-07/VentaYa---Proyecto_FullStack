-- ============================================================
-- Proyecto: VendeYa
-- Script 01: Creación del esquema inicial de base de datos
-- Motor: MySQL / MariaDB
-- ============================================================

-- Crear base de datos si no existe con soporte completo UTF-8
CREATE DATABASE IF NOT EXISTS vendeya_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vendeya_db;

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
CREATE TABLE negocios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  telefono VARCHAR(20) NULL,
  direccion VARCHAR(255) NULL,
  logo_url VARCHAR(500) NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_negocios_slug (slug)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. Tabla: usuarios
-- Almacena las cuentas de acceso administrativo (propietarios).
-- ------------------------------------------------------------
CREATE TABLE usuarios (
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
-- Almacena el catálogo de productos ofrecidos por cada negocio.
-- ------------------------------------------------------------
CREATE TABLE productos (
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
-- Almacena las compras recibidas por cada tienda mediante checkout express.
-- ------------------------------------------------------------
CREATE TABLE pedidos (
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
-- Almacena los ítems individuales que componen cada pedido.
-- ------------------------------------------------------------
CREATE TABLE detalles_pedido (
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
