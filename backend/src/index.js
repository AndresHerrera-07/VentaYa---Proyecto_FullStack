import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { probarConexion } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Endpoint de diagnóstico y salud del servidor
app.get('/api/salud', (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: 'Servidor de la API VendeYa en funcionamiento',
    timestamp: new Date().toISOString()
  });
});

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

// Iniciar servidor HTTP
app.listen(PORT, async () => {
  console.log(`🚀 Servidor VendeYa escuchando en http://localhost:${PORT}`);
  await probarConexion();
});

export default app;
