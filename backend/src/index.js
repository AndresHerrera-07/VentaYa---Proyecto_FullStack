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

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors({
  origin: true, // Refleja dinámicamente cualquier origen (localhost, 127.0.0.1, IP local)
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
      req.usuario = jwt.verify(
        token,
        process.env.JWT_SECRET || 'clave_secreta_super_segura_vendeya_2026'
      );
    } catch {
      // Si el token es inválido, continúa sin fijar req.usuario
    }
  }
  next();
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

// Iniciar servidor HTTP en todas las interfaces de red
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Servidor VendeYa escuchando en http://localhost:${PORT}`);
  await probarConexion();
  try {
    await iniciarBaseDatos();
  } catch (error) {
    console.warn('⚠️ No se pudo inicializar la base de datos automáticamente:', error.message);
  }
});

export default app;
