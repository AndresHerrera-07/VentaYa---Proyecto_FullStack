// Configuración centralizada de la API para VendeYa
// Permite alternar fácilmente entre entorno local y despliegue en Vercel/Producción
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
