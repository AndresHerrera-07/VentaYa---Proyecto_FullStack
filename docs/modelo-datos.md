# Modelo de datos de VendeYa

Este documento define las tablas, columnas y relaciones de la base de datos MySQL de VendeYa.

El agente debe respetar este modelo. Si necesita modificarlo, debe presentar una propuesta y esperar aprobación.

## Reglas del modelo

- Toda tabla tendrá `id INT AUTO_INCREMENT PRIMARY KEY`.
- Toda tabla tendrá `creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP`.
- Toda tabla que almacene información perteneciente a un negocio debe incluir `negocio_id INT NOT NULL` con llave foránea hacia `negocios(id)`.
- Las columnas y tablas deben utilizar nombres en español y snake_case.
- Los valores monetarios deben utilizar `DECIMAL(10,2)`.
- Las fechas de creación de pedidos deben utilizar `DATETIME`.
- Las cantidades de productos deben ser números enteros mayores o iguales a cero.
- Las contraseñas se almacenan mediante hashes generados con bcryptjs.
- Utilizar claves foráneas para mantener la integridad referencial.
- No utilizar ORM; las consultas se realizarán mediante mysql2/promise.

## Tablas

### 1. negocios

Almacena la información de cada negocio registrado.

| Columna | Tipo | Notas |
|---|---|---|
| id | INT | Llave primaria |
| nombre | VARCHAR(100) | NOT NULL |
| slug | VARCHAR(100) | NOT NULL, UNIQUE |
| telefono | VARCHAR(20) | |
| direccion | VARCHAR(255) | |
| logo_url | VARCHAR(500) | |
| creado_en | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### 2. usuarios

Almacena las cuentas de los propietarios de los negocios.

| Columna | Tipo | Notas |
|---|---|---|
| id | INT | Llave primaria |
| negocio_id | INT | FK → negocios(id), NOT NULL |
| nombre | VARCHAR(100) | NOT NULL |
| correo | VARCHAR(120) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| rol | VARCHAR(20) | NOT NULL, valor inicial 'dueno' |
| creado_en | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### 3. productos

Almacena los productos que ofrece cada negocio.

| Columna | Tipo | Notas |
|---|---|---|
| id | INT | Llave primaria |
| negocio_id | INT | FK → negocios(id), NOT NULL |
| nombre | VARCHAR(150) | NOT NULL |
| descripcion | TEXT | |
| precio | DECIMAL(10,2) | NOT NULL, mayor que 0 |
| stock | INT | NOT NULL, mayor o igual a 0 |
| imagen_url | VARCHAR(500) | |
| categoria | VARCHAR(100) | |
| creado_en | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### 4. pedidos

Almacena los pedidos realizados por los clientes.

| Columna | Tipo | Notas |
|---|---|---|
| id | INT | Llave primaria |
| negocio_id | INT | FK → negocios(id), NOT NULL |
| cliente_nombre | VARCHAR(100) | NOT NULL |
| cliente_telefono | VARCHAR(20) | NOT NULL |
| total | DECIMAL(10,2) | NOT NULL |
| estado | VARCHAR(30) | NOT NULL, valor inicial 'pendiente' |
| fecha_creacion | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| creado_en | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### 5. detalles_pedido

Almacena los productos y cantidades que forman parte de cada pedido.

| Columna | Tipo | Notas |
|---|---|---|
| id | INT | Llave primaria |
| negocio_id | INT | FK → negocios(id), NOT NULL |
| pedido_id | INT | FK → pedidos(id), NOT NULL |
| producto_id | INT | FK → productos(id), NOT NULL |
| cantidad | INT | NOT NULL, mayor que 0 |
| precio_unitario | DECIMAL(10,2) | NOT NULL |
| creado_en | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

El campo `precio_unitario` conserva el precio del producto al momento de realizar la compra, aunque posteriormente el dueño modifique el precio en el catálogo.

El campo `negocio_id` permite reforzar la separación de información entre negocios.

## Relaciones

```text
negocios 1 ───── * usuarios

negocios 1 ───── * productos

negocios 1 ───── * pedidos

negocios 1 ───── * detalles_pedido

pedidos 1 ────── * detalles_pedido

productos 1 ──── * detalles_pedido
```

## Integridad de datos

- Un usuario debe pertenecer a un negocio existente.
- Un producto debe pertenecer a un negocio existente.
- Un pedido debe pertenecer a un negocio existente.
- Cada detalle debe pertenecer al mismo negocio que su pedido y su producto.
- No se deben registrar detalles de pedidos con productos de otro negocio.
- No se deben eliminar registros que tengan relaciones importantes sin verificar primero las restricciones correspondientes.
- Las consultas administrativas deben filtrar los datos mediante el `negocio_id` obtenido del JWT.
- Las operaciones de checkout deben utilizar transacciones SQL.

Se recomienda reforzar las relaciones entre `detalles_pedido`, `pedidos` y `productos` mediante claves foráneas compuestas que incluyan `negocio_id`, además de las claves foráneas individuales.

## Consideraciones sobre inventario y pedidos

- El stock se almacena en la tabla productos.
- El inventario se descuenta al confirmar el checkout.
- El precio utilizado para calcular el pedido se obtiene de la base de datos.
- El total del pedido corresponde a la suma de los subtotales de sus detalles.
- Los pedidos conservan el precio histórico de cada producto mediante `precio_unitario`.
- El registro del pedido, sus detalles y el descuento del stock deben realizarse en una sola transacción.

## Orden de creación de tablas

1. negocios
2. usuarios
3. productos
4. pedidos
5. detalles_pedido

Este orden respeta las dependencias de las llaves foráneas.

## Decisiones pendientes de aprobación

- Definir si los productos asociados a pedidos se eliminan permanentemente o se desactivan.
- Confirmar los estados permitidos para los pedidos.
- Confirmar las condiciones y transiciones permitidas para cancelar pedidos.
- Definir si un propietario podrá administrar más de un negocio con una misma cuenta. El modelo inicial establece un negocio por usuario.
