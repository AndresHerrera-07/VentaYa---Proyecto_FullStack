import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  User,
  Phone,
  ArrowLeft
} from 'lucide-react';
import { API_BASE } from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { MAX_POR_PRODUCTO } from '../config/constantes.js';

export default function NuevoPedidoVendedor() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [itemsPedido, setItemsPedido] = useState([]);

  // Datos del cliente
  const [clienteNombre, setClienteNombre] = useState('Cliente Mostrador');
  const [clienteTelefono, setClienteTelefono] = useState('7000-0000');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  // 1. Cargar productos del catálogo
  useEffect(() => {
    async function cargar() {
      try {
        setCargando(true);
        const res = await fetch(`${API_BASE}/productos`);
        if (res.ok) {
          const data = await res.json();
          // Solo productos activos con stock disponible
          const disponibles = (data.datos || []).filter((p) => p.activo === 1 && p.stock > 0);
          setProductos(disponibles);
        }
      } catch (err) {
        console.error('Error al cargar catálogo:', err);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  // Agregar producto a la orden
  const agregarItem = (producto) => {
    setItemsPedido((prev) => {
      const idx = prev.findIndex((i) => i.producto.id === producto.id);
      if (idx >= 0) {
        const copia = [...prev];
        // Límite: el menor entre MAX_POR_PRODUCTO y el stock disponible
        const limiteMax = Math.min(MAX_POR_PRODUCTO, producto.stock);
        const nuevaCant = Math.min(copia[idx].cantidad + 1, limiteMax);
        copia[idx] = { ...copia[idx], cantidad: nuevaCant };
        return copia;
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const modificarCantidad = (prodId, cant) => {
    if (cant <= 0) {
      setItemsPedido((prev) => prev.filter((i) => i.producto.id !== prodId));
      return;
    }
    setItemsPedido((prev) =>
      prev.map((i) => {
        if (i.producto.id === prodId) {
          // Límite: el menor entre MAX_POR_PRODUCTO y el stock disponible
          const limiteMax = Math.min(MAX_POR_PRODUCTO, i.producto.stock);
          return { ...i, cantidad: Math.min(cant, limiteMax) };
        }
        return i;
      })
    );
  };

  // Calcular total
  const total = Number(
    itemsPedido.reduce((acc, i) => acc + Number(i.producto.precio) * i.cantidad, 0).toFixed(2)
  );

  // Registrar pedido
  const manejarRegistrar = async (e) => {
    e.preventDefault();
    setError(null);

    if (itemsPedido.length === 0) {
      setError('Debes agregar al menos un producto a la orden');
      return;
    }
    if (!clienteNombre.trim()) {
      setError('El nombre del cliente es obligatorio');
      return;
    }
    if (!clienteTelefono.trim() || clienteTelefono.replace(/\D/g, '').length < 7) {
      setError('El teléfono del cliente debe tener al menos 7 dígitos');
      return;
    }

    try {
      setGuardando(true);
      const payload = {
        clienteNombre: clienteNombre.trim(),
        clienteTelefono: clienteTelefono.trim(),
        slug: usuario?.negocioSlug || 'antojitos-santa-tecla',
        items: itemsPedido.map((i) => ({
          productoId: i.producto.id,
          cantidad: i.cantidad
        }))
      };

      const res = await fetch(`${API_BASE}/pedidos/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.mensaje || 'Error al registrar pedido');
      }

      // Redirigir directamente al panel de pedidos
      navigate('/admin/pedidos');
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/admin/pedidos')}
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver a Pedidos
          </button>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Toma de Pedido en Mostrador
          </h1>
          <p className="text-xs text-stone-500">
            Registra una nueva orden directamente en el sistema para clientes presenciales o por llamada.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Selección de Productos */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar producto por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 bg-white text-xs outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            />
          </div>

          {cargando ? (
            <div className="text-center py-12 text-xs text-stone-400">
              Cargando catálogo disponible...
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-xs text-stone-500">
              No se encontraron productos disponibles con existencias.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {productosFiltrados.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-xl border border-stone-200 p-3 flex items-center justify-between hover:border-stone-300 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {prod.imagenUrl ? (
                      <img
                        src={prod.imagenUrl}
                        alt={prod.nombre}
                        className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-stone-100 text-stone-400 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate">{prod.nombre}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        <span className="font-semibold text-amber-800">
                          ${Number(prod.precio).toFixed(2)}
                        </span>
                        <span>· Stock: {prod.stock}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => agregarItem(prod)}
                    className="p-2 rounded-lg bg-stone-100 hover:bg-amber-700 hover:text-white text-stone-700 text-xs font-bold transition-colors ml-2"
                    title="Agregar a la orden"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Detalle de la Orden y Datos del Cliente */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col justify-between h-fit">
          <form onSubmit={manejarRegistrar} className="space-y-4">
            <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
              Resumen de la Orden
            </h3>

            {/* Datos del Cliente */}
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Nombre del Cliente
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 text-xs outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Teléfono / Contacto
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={clienteTelefono}
                    onChange={(e) => setClienteTelefono(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 text-xs outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Lista de Ítems */}
            <div className="border-t border-stone-100 pt-3">
              <span className="text-[11px] font-bold text-stone-500 uppercase block mb-2">
                Productos Seleccionados ({itemsPedido.length})
              </span>

              {itemsPedido.length === 0 ? (
                <div className="text-center py-6 text-xs text-stone-400">
                  Selecciona productos del catálogo a la izquierda
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {itemsPedido.map((item) => (
                    <div
                      key={item.producto.id}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-stone-50 border border-stone-200"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="font-semibold text-stone-800 block truncate">
                          {item.producto.nombre}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          ${Number(item.producto.precio).toFixed(2)} c/u
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => modificarCantidad(item.producto.id, item.cantidad - 1)}
                          className="w-5 h-5 rounded-md bg-stone-200 text-stone-700 flex items-center justify-center text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-bold text-xs">{item.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => modificarCantidad(item.producto.id, item.cantidad + 1)}
                          disabled={item.cantidad >= Math.min(MAX_POR_PRODUCTO, item.producto.stock)}
                          className="w-5 h-5 rounded-md bg-stone-200 text-stone-700 flex items-center justify-center text-xs disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-black text-stone-900 ml-3">
                        ${(Number(item.producto.precio) * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total y Botón de Creación */}
            <div className="border-t border-stone-200 pt-3 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-stone-700">Total a Pagar</span>
                <span className="text-xl font-black text-stone-900">${total.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                disabled={guardando || itemsPedido.length === 0}
                className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {guardando ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar y Crear Pedido</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
