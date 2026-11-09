import jwt from 'jsonwebtoken';

/**
 * Middleware para validar el token JWT y extraer los datos del usuario autenticado.
 * Coloca los datos decodificados en `req.usuario` ({ id, nombre, correo, rol, negocioId }).
 */
export function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      mensaje: 'Acceso no autorizado: debes iniciar sesión para continuar'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodificado = jwt.verify(
      token,
      process.env.JWT_SECRET || 'clave_secreta_super_segura_vendeya_2026'
    );
    req.usuario = decodificado;
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      mensaje: 'Token inválido o expirado. Por favor, inicia sesión nuevamente'
    });
  }
}

/**
 * Middleware para restringir acceso por roles ('dueno', 'vendedor').
 * Ejemplo: verificarRol('dueno') o verificarRol('dueno', 'vendedor')
 */
export function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Debes identificarte antes de verificar tus permisos'
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        ok: false,
        mensaje: `Acceso restringido: esta acción requiere rol de [${rolesPermitidos.join(', ')}]. Tu rol actual es "${req.usuario.rol}".`
      });
    }

    next();
  };
}
