import { z } from 'zod';

// Esquema de validación para registrar un nuevo producto (RN-04 y RN-05)
export const crearProductoSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre del producto es obligatorio' })
    .trim()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(150, { message: 'El nombre no puede exceder 150 caracteres' }),

  descripcion: z
    .string()
    .trim()
    .max(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
    .optional()
    .nullable(),

  precio: z
    .number({
      required_error: 'El precio es obligatorio',
      invalid_type_error: 'El precio debe ser un número válido'
    })
    .positive({ message: 'El precio debe ser mayor que cero ($0.00)' }),

  stock: z
    .number({
      required_error: 'La cantidad de existencias (stock) es obligatoria',
      invalid_type_error: 'El stock debe ser un número entero'
    })
    .int({ message: 'El stock debe ser un número entero sin decimales' })
    .min(0, { message: 'El inventario no puede ser negativo' }),

  imagenUrl: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),

  categoria: z
    .string()
    .trim()
    .max(100, { message: 'La categoría no puede exceder 100 caracteres' })
    .optional()
    .nullable()
});

// Esquema para actualizar producto (los campos son opcionales pero deben cumplir las mismas reglas si se envían)
export const actualizarProductoSchema = crearProductoSchema.partial().extend({
  activo: z
    .union([z.boolean(), z.number().int().min(0).max(1)])
    .optional()
});
