import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { probarConexion } from './db.js';
import { iniciarBaseDatos } from './database/iniciarBaseDatos.js';
import tiendasRoutes from './routes/tiendas.routes.js';
import productosRoutes from './routes/productos.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

// Validación de seguridad: en producción JWT_SECRET es estrictamente obligatorio
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('FATAL: La variable de entorno JWT_SECRET es obligatoria en producción.');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS con origen desde FRONTEND_URL (admite varios orígenes separados por coma)
const frontendEnv = process.env.FRONTEND_URL || 'http://localhost:5173,http://127.0.0.1:5173';
const origenesPermitidos = frontendEnv.split(',').map((orig) => orig.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin encabezado Origin (curl, health checks de Render, etc.)
    if (!origin) return callback(null, true);
    if (origenesPermitidos.includes(origin) || origenesPermitidos.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware global para extraer automáticamente req.usuario si se provee Bearer token
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'clave_secreta_super_segura_vendeya_2026');
      if (secret) {
        req.usuario = jwt.verify(token, secret);
      }
    } catch {
      // Si el token es inválido, continúa sin fijar req.usuario
    }
  }
  next();
});

// Endpoint de comprobación de salud para Render (Web Service Health Check)
app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

// Endpoint de diagnóstico y salud del servidor
app.get('/api/salud', (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: 'Servidor de la API VendeYa en funcionamiento',
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API (Catálogo, Productos, Pedidos y Autenticación)
app.use('/api/auth', authRoutes);
app.use('/api/tiendas', tiendasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);

// Middleware para manejo de rutas inexistentes (404)
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Middleware centralizado para manejo de errores imprevistos (500)
app.use((err, req, res, next) => {
  console.error('Error no controlado en la aplicación:', err);
  res.status(500).json({
    ok: false,
    mensaje: 'Ocurrió un error interno en el servidor'
  });
});

// Iniciar servidor HTTP escuchando en process.env.PORT (sin fijar localhost como host)
app.listen(PORT, async () => {
  console.log(`🚀 Servidor VendeYa escuchando en el puerto ${PORT}`);
  await probarConexion();
  try {
    await iniciarBaseDatos();
  } catch (error) {
    console.warn('⚠️ No se pudo inicializar la base de datos automáticamente:', error.message);
  }
});

export default app;
