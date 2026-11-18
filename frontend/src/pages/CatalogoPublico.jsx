import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Phone,
  Store,
  Tag,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Sparkles,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  MessageCircle,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { API_BASE } from '../config/api.js';
import { useCarrito } from '../context/CarritoContext.jsx';

export default function CatalogoPublico() {
  const { slug } = useParams();
  // Si no hay slug en la URL (ej. acceso a la raíz "/"), usar la tienda principal por defecto
  const slugTienda = slug || 'antojitos-santa-tecla';

  // Integración con el Contexto del Carrito (HU-07)
  const {
    items: itemsCarrito,
    agregarAlCarrito,
    actualizarCantidad,
    quitarDelCarrito,
    vaciarCarrito,
    totalArticulos,
    totalPrecio
  } = useCarrito();

  // Estados de datos
  const [tienda, setTienda] = useState(null);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Estados de control de búsqueda y filtros
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');

  // Estados de interfaz y modales
  const [cargandoTienda, setCargandoTienda] = useState(true);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [errorTienda, setErrorTienda] = useState(null);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [checkoutAbierto, setCheckoutAbierto] = useState(false);
  const [idProductoReciente, setIdProductoReciente] = useState(null);

  // Estados para el formulario de Checkout Express (HU-08)
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [erroresCheckout, setErroresCheckout] = useState({});
  const [enviandoPedido, setEnviandoPedido] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);

  // 1. Cargar información de la tienda y sus categorías al montar o cambiar de slug
  useEffect(() => {
    async function cargarDatosIniciales() {
      try {
        setCargandoTienda(true);
        setErrorTienda(null);

        // Consultar tienda por slug
        const resTienda = await fetch(`${API_BASE}/tiendas/${slugTienda}`);
        if (!resTienda.ok) {
          if (resTienda.status === 404) {
            throw new Error(`La tienda "${slugTienda}" no fue encontrada.`);
          }
          throw new Error('No se pudo conectar con el servidor.');
        }

        const dataTienda = await resTienda.json();
        setTienda(dataTienda.datos);

        // Consultar categorías de la tienda
        const resCategorias = await fetch(`${API_BASE}/tiendas/${slugTienda}/categorias`);
        if (resCategorias.ok) {
          const dataCat = await resCategorias.json();
          setCategorias(dataCat.datos || []);
        }
      } catch (err) {
        setErrorTienda(err.message);
      } finally {
        setCargandoTienda(false);
      }
    }

    cargarDatosIniciales();
  }, [slugTienda]);

  // 2. Cargar productos según búsqueda y categoría seleccionada
  useEffect(() => {
    if (!tienda) return;

    const controlador = new AbortController();

    async function cargarProductos() {
      try {
        setCargandoProductos(true);

        const params = new URLSearchParams();
        if (busqueda.trim()) {
          params.append('busqueda', busqueda.trim());
        }
        if (categoriaSeleccionada && categoriaSeleccionada !== 'todas') {
          params.append('categoria', categoriaSeleccionada);
        }

        const url = `${API_BASE}/tiendas/${slugTienda}/productos?${params.toString()}`;
        const res = await fetch(url, { signal: controlador.signal });

        if (res.ok) {
          const data = await res.json();
          setProductos(data.datos || []);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error cargando productos:', err);
        }
      } finally {
        setCargandoProductos(false);
      }
    }

    const temporizador = setTimeout(() => {
      cargarProductos();
    }, 200);

    return () => {
      clearTimeout(temporizador);
      controlador.abort();
    };
  }, [slugTienda, tienda, busqueda, categoriaSeleccionada]);

  // Agregar al carrito con feedback visual
  const manejarAgregarAlCarrito = (producto) => {
    const agregado = agregarAlCarrito(producto, 1);
    if (agregado) {
      setIdProductoReciente(producto.id);
      setTimeout(() => setIdProductoReciente(null), 1500);
    }
  };

  // Validar y enviar Checkout Express (HU-08)
  const manejarConfirmarPedido = async (e) => {
    e.preventDefault();
    const errores = {};

    if (!clienteNombre.trim() || clienteNombre.trim().length < 2) {
      errores.nombre = 'Ingresa tu nombre completo (mínimo 2 caracteres)';
    }

    const telefonoLimpio = clienteTelefono.replace(/\D/g, '');
    if (!telefonoLimpio || telefonoLimpio.length < 7) {
      errores.telefono = 'Ingresa un número telefónico válido (mínimo 7 dígitos)';
    }

    if (itemsCarrito.length === 0) {
      errores.general = 'El carrito está vacío';
    }

    if (Object.keys(errores).length > 0) {
      setErroresCheckout(errores);
      return;
    }

    try {
      setEnviandoPedido(true);
      setErroresCheckout({});

      const payload = {
        clienteNombre: clienteNombre.trim(),
        clienteTelefono: clienteTelefono.trim(),
        slug: slugTienda,
        items: itemsCarrito.map((item) => ({
          productoId: item.producto.id,
          cantidad: item.cantidad
        }))
      };

      const res = await fetch(`${API_BASE}/pedidos/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setErroresCheckout({
          general: data.mensaje || 'Ocurrió un error al procesar el pedido'
        });
        return;
      }

      // Éxito: guardar datos del pedido confirmado y vaciar el carrito
      setPedidoConfirmado(data.datos);
      vaciarCarrito();
    } catch (err) {
      setErroresCheckout({ general: 'Error de conexión con el servidor. Intenta de nuevo.' });
    } finally {
      setEnviandoPedido(false);
    }
  };

  // Generar enlace directo a WhatsApp para notificar la orden
  const obtenerEnlaceWhatsApp = () => {
    if (!tienda?.telefono || !pedidoConfirmado) return '#';
    const numero = tienda.telefono.replace(/\D/g, '');
    const mensaje = `¡Hola ${tienda.nombre}! Acabo de confirmar mi pedido #${pedidoConfirmado.pedidoId} en VendeYa por un valor de $${Number(pedidoConfirmado.total).toFixed(2)}. Mi nombre es ${pedidoConfirmado.clienteNombre}. ¿Me podrían indicar los pasos para la entrega?`;
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  };

  // Vista de carga inicial
  if (cargandoTienda) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-amber-600 border-t-transparent mb-4"></div>
        <p className="text-stone-500 text-sm">Cargando catálogo del comercio...</p>
      </div>
    );
  }

  // Vista de error: tienda no encontrada (404)
  if (errorTienda) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Comercio no disponible</h1>
        <p className="text-stone-600 text-sm mb-6">{errorTienda}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative transition-colors duration-200">
      {/* 1. Encabezado del Comercio */}
      <section className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {tienda.logoUrl ? (
                <img
                  src={tienda.logoUrl}
                  alt={tienda.nombre}
                  className="w-20 h-20 rounded-2xl object-cover border border-stone-200 dark:border-stone-700 shadow-xs"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-amber-700 dark:bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <Store className="w-9 h-9" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight">
                    {tienda.nombre}
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                    <CheckCircle2 className="w-3 h-3" /> Verificado
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-stone-500 dark:text-stone-400">
                  {tienda.direccion && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      {tienda.direccion}
                    </span>
                  )}
                  {tienda.telefono && (
                    <a
                      href={`tel:${tienda.telefono}`}
                      className="flex items-center gap-1 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      {tienda.telefono}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Botón para ver Carrito desde el banner */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCarritoAbierto(true)}
                className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Ver Mi Carrito</span>
                {totalArticulos > 0 && (
                  <span className="ml-1 bg-white text-amber-900 font-bold px-2 py-0.5 rounded-full text-[11px]">
                    {totalArticulos}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Barra de Filtros y Buscador */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Campo de búsqueda reactivo */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all placeholder:text-stone-400 dark:placeholder:text-stone-500"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs px-1"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Contador de resultados */}
          <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5 self-end md:self-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>
              {cargandoProductos
                ? 'Buscando...'
                : `${productos.length} producto${productos.length === 1 ? '' : 's'} disponible${productos.length === 1 ? '' : 's'}`}
            </span>
          </div>
        </div>

        {/* Chips de Categorías */}
        {categorias.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-2 scrollbar-none">
            <button
              onClick={() => setCategoriaSeleccionada('todas')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                categoriaSeleccionada === 'todas'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
              }`}
            >
              Todas las categorías
            </button>
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  categoriaSeleccionada === cat
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 3. Catálogo de Productos */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {cargandoProductos ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-stone-200 animate-pulse">
                <div className="h-44 bg-stone-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-stone-200 rounded-sm w-3/4 mb-2"></div>
                <div className="h-3 bg-stone-200 rounded-sm w-1/2 mb-4"></div>
                <div className="h-6 bg-stone-200 rounded-sm w-1/4"></div>
              </div>
            ))}
          </div>
        ) : productos.length === 0 ? (
          /* Estado Vacío */
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">No se encontraron productos</h3>
            <p className="text-xs text-stone-500 mb-4">
              {busqueda
                ? `No hay coincidencias para "${busqueda}". Prueba con otra palabra clave.`
                : 'Esta categoría aún no tiene productos disponibles.'}
            </p>
            {(busqueda || categoriaSeleccionada !== 'todas') && (
              <button
                onClick={() => {
                  setBusqueda('');
                  setCategoriaSeleccionada('todas');
                }}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800"
              >
                Restablecer todos los filtros
              </button>
            )}
          </div>
        ) : (
          /* Cuadrícula de Tarjetas de Producto */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.map((prod) => {
              const estaAgotado = prod.stock <= 0;
              const recienAgregado = idProductoReciente === prod.id;

              return (
                <div
                  key={prod.id}
                  className={`bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col justify-between transition-all duration-200 shadow-xs ${
                    estaAgotado
                      ? 'opacity-70 bg-stone-50/80 dark:bg-stone-900/60'
                      : 'hover:shadow-md hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  <div>
                    {/* Imagen del producto */}
                    <div className="relative h-48 bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      {prod.imagenUrl ? (
                        <img
                          src={prod.imagenUrl}
                          alt={prod.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                          <Tag className="w-8 h-8 mb-1" />
                          <span className="text-[11px]">Sin fotografía</span>
                        </div>
                      )}

                      {/* Chip de categoría flotante */}
                      {prod.categoria && (
                        <span className="absolute top-3 left-3 text-[11px] font-medium px-2.5 py-1 rounded-md bg-stone-900/80 backdrop-blur-xs text-white">
                          {prod.categoria}
                        </span>
                      )}

                      {/* Indicador de stock flotante */}
                      <div className="absolute top-3 right-3">
                        {estaAgotado ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-rose-600 text-white shadow-xs">
                            <XCircle className="w-3 h-3" /> Agotado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-emerald-700/90 backdrop-blur-xs text-white shadow-xs">
                            <CheckCircle2 className="w-3 h-3" /> En stock ({prod.stock})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Información descriptiva — Nombre con letra más grande y alto contraste */}
                    <div className="p-5">
                      <h3 className="font-black text-stone-900 dark:text-stone-50 text-lg sm:text-xl leading-tight mb-2 tracking-tight">
                        {prod.nombre}
                      </h3>
                      {prod.descripcion && (
                        <p className="text-stone-500 dark:text-stone-400 text-xs line-clamp-2 leading-relaxed mb-4">
                          {prod.descripcion}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pie de tarjeta con precio en dólares y agregar al carrito */}
                  <div className="px-5 pb-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block uppercase font-medium">Precio</span>
                      <span className="text-xl font-black text-stone-900 dark:text-stone-50 tracking-tight">
                        ${Number(prod.precio).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => manejarAgregarAlCarrito(prod)}
                      disabled={estaAgotado}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        estaAgotado
                          ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                          : recienAgregado
                          ? 'bg-emerald-600 text-white shadow-xs scale-105'
                          : 'bg-amber-700 hover:bg-amber-800 text-white shadow-xs active:scale-95'
                      }`}
                    >
                      {estaAgotado ? (
                        'Agotado'
                      ) : recienAgregado ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> ¡Agregado!
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" /> Agregar al carrito
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Botón Flotante de Carrito en la esquina inferior */}
      {totalArticulos > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-bounce">
          <button
            onClick={() => setCarritoAbierto(true)}
            className="flex items-center gap-3 px-5 py-3.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-white text-amber-900 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {totalArticulos}
              </span>
            </div>
            <div className="text-left text-xs">
              <span className="block opacity-90 text-[10px] uppercase tracking-wider">Ver pedido</span>
              <span className="text-sm font-black">${totalPrecio.toFixed(2)}</span>
            </div>
          </button>
        </div>
      )}

      {/* 4. Panel Desplegable (Slide-over) del Carrito de Compras (HU-07) */}
      {carritoAbierto && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Fondo difuminado */}
          <div
            onClick={() => setCarritoAbierto(false)}
            className="absolute inset-0 bg-stone-900/60 dark:bg-black/75 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-stone-900 shadow-2xl flex flex-col justify-between transition-colors">
              {/* Encabezado del carrito */}
              <div className="px-6 py-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-800/50">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-700 dark:text-amber-500" />
                  <h2 className="text-base font-bold text-stone-900 dark:text-stone-50">Tu Carrito de Compras</h2>
                  <span className="text-xs bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-semibold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                    {totalArticulos} item{totalArticulos === 1 ? '' : 's'}
                  </span>
                </div>
                <button
                  onClick={() => setCarritoAbierto(false)}
                  className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lista de productos en el carrito */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {itemsCarrito.length === 0 ? (
                  <div className="text-center py-16 text-stone-400 dark:text-stone-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 stroke-1" />
                    <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">Tu carrito está vacío</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Agrega productos del catálogo para comenzar tu pedido.
                    </p>
                  </div>
                ) : (
                  itemsCarrito.map((item) => (
                    <div
                      key={item.producto.id}
                      className="flex items-center gap-4 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 shadow-xs"
                    >
                      {item.producto.imagenUrl ? (
                        <img
                          src={item.producto.imagenUrl}
                          alt={item.producto.nombre}
                          className="w-16 h-16 rounded-lg object-cover border border-stone-200 dark:border-stone-700"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center">
                          <Tag className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                          {item.producto.nombre}
                        </h4>
                        <span className="text-xs text-stone-500 dark:text-stone-400">
                          ${Number(item.producto.precio).toFixed(2)} c/u
                        </span>

                        {/* Modificadores de cantidad */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                            className="w-6 h-6 rounded-md bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 flex items-center justify-center text-xs font-bold transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-stone-800 dark:text-stone-200 w-6 text-center">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                            disabled={item.cantidad >= item.producto.stock}
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                              item.cantidad >= item.producto.stock
                                ? 'bg-stone-100 dark:bg-stone-800 text-stone-300 dark:text-stone-600 cursor-not-allowed'
                                : 'bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200'
                            }`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal y eliminar */}
                      <div className="text-right flex flex-col justify-between items-end h-16">
                        <button
                          onClick={() => quitarDelCarrito(item.producto.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors"
                          title="Quitar del carrito"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                          ${(Number(item.producto.precio) * item.cantidad).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pie de carrito y botón de Checkout */}
              {itemsCarrito.length > 0 && (
                <div className="border-t border-stone-200 dark:border-stone-800 p-6 bg-stone-50 dark:bg-stone-900 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-stone-600 dark:text-stone-400 font-medium">Total a pagar</span>
                    <span className="text-2xl font-black text-stone-900 dark:text-stone-50">
                      ${totalPrecio.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setCarritoAbierto(false);
                      setCheckoutAbierto(true);
                    }}
                    className="w-full py-3.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Proceder al Checkout Express</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={vaciarCarrito}
                    className="w-full text-center text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                  >
                    Vaciar todo el carrito
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal de Checkout Express (HU-08) */}
      {checkoutAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8 transition-colors">
            <button
              onClick={() => {
                setCheckoutAbierto(false);
                setPedidoConfirmado(null);
              }}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-5 h-5" />
            </button>

            {pedidoConfirmado ? (
              /* Vista de Éxito tras confirmación del pedido */
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-stone-900 dark:text-stone-50 mb-1">¡Pedido Registrado con Éxito!</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
                  Orden #{pedidoConfirmado.pedidoId} asignada al comercio {tienda.nombre}
                </p>

                <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl p-4 border border-stone-200 dark:border-stone-700 text-left mb-6 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-500 dark:text-stone-400">Cliente:</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{pedidoConfirmado.clienteNombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 dark:text-stone-400">Teléfono:</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{pedidoConfirmado.clienteTelefono}</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-200 dark:border-stone-700 pt-2 font-bold text-sm">
                    <span className="text-stone-800 dark:text-stone-200">Total a Pagar:</span>
                    <span className="text-amber-800 dark:text-amber-400 font-black">${Number(pedidoConfirmado.total).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {tienda.telefono && (
                    <a
                      href={obtenerEnlaceWhatsApp()}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Enviar confirmación al WhatsApp del Comercio
                    </a>
                  )}

                  <button
                    onClick={() => {
                      setCheckoutAbierto(false);
                      setPedidoConfirmado(null);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-semibold transition-colors"
                  >
                    Seguir explorando el catálogo
                  </button>
                </div>
              </div>
            ) : (
              /* Formulario de Checkout Express sin registro */
              <div>
                <div className="mb-6">
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block mb-1">
                    Checkout Express
                  </span>
                  <h3 className="text-xl font-black text-stone-900 dark:text-stone-50">Completa tus datos de entrega</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    No necesitas registrarte. Solo necesitamos tu contacto para coordinar la entrega.
                  </p>
                </div>

                {erroresCheckout.general && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{erroresCheckout.general}</span>
                  </div>
                )}

                <form onSubmit={manejarConfirmarPedido} className="space-y-4">
                  {/* Nombre completo */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. María Hernández"
                      value={clienteNombre}
                      onChange={(e) => setClienteNombre(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-hidden"
                    />
                    {erroresCheckout.nombre && (
                      <p className="text-rose-600 dark:text-rose-400 text-[11px] mt-1">{erroresCheckout.nombre}</p>
                    )}
                  </div>

                  {/* Teléfono / WhatsApp */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      placeholder="Ej. 7890-1234"
                      value={clienteTelefono}
                      onChange={(e) => setClienteTelefono(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-hidden"
                    />
                    {erroresCheckout.telefono && (
                      <p className="text-rose-600 dark:text-rose-400 text-[11px] mt-1">{erroresCheckout.telefono}</p>
                    )}
                  </div>

                  {/* Resumen del Pedido */}
                  <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl p-4 border border-stone-200 dark:border-stone-700 text-xs space-y-1.5 mt-4">
                    <span className="font-bold text-stone-800 dark:text-stone-200 block mb-2">Resumen ({totalArticulos} artículos)</span>
                    {itemsCarrito.map((it) => (
                      <div key={it.producto.id} className="flex justify-between text-stone-600 dark:text-stone-400">
                        <span>
                          {it.cantidad}x {it.producto.nombre}
                        </span>
                        <span>${(Number(it.producto.precio) * it.cantidad).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-stone-200 dark:border-stone-700 pt-2 flex justify-between font-black text-sm text-stone-900 dark:text-stone-100">
                      <span>Total final</span>
                      <span className="text-amber-800 dark:text-amber-400">${totalPrecio.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={enviandoPedido}
                    className="w-full py-3.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                  >
                    {enviandoPedido ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Confirmando transacción atómica...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirmar Pedido (${totalPrecio.toFixed(2)})</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
