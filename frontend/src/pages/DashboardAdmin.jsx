import { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  DollarSign,
  ShoppingBag,
  Clock,
  Package,
  Copy,
  Printer,
  Check,
  ExternalLink,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { API_BASE } from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function DashboardAdmin() {
  const { token } = useAuth();
  const { temaOscuro } = useTheme();
  const [metricas, setMetricas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const seccionImpresionRef = useRef(null);

  // 1. Cargar métricas agregadas desde el backend
  async function cargarMetricas() {
    try {
      setCargando(true);
      const res = await fetch(`${API_BASE}/pedidos/metricas/dashboard`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setMetricas(data.datos);
      }
    } catch (err) {
      console.error('Error al cargar métricas del dashboard:', err);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarMetricas();
  }, []);

  // Copiar URL pública de la tienda
  const urlPublica = `${window.location.origin}/tienda/${metricas?.negocio?.slug || 'antojitos-santa-tecla'}`;

  const copiarEnlace = () => {
    navigator.clipboard.writeText(urlPublica);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Imprimir QR para el mostrador
  const imprimirQR = () => {
    const contenido = seccionImpresionRef.current?.innerHTML;
    if (!contenido) return;

    const ventana = window.open('', '', 'width=600,height=700');
    ventana.document.write(`
      <html>
        <head>
          <title>Código QR Mostrador - ${metricas?.negocio?.nombre || 'VendeYa'}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; }
            h2 { font-size: 24px; margin-bottom: 8px; }
            p { color: #666; margin-bottom: 24px; font-size: 14px; }
            .qr-container { display: inline-block; padding: 20px; border: 2px dashed #ccc; border-radius: 16px; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            ${contenido}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    ventana.document.close();
  };

  // Preparar datos para el gráfico de barras por estado
  const datosEstados = metricas?.pedidosPorEstado
    ? Object.entries(metricas.pedidosPorEstado).map(([estado, cantidad]) => ({
        estado: estado.charAt(0).toUpperCase() + estado.slice(1),
        cantidad
      }))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8 transition-colors duration-200">
      {/* Encabezado del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 inline-flex items-center gap-1">
              👑 Panel Administrativo
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-50 tracking-tight">
            Dashboard de Negocio
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Métricas de ventas, estado de pedidos y herramientas de promoción para {metricas?.negocio?.nombre || 'tu negocio'}.
          </p>
        </div>

        <button
          onClick={cargarMetricas}
          disabled={cargando}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* 1. Tarjetas de Indicadores Clave (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ingresos Totales */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
              Ingresos Totales
            </span>
            <span className="text-2xl font-black text-stone-900 dark:text-stone-50 mt-1 block">
              ${Number(metricas?.ingresosTotales || 0).toFixed(2)}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Pedidos no cancelados
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/60">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Pedidos Totales */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
              Pedidos Recibidos
            </span>
            <span className="text-2xl font-black text-stone-900 dark:text-stone-50 mt-1 block">
              {metricas?.totalPedidos || 0}
            </span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">Histórico total</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center border border-blue-100 dark:border-blue-800/60">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Pedidos Pendientes */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
              Por Atender
            </span>
            <span className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1 block">
              {metricas?.pedidosPendientes || 0}
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1 block">
              Requieren confirmación
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-100 dark:border-amber-800/60">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Productos Activos */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
              Catálogo Activo
            </span>
            <span className="text-2xl font-black text-stone-900 dark:text-stone-50 mt-1 block">
              {metricas?.productosActivos || 0}
            </span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">
              De {metricas?.totalProductos || 0} registrados
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-100 dark:border-purple-800/60">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Gráficos Visuales con Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Ventas en dólares de los últimos 7 días */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Ventas de los Últimos 7 Días ($ USD)</h3>
            <p className="text-xs text-stone-400 dark:text-stone-500">Ingresos confirmados por día</p>
          </div>

          <div className="h-64 w-full">
            {metricas?.ventasDias?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metricas.ventasDias} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#b45309" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#b45309" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={temaOscuro ? '#292524' : '#f5f5f4'} />
                  <XAxis dataKey="dia" tick={{ fontSize: 11, fill: temaOscuro ? '#a8a29e' : '#78716c' }} />
                  <YAxis tick={{ fontSize: 11, fill: temaOscuro ? '#a8a29e' : '#78716c' }} />
                  <Tooltip
                    formatter={(val) => [`$${Number(val).toFixed(2)}`, 'Ventas']}
                    contentStyle={{
                      backgroundColor: temaOscuro ? '#1c1917' : '#292524',
                      borderColor: temaOscuro ? '#44403c' : '#1c1917',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#b45309"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVentas)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">
                Sin registros de ventas en la última semana
              </div>
            )}
          </div>
        </div>

        {/* Gráfico 2: Pedidos agrupados por estado */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Distribución de Pedidos por Estado</h3>
            <p className="text-xs text-stone-400 dark:text-stone-500">Volumen de pedidos en cada etapa</p>
          </div>

          <div className="h-64 w-full">
            {datosEstados.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosEstados} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={temaOscuro ? '#292524' : '#f5f5f4'} />
                  <XAxis dataKey="estado" tick={{ fontSize: 10, fill: temaOscuro ? '#a8a29e' : '#78716c' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: temaOscuro ? '#a8a29e' : '#78716c' }} />
                  <Tooltip
                    formatter={(val) => [val, 'Pedidos']}
                    contentStyle={{
                      backgroundColor: temaOscuro ? '#1c1917' : '#292524',
                      borderColor: temaOscuro ? '#44403c' : '#1c1917',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="cantidad" fill="#d97706" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">
                Aún no hay pedidos registrados
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Generación y Compartición de Código QR (HU-10) */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Tarjeta Visual de Código QR lista para imprimir o colocar en mostrador */}
          <div
            ref={seccionImpresionRef}
            className="bg-stone-50 dark:bg-stone-800/60 p-6 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 text-center flex flex-col items-center justify-center shadow-xs shrink-0"
          >
            <div className="bg-white p-4 rounded-xl shadow-xs border border-stone-200 mb-3">
              <QRCodeSVG
                value={urlPublica}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>
            <span className="text-xs font-black text-stone-900 dark:text-stone-100 block tracking-tight">
              {metricas?.negocio?.nombre || 'Mi Tienda VendeYa'}
            </span>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-0.5">
              Escanea para ver nuestro menú y ordenar
            </span>
          </div>

          {/* Opciones y Enlaces */}
          <div className="space-y-4 flex-1">
            <div>
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block mb-1">
                Herramienta para tu negocio físico
              </span>
              <h2 className="text-xl font-black text-stone-900 dark:text-stone-50">
                Código QR para mostrador y redes sociales
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mt-1">
                Tus clientes pueden escanear este código con la cámara de su teléfono para ingresar directamente a tu catálogo público, agregar productos al carrito y enviarte pedidos sin descargar ninguna app.
              </p>
            </div>

            {/* Enlace público y botón copiar */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Enlace directo de tu catálogo:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={urlPublica}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-mono select-all outline-hidden"
                />
                <button
                  onClick={copiarEnlace}
                  className="px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs transition-colors"
                >
                  {copiado ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiado ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={imprimirQR}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir QR para mostrador</span>
              </button>

              <a
                href={urlPublica}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold shadow-xs transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                <span>Abrir tienda en nueva pestaña</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
