import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// HU-05: Consultar la información pública de un negocio por su slug único
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const [negocios] = await pool.query(
      `SELECT 
        id,
        nombre,
        slug,
        telefono,
        direccion,
        logo_url AS logoUrl,
        creado_en AS creadoEn
      FROM negocios
      WHERE slug = ?
      LIMIT 1`,
      [slug]
    );

    if (negocios.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: `No se encontró ningún negocio con el enlace: "${slug}"`
      });
    }

    res.status(200).json({
      ok: true,
      datos: negocios[0]
    });
  } catch (error) {
    next(error);
  }
});

// HU-05 y HU-06: Consultar catálogo público de productos con buscador y filtros
router.get('/:slug/productos', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { busqueda, categoria } = req.query;

    // 1. Verificar primero que el negocio exista
    const [negocios] = await pool.query(
      'SELECT id, nombre FROM negocios WHERE slug = ? LIMIT 1',
      [slug]
    );

    if (negocios.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: `No se encontró ningún negocio con el enlace: "${slug}"`
      });
    }

    const negocioId = negocios[0].id;

    // 2. Construir la consulta SQL dinámica con filtros seguros parametrizados
    let consultaSql = `
      SELECT 
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
      WHERE negocio_id = ? AND activo = 1
    `;
    const parametros = [negocioId];

    // Filtro por término de búsqueda (nombre o descripción)
    if (busqueda && busqueda.trim() !== '') {
      consultaSql += ' AND (nombre LIKE ? OR descripcion LIKE ?)';
      const termino = `%${busqueda.trim()}%`;
      parametros.push(termino, termino);
    }

    // Filtro por categoría exacta
    if (categoria && categoria.trim() !== '' && categoria.toLowerCase() !== 'todas') {
      consultaSql += ' AND categoria = ?';
      parametros.push(categoria.trim());
    }

    consultaSql += ' ORDER BY categoria ASC, nombre ASC';

    const [productos] = await pool.query(consultaSql, parametros);

    res.status(200).json({
      ok: true,
      total: productos.length,
      datos: productos
    });
  } catch (error) {
    next(error);
  }
});

// HU-06: Obtener la lista de categorías con productos disponibles para alimentar los filtros
router.get('/:slug/categorias', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const [negocios] = await pool.query(
      'SELECT id FROM negocios WHERE slug = ? LIMIT 1',
      [slug]
    );

    if (negocios.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Negocio no encontrado'
      });
    }

    const negocioId = negocios[0].id;

    const [filas] = await pool.query(
      `SELECT DISTINCT categoria
       FROM productos
       WHERE negocio_id = ? AND activo = 1 AND categoria IS NOT NULL AND TRIM(categoria) != ''
       ORDER BY categoria ASC`,
      [negocioId]
    );

    const categorias = filas.map((f) => f.categoria);

    res.status(200).json({
      ok: true,
      datos: categorias
    });
  } catch (error) {
    next(error);
  }
});

export default router;
