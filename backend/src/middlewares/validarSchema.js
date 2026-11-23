// Middleware reutilizable para validar el cuerpo de las peticiones (req.body) con Zod
export function validarSchema(schema) {
  return (req, res, next) => {
    try {
      // parse arroja excepción si no cumple con las reglas del esquema
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      // Capturar los errores de validación de Zod y formatearlos en español
      const listaErrores = error.errors || error.issues;
      if (listaErrores && Array.isArray(listaErrores)) {
        const errores = listaErrores.map((err) => ({
          campo: err.path.join('.'),
          mensaje: err.message
        }));

        return res.status(400).json({
          ok: false,
          mensaje: 'Los datos enviados no son válidos',
          errores
        });
      }

      // En caso de cualquier otro error de parseo
      return res.status(400).json({
        ok: false,
        mensaje: 'Error de validación en la solicitud',
        detalle: error.message
      });
    }
  };
}
