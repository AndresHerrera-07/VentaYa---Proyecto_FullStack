import { useState, useEffect } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Package,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';
import { API_BASE } from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';

// Colores e insignias según el estado del pedido (RN-09)
const CONFIG_ESTADOS = {
  pendiente: {
    etiqueta: 'Pendiente',
    fondo: 'bg-amber-50 text-amber-900 border-amber-200',
    icono: Clock,
    siguientes: [
      { estado: 'confirmado', texto: 'Confirmar Pedido', clase: 'bg-blue-600 hover:bg-blue-700 text-white' },
      { estado: 'cancelado', texto: 'Cancelar Pedido', clase: 'bg-rose-600 hover:bg-rose-700 text-white' }
    ]
  },
  confirmado: {
    etiqueta: 'Confirmado',
    fondo: 'bg-blue-50 text-blue-900 border-blue-200',
    icono: CheckCircle2,
    siguientes: [
      { estado: 'preparando', texto: 'Iniciar Preparación', clase: 'bg-amber-600 hover:bg-amber-700 text-white' },
      { estado: 'cancelado', texto: 'Cancelar Pedido', clase: 'bg-rose-600 hover:bg-rose-700 text-white' }
    ]
  },
  preparando: {
    etiqueta: 'Preparando',
    fondo: 'bg-amber-50 text-amber-900 border-amber-200',
    icono: Package,
    siguientes: [
      { estado: 'listo', texto: 'Marcar como Listo', clase: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
      { estado: 'cancelado', texto: 'Cancelar Pedido', clase: 'bg-rose-600 hover:bg-rose-700 text-white' }
    ]
  },
  listo: {
    etiqueta: 'Listo para Entrega',
    fondo: 'bg-purple-50 text-purple-900 border-purple-200',
    icono: CheckCircle2,
    siguientes: [
      { estado: 'entregado', texto: 'Marcar Entregado', clase: 'bg-emerald-700 hover:bg-emerald-800 text-white' }
    ]
  },
  entregado: {
    etiqueta: 'Entregado',
    fondo: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    icono: CheckCircle2,
    siguientes: []
  },
  cancelado: {
    etiqueta: 'Cancelado',
    fondo: 'bg-rose-50 text-rose-900 border-rose-200',
    icono: XCircle,
    siguientes: []
  }
};

export default function PedidosAdmin() {
  const { token } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [mensajeAlerta, setMensajeAlerta] = useState(null);

  // Modal para ver detalles de un pedido
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  // 1. Cargar lista de pedidos desde el backend
  async function cargarPedidos() {
    try {
      setCargando(true);
      let url = `${API_BASE}/pedidos`;
      if (filtroEstado !== 'todos') {
        url += `?estado=${filtroEstado}`;
      }

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setPedidos(data.datos || []);
      }
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPedidos();
  }, [filtroEstado]);

  // 2. Cargar detalle individual de un pedido
  const abrirDetallePedido = async (id) => {
    try {
      setCargandoDetalles(true);
      const res = await fetch(`${API_BASE}/pedidos/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setPedidoSeleccionado(data.datos);
      }
    } catch (err) {
      console.error('Error al cargar detalle del pedido:', err);
    } finally {
      setCargandoDetalles(false);
    }
  };

  // 3. Cambiar estado de un pedido (RN-09 y RN-10)
  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      setActualizandoEstado(true);

      const res = await fetch(`${API_BASE}/pedidos/${pedidoId}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      const data = await res.json();

      if (!res.ok) {
        setMensajeAlerta({
          tipo: 'error',
          texto: data.mensaje || 'No se pudo cambiar el estado del pedido'
        });
        setTimeout(() => setMensajeAlerta(null), 4000);
        return;
      }

      setMensajeAlerta({
        tipo: 'exito',
        texto: nuevoEstado === 'cancelado'
          ? `Pedido #${pedidoId} cancelado. El stock fue restaurado al inventario (RN-10).`
          : `Estado del pedido #${pedidoId} actualizado a "${nuevoEstado}".`
      });
      setTimeout(() => setMensajeAlerta(null), 4000);

      // Si está en el modal, actualizar el objeto en pantalla
      if (pedidoSeleccionado && pedidoSeleccionado.id === pedidoId) {
        setPedidoSeleccionado((prev) => ({ ...prev, estado: nuevoEstado }));
      }

      cargarPedidos();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    } finally {
      setActualizandoEstado(false);
    }
  };

  // Filtrar pedidos localmente por cliente o ID
  const pedidosFiltrados = pedidos.filter((p) => {
    if (!busqueda.trim()) return true;
    const termino = busqueda.toLowerCase();
    return (
      p.clienteNombre?.toLowerCase().includes(termino) ||
      p.clienteTelefono?.includes(termino) ||
      p.id.toString().includes(termino)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Gestión de Pedidos</h1>
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
              {pedidos.length} órdenes
            </span>
          </div>
          <p className="text-xs text-stone-500">
            Administra los pedidos recibidos, cambia estados y contacta a tus clientes directamente por WhatsApp.
          </p>
        </div>

        <button
          onClick={cargarPedidos}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Banner de alerta temporal */}
      {mensajeAlerta && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs font-medium flex items-center justify-between border shadow-xs transition-all ${
            mensajeAlerta.tipo === 'exito'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {mensajeAlerta.tipo === 'exito' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{mensajeAlerta.texto}</span>
          </div>
          <button onClick={() => setMensajeAlerta(null)} className="text-stone-400 hover:text-stone-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filtros de Estado (Pestañas) y Buscador */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-xs mb-6 space-y-4 transition-colors">
        {/* Barra de pestañas por estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['todos', 'pendiente', 'confirmado', 'preparando', 'listo', 'entregado', 'cancelado'].map(
            (est) => (
              <button
                key={est}
                onClick={() => setFiltroEstado(est)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                  filtroEstado === est
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                {est}
              </button>
            )
          )}
        </div>

        {/* Buscador por cliente o ID */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por número de pedido (#), nombre del cliente o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-hidden"
          />
        </div>
      </div>

      {/* Lista de Pedidos */}
      {cargando ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-stone-500 dark:text-stone-400">Cargando pedidos de tu negocio...</p>
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center max-w-md mx-auto my-8">
          <ClipboardList className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-1">No hay pedidos para mostrar</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
            {filtroEstado !== 'todos'
              ? `No se encontraron pedidos en estado "${filtroEstado}".`
              : 'Aún no has recibido pedidos en tu tienda.'}
          </p>
          {filtroEstado !== 'todos' && (
            <button
              onClick={() => setFiltroEstado('todos')}
              className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800"
            >
              Ver todos los pedidos
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {pedidosFiltrados.map((pedido) => {
            const config = CONFIG_ESTADOS[pedido.estado] || CONFIG_ESTADOS.pendiente;
            const IconoEstado = config.icono;
            const numeroTel = pedido.clienteTelefono?.replace(/\D/g, '');

            return (
              <div
                key={pedido.id}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs hover:border-stone-300 dark:hover:border-stone-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Información Principal del Pedido */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-stone-500 dark:text-stone-400">#{pedido.id}</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${config.fondo}`}
                    >
                      <IconoEstado className="w-3 h-3" />
                      {config.etiqueta}
                    </span>
                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(pedido.fechaCreacion || pedido.creadoEn).toLocaleString('es-SV', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="text-sm font-bold text-stone-900 dark:text-stone-100">{pedido.clienteNombre}</span>
                    {pedido.clienteTelefono && (
                      <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-stone-400" />
                        {pedido.clienteTelefono}
                      </span>
                    )}
                  </div>
                </div>

                {/* Total y Acciones */}
                <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100 dark:border-stone-800">
                  <div className="text-left md:text-right mr-2">
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 block uppercase font-medium">Total</span>
                    <span className="text-base font-black text-stone-900 dark:text-stone-50">
                      ${Number(pedido.total).toFixed(2)}
                    </span>
                  </div>

                  {/* Botón WhatsApp directo al cliente */}
                  {numeroTel && (
                    <a
                      href={`https://wa.me/${numeroTel}?text=${encodeURIComponent(
                        `¡Hola ${pedido.clienteNombre}! Te saludamos respecto a tu pedido #${pedido.id} en VendeYa.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold transition-colors"
                      title="Contactar al cliente por WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                  )}

                  {/* Botón para ver items del pedido */}
                  <button
                    onClick={() => abrirDetallePedido(pedido.id)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detalles</span>
                  </button>

                  {/* Acciones de cambio de estado rápido (RN-09) */}
                  {config.siguientes.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      {config.siguientes.map((sig) => (
                        <button
                          key={sig.estado}
                          disabled={actualizandoEstado}
                          onClick={() => cambiarEstado(pedido.id, sig.estado)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 ${sig.clase}`}
                        >
                          {sig.texto}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalle de Pedido */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto transition-colors">
            <button
              onClick={() => setPedidoSeleccionado(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="font-mono text-xs text-stone-500 dark:text-stone-400 font-bold block">
                Pedido #{pedidoSeleccionado.id}
              </span>
              <h3 className="text-lg font-black text-stone-900 dark:text-stone-50">Detalles de la Orden</h3>
            </div>

            {/* Datos del cliente */}
            <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl p-3.5 border border-stone-200 dark:border-stone-700 text-xs space-y-1 mb-4">
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">Cliente:</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{pedidoSeleccionado.clienteNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">Teléfono:</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{pedidoSeleccionado.clienteTelefono}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">Estado actual:</span>
                <span className="font-bold uppercase text-amber-900 dark:text-amber-400">{pedidoSeleccionado.estado}</span>
              </div>
            </div>

            {/* Lista de productos incluidos en el pedido */}
            <div className="mb-4">
              <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                Productos ordenados
              </h4>
              <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
                {pedidoSeleccionado.detalles?.map((det) => (
                  <div key={det.id} className="p-3 flex items-center justify-between text-xs bg-white dark:bg-stone-800/70">
                    <div className="flex items-center gap-3">
                      {det.imagenUrl ? (
                        <img
                          src={det.imagenUrl}
                          alt={det.nombre}
                          className="w-10 h-10 rounded-lg object-cover border border-stone-200 dark:border-stone-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center">
                          <Package className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-stone-900 dark:text-stone-100 block">{det.nombre}</span>
                        <span className="text-stone-500 dark:text-stone-400">
                          {det.cantidad} x ${Number(det.precioUnitario).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-stone-900 dark:text-stone-50">
                      ${Number(det.subtotal).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total general */}
            <div className="border-t border-stone-200 pt-3 flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-stone-700">Total Facturado</span>
              <span className="text-xl font-black text-stone-900">
                ${Number(pedidoSeleccionado.total).toFixed(2)}
              </span>
            </div>

            {/* Transiciones permitidas desde el modal */}
            {CONFIG_ESTADOS[pedidoSeleccionado.estado]?.siguientes.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-stone-500 block uppercase">
                  Acciones disponibles
                </span>
                <div className="flex flex-wrap gap-2">
                  {CONFIG_ESTADOS[pedidoSeleccionado.estado].siguientes.map((sig) => (
                    <button
                      key={sig.estado}
                      disabled={actualizandoEstado}
                      onClick={() => cambiarEstado(pedidoSeleccionado.id, sig.estado)}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 ${sig.clase}`}
                    >
                      {sig.texto}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
