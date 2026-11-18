import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import {
  loginSchema,
  crearVendedorSchema,
  actualizarPerfilSchema,
  actualizarNegocioSchema
} from '../schemas/auth.schema.js';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware.js';

const router = Router();

// ============================================================
// HU-02: Inicio de Sesión de Empleados (Dueño o Vendedor)
// ============================================================
router.post('/login', validarSchema(loginSchema), async (req, res, next) => {
  try {
    const { correo, password } = req.body;

    // 1. Buscar usuario por correo
    const [usuarios] = await pool.query(
      `SELECT u.id, u.negocio_id AS negocioId, u.nombre, u.correo, u.password_hash, u.rol,
              n.nombre AS negocioNombre, n.slug AS negocioSlug
       FROM usuarios u
       INNER JOIN negocios n ON u.negocio_id = n.id
       WHERE u.correo = ?
       LIMIT 1`,
      [correo.toLowerCase()]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Credenciales inválidas: correo o contraseña incorrectos'
      });
    }

    const usuario = usuarios[0];

    // 2. Verificar contraseña con bcryptjs
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Credenciales inválidas: correo o contraseña incorrectos'
      });
    }

    // 3. Generar token JWT con los datos del usuario y su rol
    const payload = {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol, // 'dueno' | 'vendedor'
      negocioId: usuario.negocioId
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'clave_secreta_super_segura_vendeya_2026',
      { expiresIn: '7d' }
    );

    // 4. Responder sin incluir el password_hash
    res.status(200).json({
      ok: true,
      mensaje: `¡Bienvenido/a ${usuario.nombre}! Has ingresado como ${usuario.rol === 'dueno' ? 'Dueño del Negocio' : 'Vendedor'}.`,
      datos: {
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.rol,
          negocioId: usuario.negocioId,
          negocioNombre: usuario.negocioNombre,
          negocioSlug: usuario.negocioSlug
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// Consultar perfil del usuario autenticado
// ============================================================
router.get('/perfil', verificarToken, async (req, res, next) => {
  try {
    const [usuarios] = await pool.query(
      `SELECT u.id, u.negocio_id AS negocioId, u.nombre, u.correo, u.rol,
              n.nombre AS negocioNombre, n.slug AS negocioSlug, n.telefono AS negocioTelefono
       FROM usuarios u
       INNER JOIN negocios n ON u.negocio_id = n.id
       WHERE u.id = ?
       LIMIT 1`,
      [req.usuario.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      ok: true,
      datos: usuarios[0]
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// Actualizar perfil (Nombre, Correo y/o Contraseña) del usuario autenticado
// Permite al dueño o vendedor cambiar su nombre, correo y contraseña
// ============================================================
router.put(
  '/perfil',
  verificarToken,
  validarSchema(actualizarPerfilSchema),
  async (req, res, next) => {
    try {
      const { nombre, correo, passwordActual, passwordNuevo } = req.body;
      const usuarioId = req.usuario.id;

      // 1. Obtener usuario actual con su hash
      const [usuarios] = await pool.query(
        `SELECT id, negocio_id AS negocioId, nombre, correo, password_hash, rol
         FROM usuarios
         WHERE id = ?
         LIMIT 1`,
        [usuarioId]
      );

      if (usuarios.length === 0) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Usuario no encontrado'
        });
      }

      const usuario = usuarios[0];

      // 2. Si se desea cambiar el correo, comprobar que no esté en uso por otro usuario
      let nuevoCorreo = usuario.correo;
      if (correo && correo.toLowerCase().trim() !== usuario.correo.toLowerCase()) {
        const correoNormalizado = correo.toLowerCase().trim();
        const [existentes] = await pool.query(
          'SELECT id FROM usuarios WHERE correo = ? AND id != ? LIMIT 1',
          [correoNormalizado, usuarioId]
        );

        if (existentes.length > 0) {
          return res.status(409).json({
            ok: false,
            mensaje: `El correo "${correo}" ya se encuentra registrado en otra cuenta`
          });
        }
        nuevoCorreo = correoNormalizado;
      }

      // 3. Si se desea cambiar la contraseña, validar la contraseña actual
      let nuevoHash = usuario.password_hash;
      if (passwordNuevo) {
        const passwordCorrecta = await bcrypt.compare(passwordActual, usuario.password_hash);
        if (!passwordCorrecta) {
          return res.status(400).json({
            ok: false,
            mensaje: 'La contraseña actual no es correcta'
          });
        }
        nuevoHash = await bcrypt.hash(passwordNuevo, 10);
      }

      // 4. Determinar el nombre final (si no se envió, conservar el actual)
      const nuevoNombre = nombre ? nombre.trim() : usuario.nombre;

      // 5. Actualizar en la base de datos
      await pool.query(
        `UPDATE usuarios
         SET nombre = ?, correo = ?, password_hash = ?
         WHERE id = ?`,
        [nuevoNombre, nuevoCorreo, nuevoHash, usuarioId]
      );

      // 6. Devolver usuario actualizado (sin password_hash)
      res.status(200).json({
        ok: true,
        mensaje: 'Perfil actualizado exitosamente',
        datos: {
          id: usuario.id,
          negocioId: usuario.negocioId,
          nombre: nuevoNombre,
          correo: nuevoCorreo,
          rol: usuario.rol
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// Actualizar información del Negocio (Solo para el Dueño)
// Permite al dueño cambiar el título / nombre de su negocio
// ============================================================
router.put(
  '/negocio',
  verificarToken,
  verificarRol('dueno'),
  validarSchema(actualizarNegocioSchema),
  async (req, res, next) => {
    try {
      const { nombre } = req.body;
      const negocioId = req.usuario.negocioId;

      await pool.query(
        `UPDATE negocios
         SET nombre = ?
         WHERE id = ?`,
        [nombre.trim(), negocioId]
      );

      const [negocios] = await pool.query(
        `SELECT id, nombre, slug, telefono, direccion, logo_url AS logoUrl
         FROM negocios
         WHERE id = ?
         LIMIT 1`,
        [negocioId]
      );

      res.status(200).json({
        ok: true,
        mensaje: 'Nombre del negocio actualizado exitosamente',
        datos: negocios[0]
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// Crear nuevo usuario Vendedor (Solo para el Dueño)
// ============================================================
router.post(
  '/vendedores',
  verificarToken,
  verificarRol('dueno'),
  validarSchema(crearVendedorSchema),
  async (req, res, next) => {
    try {
      const { nombre, correo, password } = req.body;
      const negocioId = req.usuario.negocioId;

      // RN-02: Comprobar unicidad de correo
      const [existentes] = await pool.query(
        'SELECT id FROM usuarios WHERE correo = ? LIMIT 1',
        [correo.toLowerCase()]
      );

      if (existentes.length > 0) {
        return res.status(409).json({
          ok: false,
          mensaje: `El correo "${correo}" ya se encuentra registrado en el sistema`
        });
      }

      // Hash de la contraseña
      const passwordHash = await bcrypt.hash(password, 10);

      // Insertar vendedor
      const [resultado] = await pool.query(
        `INSERT INTO usuarios (negocio_id, nombre, correo, password_hash, rol, creado_en)
         VALUES (?, ?, ?, ?, 'vendedor', NOW())`,
        [negocioId, nombre, correo.toLowerCase(), passwordHash]
      );

      res.status(201).json({
        ok: true,
        mensaje: `Vendedor "${nombre}" registrado exitosamente`,
        datos: {
          id: resultado.insertId,
          negocioId,
          nombre,
          correo: correo.toLowerCase(),
          rol: 'vendedor'
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// Listar vendedores del negocio (Solo para el Dueño)
// ============================================================
router.get('/vendedores', verificarToken, verificarRol('dueno'), async (req, res, next) => {
  try {
    const negocioId = req.usuario.negocioId;

    const [vendedores] = await pool.query(
      `SELECT id, negocio_id AS negocioId, nombre, correo, rol, creado_en AS creadoEn
       FROM usuarios
       WHERE negocio_id = ? AND rol = 'vendedor'
       ORDER BY id DESC`,
      [negocioId]
    );

    res.status(200).json({
      ok: true,
      total: vendedores.length,
      datos: vendedores
    });
  } catch (error) {
    next(error);
  }
});

export default router;
