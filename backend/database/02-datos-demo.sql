-- ============================================================
-- Proyecto: VendeYa
-- Script 02: Datos iniciales de demostración
-- Motor: MySQL / MariaDB
-- ============================================================

USE vendeya_db;

-- ------------------------------------------------------------
-- 1. Insertar Negocio de demostración
-- ------------------------------------------------------------
INSERT INTO negocios (id, nombre, slug, telefono, direccion, logo_url)
VALUES (
  1,
  'Café y Antojitos Santa Tecla',
  'antojitos-santa-tecla',
  '+503 7123-4567',
  '4a Calle Poniente #2-3, Santa Tecla, La Libertad',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400'
);

-- ------------------------------------------------------------
-- 2. Insertar Usuario Propietario
-- Contraseña sin cifrar para pruebas: admin123
-- ------------------------------------------------------------
INSERT INTO usuarios (id, negocio_id, nombre, correo, password_hash, rol)
VALUES (
  1,
  1,
  'Carmen Ramos',
  'testeo@antojitos.sv',
  '$2b$10$TElQri9pSPy5h7sS6UjS4O3O0drAepmDpfsklhgbia0DeGtg3Ktr6',
  'dueno'
);

-- ------------------------------------------------------------
-- 3. Insertar Productos de demostración
-- Precios en dólares (USD) y existencias iniciales
-- ------------------------------------------------------------
INSERT INTO productos (id, negocio_id, nombre, descripcion, precio, stock, imagen_url, categoria, activo)
VALUES
  (
    1,
    1,
    'Pupusas Tradicionales (Revueltas)',
    'Tres pupusas de maíz hechas en comal con chicharrón, frijol y queso. Acompañadas de curtido y salsa de tomate casera.',
    3.00,
    50,
    'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=500',
    'Comida Típica',
    1
  ),
  (
    2,
    1,
    'Café de Altura Molido (Bolsa 454g)',
    'Café 100% arábica cultivado en la cordillera El Bálsamo, tueste medio balanceado con notas a chocolate y miel.',
    6.50,
    25,
    'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=500',
    'Bebidas',
    1
  ),
  (
    3,
    1,
    'Semita de Piña Artesanal',
    'Tradicional semita alta recién horneada rellena de dulce de piña y atado de panela.',
    2.50,
    30,
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
    'Panadería',
    1
  ),
  (
    4,
    1,
    'Empanadas de Plátano con Lechepoleada (Orden de 3)',
    'Empanadas doradas de plátano maduro rellenas de lechepoleada tradicional espolvoreadas con azúcar.',
    2.25,
    15,
    'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=500',
    'Comida Típica',
    1
  ),
  (
    5,
    1,
    'Chocolate de Tablilla Casero (Paquete de 6)',
    'Tabletas artesanales de cacao salvadoreño con canela y nuez moscada listos para preparar con leche.',
    4.00,
    20,
    'https://images.unsplash.com/photo-1511381939415-e44015466834?w=500',
    'Bebidas',
    1
  );

-- ------------------------------------------------------------
-- 4. Insertar Pedido de prueba
-- Total: $3.00 (Pupusas) + $6.50 (Café) = $9.50
-- ------------------------------------------------------------
INSERT INTO pedidos (id, negocio_id, cliente_nombre, cliente_telefono, total, estado, fecha_creacion)
VALUES (
  1,
  1,
  'Carlos Mendoza',
  '+503 7988-1122',
  9.50,
  'pendiente',
  NOW()
);

-- ------------------------------------------------------------
-- 5. Insertar Detalles del Pedido
-- ------------------------------------------------------------
INSERT INTO detalles_pedido (id, negocio_id, pedido_id, producto_id, cantidad, precio_unitario)
VALUES
  (1, 1, 1, 1, 1, 3.00),
  (2, 1, 1, 2, 1, 6.50);
