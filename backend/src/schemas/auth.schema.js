import { z } from 'zod';

// Esquema de validación para inicio de sesión (HU-02)
export const loginSchema = z.object({
  correo: z
    .string({ required_error: 'El correo electrónico es obligatorio' })
    .trim()
    .email({ message: 'El formato del correo electrónico no es válido' }),

  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(6, { message: 'La contraseña debe contener al menos 6 caracteres' })
});

// Esquema para que el dueño registre un vendedor en su negocio
export const crearVendedorSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre es obligatorio' })
    .trim()
    .min(2, { message: 'El nombre debe contener al menos 2 caracteres' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres' }),

  correo: z
    .string({ required_error: 'El correo electrónico es obligatorio' })
    .trim()
    .email({ message: 'El formato del correo electrónico no es válido' }),

  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(6, { message: 'La contraseña debe contener al menos 6 caracteres' })
});


// Esquema para que el usuario actualice su nombre, correo y/o contraseña
export const actualizarPerfilSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, { message: 'El nombre debe contener al menos 2 caracteres' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres' })
    .optional(),

  correo: z
    .string()
    .trim()
    .email({ message: 'El formato del correo electrónico no es válido' })
    .optional(),

  passwordActual: z
    .string()
    .min(6, { message: 'La contraseña actual debe tener al menos 6 caracteres' })
    .optional(),

  passwordNuevo: z
    .string()
    .min(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
    .optional()
}).refine((data) => {
  if (data.passwordNuevo && !data.passwordActual) {
    return false;
  }
  return true;
}, {
  message: 'Debes proporcionar tu contraseña actual para establecer una nueva',
  path: ['passwordActual']
});

// Esquema para que el dueño actualice los datos de su negocio (nombre, dirección, teléfono, logo)
export const actualizarNegocioSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, { message: 'El nombre del negocio debe contener al menos 2 caracteres' })
    .max(100, { message: 'El nombre del negocio no puede exceder 100 caracteres' })
    .optional(),

  telefono: z
    .string()
    .trim()
    .max(30, { message: 'El teléfono no puede exceder 30 caracteres' })
    .nullable()
    .optional(),

  direccion: z
    .string()
    .trim()
    .max(255, { message: 'La dirección no puede exceder 255 caracteres' })
    .nullable()
    .optional(),

  logoUrl: z
    .string()
    .trim()
    .nullable()
    .optional()
});
