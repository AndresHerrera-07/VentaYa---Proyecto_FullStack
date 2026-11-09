import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  Store,
  DollarSign,
  User,
  Phone,
  Package,
  RotateCcw
} from 'lucide-react';
import { API_BASE } from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function CajeroVendedor() {
  const { usuario } = useAuth();

  // Estados de catálogo
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
  const [categorias, setCategorias] = useState([]);

  // Estados de la orden actual (comanda)
  const [itemsOrden, setItemsOrden] = useState([]);
  const [clienteNombre, setClienteNombre] = useState('Cliente Mostrador');
  const [clienteTelefono, setClienteTelefono] = useState('7000-0000');

  // Estados de proceso
  const [procesando, setProcesando] = useState(false);
  const [pedidoExitoso, setPedidoExitoso] = useState(null);
  const [error, setError] = useState(null);

  // 1. Cargar productos desde la API
  const cargarProductos = async () => {
    try {
      setCargando(true);
      const res = await fetch(`${API_BASE}/productos`);
      if (res.ok) {
        const data = await res.json();
        const lista = data.datos || [];
        setProductos(lista);

        // Extraer categorías únicas
        const cats = Array.from(new Set(lista.map((p) => p.categoria).filter(Boolean)));
        setCategorias(cats);
      }
    } catch (err) {
      console.error('Error al cargar productos para la caja:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // Agregar producto al ticket
  const agregarAlTicket = (prod) => {
    setError(null);
    setPedidoExitoso(null);

    setItemsOrden((prev) => {
      const existe = prev.find((item) => item.producto.id === prod.id);
      if (existe) {
        if (existe.cantidad >= prod.stock) {
          setError(`No hay más existencias disponibles de "${prod.nombre}". Stock: ${prod.stock}`);
          return prev;
        }
        return prev.map((item) =>
          item.producto.id === prod.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { producto: prod, cantidad: 1 }];
    });
  };

  // Cambiar cantidad en el ticket
  const cambiarCantidad = (productoId, nuevaCantidad, stockMax) => {
    if (nuevaCantidad <= 0) {
      quitarDelTicket(productoId);
      return;
    }
    if (nuevaCantidad > stockMax) {
      setError(`Stock máximo alcanzado (${stockMax} unidades).`);
      return;
    }
    setItemsOrden((prev) =>
      prev.map((item) =>
        item.producto.id === productoId ? { ...item, cantidad: nuevaCantidad } : item
      )
    );
  };

  // Quitar producto del ticket
  const quitarDelTicket = (productoId) => {
    setItemsOrden((prev) => prev.filter((item) => item.producto.id !== productoId));
  };

  // Vaciar ticket
  const limpiarTicket = () => {
    setItemsOrden([]);
    setClienteNombre('Cliente Mostrador');
    setClienteTelefono('7000-0000');
    setError(null);
  };

  // Calcular total de la comanda
  const totalArticulos = itemsOrden.reduce((acc, i) => acc + i.cantidad, 0);
  const totalPrecio = Number(
    itemsOrden.reduce((acc, i) => acc + Number(i.producto.precio) * i.cantidad, 0).toFixed(2)
  );

  // Registrar la venta (Checkout Express en backend)
  const manejarRegistrarVenta = async (e) => {
    e.preventDefault();
    setError(null);
    setPedidoExitoso(null);

    if (itemsOrden.length === 0) {
      setError('Debes agregar al menos un producto a la comanda.');
      return;
    }

    if (!clienteNombre.trim()) {
      setError('Por favor indica el nombre del cliente o comanda.');
      return;
    }

    if (!clienteTelefono.trim() || clienteTelefono.replace(/\D/g, '').length < 7) {
      setError('Ingresa un número telefónico válido (mínimo 7 dígitos).');
      return;
    }

    try {
      setProcesando(true);

      const payload = {
        clienteNombre: clienteNombre.trim(),
        clienteTelefono: clienteTelefono.trim(),
        slug: usuario?.negocioSlug || 'antojitos-santa-tecla',
        items: itemsOrden.map((i) => ({
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
        throw new Error(data.mensaje || 'Error al registrar la venta.');
      }

      setPedidoExitoso(data.datos);
      limpiarTicket();
      // Recargar catálogo para actualizar el stock visible
      await cargarProductos();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  // Filtrado de productos en memoria
  const productosFiltrados = productos.filter((prod) => {
    const coincideBusqueda =
      prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (prod.descripcion && prod.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
    const coincideCategoria =
      categoriaSeleccionada === 'todas' || prod.categoria === categoriaSeleccionada;
    return prod.activo === 1 && coincideBusqueda && coincideCategoria;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
      {/* Encabezado del Cajero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200 inline-flex items-center gap-1">
              🧑‍💼 Terminal de Ventas / Cajero
            </span>
            <span className="text-xs text-stone-500 font-medium">
              Vendedor: <strong className="text-stone-800">{usuario?.nombre}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Punto de Venta y Mostrador
          </h1>
          <p className="text-xs text-stone-500">
            Registra pedidos de clientes en mesa, mostrador o por teléfono con actualización automática de inventario.
          </p>
        </div>

        <Link
          to="/admin/pedidos"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <ClipboardList className="w-4 h-4 text-amber-700" />
          <span>Ver Lista de Pedidos</span>
        </Link>
      </div>

      {/* Alerta de Venta Confirmada */}
      {pedidoExitoso && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold text-emerald-950">
                ¡Venta registrada exitosamente! — Pedido #{pedidoExitoso.id}
              </p>
              <p className="text-emerald-700">
                Cliente: <strong>{pedidoExitoso.clienteNombre}</strong> · Total:{' '}
                <strong>${Number(pedidoExitoso.total).toFixed(2)}</strong> · Stock descontado.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/pedidos"
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
            >
              Ver en Pedidos
            </Link>
            <button
              onClick={() => setPedidoExitoso(null)}
              className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-semibold text-xs hover:bg-emerald-100"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Alerta de Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-600 hover:text-rose-800 font-bold text-xs"
          >
            Entendido
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda (Catálogo de Productos) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Barra de Filtros */}
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-stone-300 outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            {/* Selector de Categoría */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setCategoriaSeleccionada('todas')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  categoriaSeleccionada === 'todas'
                    ? 'bg-amber-700 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Todas
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoriaSeleccionada(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    categoriaSeleccionada === cat
                      ? 'bg-amber-700 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grilla de Productos */}
          {cargando ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-xs text-stone-500">
              Cargando catálogo de productos...
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-xs text-stone-500">
              No se encontraron productos disponibles para venta.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {productosFiltrados.map((prod) => {
                const agotado = prod.stock <= 0;
                const enTicket = itemsOrden.find((i) => i.producto.id === prod.id);

                return (
                  <div
                    key={prod.id}
                    className={`bg-white rounded-xl border transition-all flex flex-col justify-between overflow-hidden shadow-2xs ${
                      agotado
                        ? 'opacity-60 border-stone-200 bg-stone-50'
                        : 'border-stone-200 hover:border-amber-400 hover:shadow-xs'
                    }`}
                  >
                    {prod.imagenUrl ? (
                      <img
                        src={prod.imagenUrl}
                        alt={prod.nombre}
                        className="w-full h-28 object-cover bg-stone-100"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-28 bg-stone-100 flex items-center justify-center text-stone-300">
                        <Package className="w-8 h-8" />
                      </div>
                    )}

                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-semibold text-stone-600 truncate">
                            {prod.categoria || 'General'}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              prod.stock > 5
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : prod.stock > 0
                                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {prod.stock > 0 ? `${prod.stock} en stock` : 'Agotado'}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-stone-900 line-clamp-1 mb-1">
                          {prod.nombre}
                        </h3>
                      </div>

                      <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-amber-700">
                          ${Number(prod.precio).toFixed(2)}
                        </span>

                        <button
                          type="button"
                          disabled={agotado}
                          onClick={() => agregarAlTicket(prod)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                            agotado
                              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                              : enTicket
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                              : 'bg-stone-900 hover:bg-stone-800 text-white'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{enTicket ? `(${enTicket.cantidad})` : 'Agregar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha (Ticket de Venta / Comanda) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sticky top-20 flex flex-col h-[calc(100vh-6.5rem)]">
            {/* Cabecera del Ticket */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-stone-900">Comanda de Venta</h2>
                  <p className="text-[11px] text-stone-600">
                    {totalArticulos} {totalArticulos === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
              </div>

              {itemsOrden.length > 0 && (
                <button
                  type="button"
                  onClick={limpiarTicket}
                  className="text-[11px] text-stone-500 hover:text-rose-600 flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Vaciar
                </button>
              )}
            </div>

            {/* Datos del Cliente */}
            <div className="py-3 border-b border-stone-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                  Cliente:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    placeholder="Nombre o Mesa"
                    className="w-full px-2.5 py-1 rounded-lg border border-stone-300 text-xs outline-hidden focus:border-amber-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                  Teléfono:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={clienteTelefono}
                    onChange={(e) => setClienteTelefono(e.target.value)}
                    placeholder="7000-0000"
                    className="w-full px-2.5 py-1 rounded-lg border border-stone-300 text-xs outline-hidden focus:border-amber-600"
                  />
                </div>
              </div>
            </div>

            {/* Lista de Items del Ticket */}
            <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-1">
              {itemsOrden.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                  <ShoppingBag className="w-10 h-10 mb-2 stroke-1" />
                  <p className="text-xs font-medium">El ticket está vacío</p>
                  <p className="text-[11px] text-stone-400">
                    Haz clic en "Agregar" en cualquiera de los productos del catálogo.
                  </p>
                </div>
              ) : (
                itemsOrden.map(({ producto, cantidad }) => {
                  const subtotal = Number((Number(producto.precio) * cantidad).toFixed(2));
                  return (
                    <div
                      key={producto.id}
                      className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {producto.nombre}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          ${Number(producto.precio).toFixed(2)} c/u
                        </p>
                      </div>

                      {/* Controles de Cantidad */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(producto.id, cantidad - 1, producto.stock)}
                          className="w-6 h-6 rounded-md bg-white border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-5 text-center">{cantidad}</span>
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(producto.id, cantidad + 1, producto.stock)}
                          className="w-6 h-6 rounded-md bg-white border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Subtotal y Eliminar */}
                      <div className="text-right pl-2">
                        <p className="text-xs font-extrabold text-stone-900">
                          ${subtotal.toFixed(2)}
                        </p>
                        <button
                          type="button"
                          onClick={() => quitarDelTicket(producto.id)}
                          className="text-stone-400 hover:text-rose-600 text-[10px] inline-flex items-center"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pie del Ticket con Total y Botón de Venta */}
            <div className="pt-3 border-t border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-600">Total a Pagar</span>
                <span className="text-2xl font-black text-amber-700">
                  ${totalPrecio.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                disabled={itemsOrden.length === 0 || procesando}
                onClick={manejarRegistrarVenta}
                className="w-full py-3 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DollarSign className="w-4 h-4" />
                <span>
                  {procesando ? 'Confirmando venta...' : `Cobrar / Confirmar ($${totalPrecio.toFixed(2)})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
