import { Router } from 'express';
import { pool } from '../db.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import {
  crearProductoSchema,
  actualizarProductoSchema
} from '../schemas/producto.schema.js';

const router = Router();

// Negocio ID de demostración (Café y Antojitos Santa Tecla)
// Al integrar el JWT, se extraerá de req.usuario.negocioId cumpliendo RN-01
const OBTENER_NEGOCIO_ID = (req) => req.usuario?.negocioId || 1;

// HU-04: Listar todos los productos del negocio para el panel administrativo
router.get('/', async (req, res, next) => {
  try {
    const negocioId = OBTENER_NEGOCIO_ID(req);

    const [productos] = await pool.query(
      `SELECT 
        id,
        negocio_id AS negocioId,
        nombre,
        descripcion,
        CAST(precio AS DOUBLE) AS precio,
        stock,
        imagen_url AS imagenUrl,
        categoria,
        activo,
        creado_en AS creadoEn
      FROM productos
      WHERE negocio_id = ?
      ORDER BY activo DESC, id DESC`,
      [negocioId]
    );

    res.status(200).json({
      ok: true,
      total: productos.length,
      datos: productos
    });
  } catch (error) {
    next(error);
  }
});

// HU-04: Consultar un producto específico por ID
router.get('/:id', async (req, res, next) => {
  try {
    const negocioId = OBTENER_NEGOCIO_ID(req);
    const { id } = req.params;

    const [productos] = await pool.query(
      `SELECT 
        id,
        negocio_id AS negocioId,
        nombre,
        descripcion,
        CAST(precio AS DOUBLE) AS precio,
        stock,
        imagen_url AS imagenUrl,
        categoria,
        activo,
        creado_en AS creadoEn
      FROM productos
      WHERE id = ? AND negocio_id = ?
      LIMIT 1`,
      [id, negocioId]
    );

    if (productos.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Producto no encontrado o no pertenece a tu negocio'
      });
    }

    res.status(200).json({
      ok: true,
      datos: productos[0]
    });
  } catch (error) {
    next(error);
  }
});

// HU-04: Registrar un nuevo producto (RN-04 y RN-05)
router.post('/', validarSchema(crearProductoSchema), async (req, res, next) => {
  try {
    const negocioId = OBTENER_NEGOCIO_ID(req);
    const { nombre, descripcion, precio, stock, imagenUrl, categoria } = req.body;

    const [resultado] = await pool.query(
      `INSERT INTO productos 
        (negocio_id, nombre, descripcion, precio, stock, imagen_url, categoria, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        negocioId,
        nombre,
        descripcion || null,
        precio,
        stock !== undefined && stock !== null ? stock : 0,
        imagenUrl || null,
        categoria || null
      ]
    );

    // Obtener el registro recién insertado
    const [nuevo] = await pool.query(
      `SELECT 
        id,
        negocio_id AS negocioId,
        nombre,
        descripcion,
        CAST(precio AS DOUBLE) AS precio,
        stock,
        imagen_url AS imagenUrl,
        categoria,
        activo,
        creado_en AS creadoEn
      FROM productos
      WHERE id = ?`,
      [resultado.insertId]
    );

    res.status(201).json({
      ok: true,
      mensaje: 'Producto registrado exitosamente',
      datos: nuevo[0]
    });
  } catch (error) {
    next(error);
  }
});

// HU-04: Modificar un producto existente (RN-01, RN-04 y RN-05)
router.put('/:id', validarSchema(actualizarProductoSchema), async (req, res, next) => {
  try {
    const negocioId = OBTENER_NEGOCIO_ID(req);
    const { id } = req.params;

    // 1. Verificar existencia y pertenencia al negocio (RN-01)
    const [existente] = await pool.query(
      'SELECT id FROM productos WHERE id = ? AND negocio_id = ? LIMIT 1',
      [id, negocioId]
    );

    if (existente.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'El producto no existe o no tienes permisos para modificarlo'
      });
    }

    const { nombre, descripcion, precio, stock, imagenUrl, categoria, activo } = req.body;

    // 2. Construir la actualización dinámica
    const campos = [];
    const valores = [];

    if (nombre !== undefined) {
      campos.push('nombre = ?');
      valores.push(nombre);
    }
    if (descripcion !== undefined) {
      campos.push('descripcion = ?');
      valores.push(descripcion);
    }
    if (precio !== undefined) {
      campos.push('precio = ?');
      valores.push(precio);
    }
    if (stock !== undefined) {
      campos.push('stock = ?');
      valores.push(stock);
    }
    if (imagenUrl !== undefined) {
      campos.push('imagen_url = ?');
      valores.push(imagenUrl);
    }
    if (categoria !== undefined) {
      campos.push('categoria = ?');
      valores.push(categoria);
    }
    if (activo !== undefined) {
      campos.push('activo = ?');
      valores.push(activo ? 1 : 0);
    }

    if (campos.length > 0) {
      valores.push(id, negocioId);
      await pool.query(
        `UPDATE productos SET ${campos.join(', ')} WHERE id = ? AND negocio_id = ?`,
        valores
      );
    }

    // 3. Devolver el producto actualizado
    const [actualizado] = await pool.query(
      `SELECT 
        id,
        negocio_id AS negocioId,
        nombre,
        descripcion,
        CAST(precio AS DOUBLE) AS precio,
        stock,
        imagen_url AS imagenUrl,
        categoria,
        activo,
        creado_en AS creadoEn
      FROM productos
      WHERE id = ?`,
      [id]
    );

    res.status(200).json({
      ok: true,
      mensaje: 'Producto actualizado exitosamente',
      datos: actualizado[0]
    });
  } catch (error) {
    next(error);
  }
});

// HU-04: Eliminación lógica del producto (activo = 0) para mantener integridad de ventas
router.delete('/:id', async (req, res, next) => {
  try {
    const negocioId = OBTENER_NEGOCIO_ID(req);
    const { id } = req.params;

    const [existente] = await pool.query(
      'SELECT id, nombre, activo FROM productos WHERE id = ? AND negocio_id = ? LIMIT 1',
      [id, negocioId]
    );

    if (existente.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'El producto no existe o no pertenece a tu negocio'
      });
    }

    // Borrado lógico
    await pool.query(
      'UPDATE productos SET activo = 0 WHERE id = ? AND negocio_id = ?',
      [id, negocioId]
    );

    res.status(200).json({
      ok: true,
      mensaje: `El producto "${existente[0].nombre}" ha sido desactivado exitosamente`
    });
  } catch (error) {
    next(error);
  }
});

export default router;
