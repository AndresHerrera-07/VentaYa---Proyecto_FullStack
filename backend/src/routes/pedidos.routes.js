import { Router } from 'express';
import { pool } from '../db.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { checkoutSchema, cambiarEstadoSchema } from '../schemas/pedido.schema.js';

const router = Router();

// Negocio ID predeterminado de prueba
const OBTENER_NEGOCIO_ID = (req) => req.usuario?.negocioId || 1;

// Transiciones de estado permitidas según RN-09
const TRANSICIONES_PERMITIDAS = {
  pendiente: ['confirmado', 'cancelado'],
  confirmado: ['preparando', 'cancelado'],
  preparando: ['listo', 'cancelado'],
  listo: ['entregado'],
  entregado: [], // Estado final
  cancelado: []  // Estado final
};

// Límite máximo de unidades por producto en un solo pedido
const MAX_POR_PRODUCTO = 4;

// ============================================================
// HU-08: Checkout Express con Transacciones SQL (RN-05, RN-06, RN-07, RN-08)
// ============================================================
router.post('/checkout', validarSchema(checkoutSchema), async (req, res, next) => {
  try {
    const { clienteNombre, clienteTelefono, slug, items } = req.body;

    // Agrupar items por productoId para detectar duplicados y validar límite total
    const mapaItems = new Map();
    for (const item of items) {
      const actual = mapaItems.get(item.productoId) || 0;
      mapaItems.set(item.productoId, actual + item.cantidad);
    }

    // Validar que ningún producto (tras agrupar) supere MAX_POR_PRODUCTO
    for (const [productoId, cantidadTotal] of mapaItems.entries()) {
      if (cantidadTotal > MAX_POR_PRODUCTO) {
        return res.status(400).json({
          ok: false,
          mensaje: `La cantidad máxima por producto es ${MAX_POR_PRODUCTO} unidades (producto ID ${productoId}: se solicitaron ${cantidadTotal})`
        });
      }
    }

    // Reconstruir lista sin duplicados
    const itemsAgrupados = Array.from(mapaItems.entries()).map(([productoId, cantidad]) => ({
      productoId,
      cantidad
    }));

    const conexion = await pool.getConnection();

    try {
      // 1. Determinar el negocio_id (por slug o predeterminado)
      let negocioId = 1;
      if (slug) {
        const [negocios] = await conexion.query(
          'SELECT id FROM negocios WHERE slug = ? LIMIT 1',
          [slug]
        );
        if (negocios.length === 0) {
          conexion.release();
          return res.status(404).json({
            ok: false,
            mensaje: `No se encontró el negocio "${slug}"`
          });
        }
        negocioId = negocios[0].id;
      }

      // 2. Iniciar Transacción SQL Atómica (RN-07)
      await conexion.beginTransaction();

      let totalCalculado = 0;
      const detallesParaInsertar = [];

      // 3. Validar productos, pertenencia, precios vigentes y existencias con bloqueo de fila
      for (const item of itemsAgrupados) {
        const [filas] = await conexion.query(
          `SELECT id, negocio_id AS negocioId, nombre, precio, stock, activo
           FROM productos
           WHERE id = ? FOR UPDATE`,
          [item.productoId]
        );

        if (filas.length === 0 || filas[0].activo !== 1) {
          await conexion.rollback();
          conexion.release();
          return res.status(400).json({
            ok: false,
            mensaje: `El producto solicitado con ID ${item.productoId} no está disponible`
          });
        }

        const prod = filas[0];

        // RN-06: Verificar que el producto pertenezca al negocio de la tienda
        if (prod.negocioId !== negocioId) {
          await conexion.rollback();
          conexion.release();
          return res.status(400).json({
            ok: false,
            mensaje: `El producto "${prod.nombre}" no pertenece a este comercio`
          });
        }

        // RN-05: El inventario nunca puede ser negativo
        if (prod.stock < item.cantidad) {
          await conexion.rollback();
          conexion.release();
          return res.status(409).json({
            ok: false,
            mensaje: `Existencias insuficientes para "${prod.nombre}". Disponibles: ${prod.stock}, solicitadas: ${item.cantidad}`
          });
        }

        // RN-11 y RN-08: Subtotal calculado en el servidor usando precio vigente en base de datos
        const precioUnitario = Number(prod.precio);
        const subtotal = precioUnitario * item.cantidad;
        totalCalculado += subtotal;

        detallesParaInsertar.push({
          productoId: prod.id,
          nombre: prod.nombre,
          cantidad: item.cantidad,
          precioUnitario
        });
      }

      // RN-12: Total del pedido redondeado a 2 decimales
      totalCalculado = Number(totalCalculado.toFixed(2));

      // 4. Registrar cabecera del pedido en tabla `pedidos`
      const [resultadoPedido] = await conexion.query(
        `INSERT INTO pedidos
          (negocio_id, cliente_nombre, cliente_telefono, total, estado, fecha_creacion)
         VALUES (?, ?, ?, ?, 'pendiente', NOW())`,
        [negocioId, clienteNombre, clienteTelefono, totalCalculado]
      );

      const pedidoId = resultadoPedido.insertId;

      // 5. Registrar detalles y descontar inventario atómicamente
      for (const det of detallesParaInsertar) {
        // Insertar en `detalles_pedido`
        await conexion.query(
          `INSERT INTO detalles_pedido
            (negocio_id, pedido_id, producto_id, cantidad, precio_unitario)
           VALUES (?, ?, ?, ?, ?)`,
          [negocioId, pedidoId, det.productoId, det.cantidad, det.precioUnitario]
        );

        // Descontar inventario (RN-05)
        await conexion.query(
          `UPDATE productos
           SET stock = stock - ?
           WHERE id = ?`,
          [det.cantidad, det.productoId]
        );
      }

      // 6. Confirmar la transacción SQL (COMMIT)
      await conexion.commit();
      conexion.release();

      res.status(201).json({
        ok: true,
        mensaje: '¡Pedido confirmado exitosamente! Tu orden ya fue enviada al comercio.',
        datos: {
          pedidoId,
          clienteNombre,
          clienteTelefono,
          total: totalCalculado,
          estado: 'pendiente',
          items: detallesParaInsertar
        }
      });
    } catch (error) {
      await conexion.rollback();
      conexion.release();
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

// ============================================================
// HU-09: Listar pedidos para el panel del dueño con filtros de estado
// ============================================================
router.get('/', async (req, res, next) => {
  try {
    const negocioId = OBTENER_NEGOCIO_ID(req);
    const { estado } = req.query;

    let sql = `
      SELECT
        id,
        negocio_id AS negocioId,
        cliente_nombre AS clienteNombre,
        cliente_telefono AS clienteTelefono,
        CAST(total AS DOUBLE) AS total,
        estado,
        fecha_creacion AS fechaCreacion,
        creado_en AS creadoEn
      FROM pedidos
      WHERE negocio_id = ?
    `;
    const params = [negocioId];

    if (estado && estado.trim() !== '' && estado.toLowerCase() !== 'todos') {
      sql += ' AND estado = ?';
      params.push(estado.trim());
    }

    sql += ' ORDER BY id DESC';

    const [pedidos] = await pool.query(sql, params);

    res.status(200).json({
      ok: true,
      total: pedidos.length,
      datos: pedidos
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// HU-10: Métricas agregadas y datos para Recharts en el Dashboard
// ============================================================
router.get('/metricas/dashboard', async (req, res, next) => {
  try {
    const negocioId = OBTENER_NEGOCIO_ID(req);

    // 1. Resumen general: total ventas, pedidos totales, pendientes y productos
    const [totalesVentas] = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN estado != 'cancelado' THEN total ELSE 0 END), 0) AS ingresosTotales,
        COUNT(*) AS totalPedidos,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) AS pedidosPendientes
       FROM pedidos
       WHERE negocio_id = ?`,
      [negocioId]
    );

    const [totalesProductos] = await pool.query(
      `SELECT COUNT(*) AS totalProductos,
              SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) AS productosActivos
       FROM productos
       WHERE negocio_id = ?`,
      [negocioId]
    );

    // 2. Conteo de pedidos agrupados por estado
    const [distribucionEstados] = await pool.query(
      `SELECT estado, COUNT(*) AS cantidad
       FROM pedidos
       WHERE negocio_id = ?
       GROUP BY estado`,
      [negocioId]
    );

    // 3. Ventas de los últimos 7 días para Recharts
    const [ventasDias] = await pool.query(
      `SELECT
        DATE_FORMAT(fecha_creacion, '%d/%m') AS dia,
        COALESCE(SUM(CASE WHEN estado != 'cancelado' THEN total ELSE 0 END), 0) AS total,
        COUNT(*) AS pedidos
       FROM pedidos
       WHERE negocio_id = ? AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE_FORMAT(fecha_creacion, '%d/%m'), DATE(fecha_creacion)
       ORDER BY DATE(fecha_creacion) ASC`,
      [negocioId]
    );

    // 4. Datos del negocio para compartir QR
    const [negocio] = await pool.query(
      'SELECT id, nombre, slug, telefono, logo_url AS logoUrl FROM negocios WHERE id = ? LIMIT 1',
      [negocioId]
    );

    res.status(200).json({
      ok: true,
      datos: {
        ingresosTotales: Number(totalesVentas[0].ingresosTotales || 0),
        totalPedidos: Number(totalesVentas[0].totalPedidos || 0),
        pedidosPendientes: Number(totalesVentas[0].pedidosPendientes || 0),
        totalProductos: Number(totalesProductos[0].totalProductos || 0),
        productosActivos: Number(totalesProductos[0].productosActivos || 0),
        distribucionEstados,
        ventasDias,
        negocio: negocio[0] || null
      }
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// HU-09: Consultar detalle individual de un pedido con sus productos
// ============================================================
router.get('/:id', async (req, res, next) => {
  try {
    const negocioId = OBTENER_NEGOCIO_ID(req);
    const { id } = req.params;

    const [pedidos] = await pool.query(
      `SELECT
        id,
        negocio_id AS negocioId,
        cliente_nombre AS clienteNombre,
        cliente_telefono AS clienteTelefono,
        CAST(total AS DOUBLE) AS total,
        estado,
        fecha_creacion AS fechaCreacion
      FROM pedidos
      WHERE id = ? AND negocio_id = ?
      LIMIT 1`,
      [id, negocioId]
    );

    if (pedidos.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Pedido no encontrado'
      });
    }

    const [detalles] = await pool.query(
      `SELECT
        dp.id,
        dp.producto_id AS productoId,
        p.nombre,
        p.imagen_url AS imagenUrl,
        dp.cantidad,
        CAST(dp.precio_unitario AS DOUBLE) AS precioUnitario,
        CAST(dp.precio_unitario * dp.cantidad AS DOUBLE) AS subtotal
       FROM detalles_pedido dp
       LEFT JOIN productos p ON dp.producto_id = p.id
       WHERE dp.pedido_id = ? AND dp.negocio_id = ?`,
      [id, negocioId]
    );

    res.status(200).json({
      ok: true,
      datos: {
        ...pedidos[0],
        detalles
      }
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// HU-09: Cambiar estado de un pedido (RN-09 y RN-10 restauración de stock)
// ============================================================
router.put('/:id/estado', validarSchema(cambiarEstadoSchema), async (req, res, next) => {
  const conexion = await pool.getConnection();

  try {
    const negocioId = OBTENER_NEGOCIO_ID(req);
    const { id } = req.params;
    const { estado: nuevoEstado } = req.body;

    await conexion.beginTransaction();

    // 1. Obtener pedido actual con bloqueo de fila
    const [pedidos] = await conexion.query(
      'SELECT id, estado FROM pedidos WHERE id = ? AND negocio_id = ? FOR UPDATE',
      [id, negocioId]
    );

    if (pedidos.length === 0) {
      await conexion.rollback();
      conexion.release();
      return res.status(404).json({
        ok: false,
        mensaje: 'Pedido no encontrado'
      });
    }

    const estadoActual = pedidos[0].estado;

    // 2. Verificar transición permitida según RN-09
    const transicionesValidas = TRANSICIONES_PERMITIDAS[estadoActual] || [];
    if (!transicionesValidas.includes(nuevoEstado)) {
      await conexion.rollback();
      conexion.release();
      return res.status(409).json({
        ok: false,
        mensaje: `Transición no permitida: no se puede cambiar de "${estadoActual}" a "${nuevoEstado}"`
      });
    }

    // 3. RN-10: Si se cancela el pedido, restaurar inventario una sola vez
    if (nuevoEstado === 'cancelado' && estadoActual !== 'cancelado') {
      const [detalles] = await conexion.query(
        'SELECT producto_id AS productoId, cantidad FROM detalles_pedido WHERE pedido_id = ? AND negocio_id = ?',
        [id, negocioId]
      );

      for (const det of detalles) {
        await conexion.query(
          'UPDATE productos SET stock = stock + ? WHERE id = ?',
          [det.cantidad, det.productoId]
        );
      }
    }

    // 4. Actualizar el estado del pedido
    await conexion.query(
      'UPDATE pedidos SET estado = ? WHERE id = ? AND negocio_id = ?',
      [nuevoEstado, id, negocioId]
    );

    await conexion.commit();
    conexion.release();

    res.status(200).json({
      ok: true,
      mensaje: `Estado del pedido #${id} actualizado a "${nuevoEstado}"`,
      datos: { id: Number(id), estadoAnterior: estadoActual, nuevoEstado }
    });
  } catch (error) {
    await conexion.rollback();
    conexion.release();
    next(error);
  }
});

export default router;
