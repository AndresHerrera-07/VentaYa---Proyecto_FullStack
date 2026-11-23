import { z } from 'zod';

// Límite máximo de unidades por producto en un mismo pedido (RN-04)
const MAX_POR_PRODUCTO = 4;

// Esquema de validación para el Checkout Express (HU-08)
export const checkoutSchema = z.object({
  clienteNombre: z
    .string({ required_error: 'El nombre del cliente es obligatorio' })
    .trim()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres' }),

  clienteTelefono: z
    .string({ required_error: 'El teléfono de contacto es obligatorio' })
    .trim()
    .min(7, { message: 'El teléfono debe tener al menos 7 dígitos' })
    .max(20, { message: 'El teléfono no puede exceder 20 caracteres' }),

  slug: z
    .string()
    .trim()
    .optional(),

  items: z
    .array(
      z.object({
        productoId: z
          .number({ required_error: 'El ID del producto es obligatorio' })
          .int()
          .positive({ message: 'El ID del producto no es válido' }),
        cantidad: z
          .number({ required_error: 'La cantidad es obligatoria' })
          .int()
          .min(1, { message: 'La cantidad mínima por producto es 1' })
          .max(MAX_POR_PRODUCTO, {
            message: `La cantidad máxima por producto es ${MAX_POR_PRODUCTO} unidades`
          })
      })
    )
    .min(1, { message: 'El pedido debe contener al menos un producto' })
});

// Esquema para cambio de estado de pedidos (RN-09)
export const cambiarEstadoSchema = z.object({
  estado: z.enum(
    ['pendiente', 'confirmado', 'preparando', 'listo', 'entregado', 'cancelado'],
    {
      required_error: 'El nuevo estado es obligatorio',
      invalid_type_error: 'Estado no válido'
    }
  )
});
