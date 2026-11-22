// Constante centralizada de configuración para la API de VendeYa
// En producción (Vercel), lee import.meta.env.VITE_API_URL
// En desarrollo, usa http://localhost:3000 como valor por defecto
const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '');

/**
 * Normaliza la URL base de la API para garantizar el prefijo /api
 * tanto si el usuario configuró https://dominio como https://dominio/api
 */
function normalizarUrlApi(url) {
  if (!url) return '/api';
  const sinBarraFinal = url.replace(/\/+$/, '');
  return sinBarraFinal.endsWith('/api') ? sinBarraFinal : `${sinBarraFinal}/api`;
}

export const API_BASE = normalizarUrlApi(apiUrl);
export default API_BASE;
