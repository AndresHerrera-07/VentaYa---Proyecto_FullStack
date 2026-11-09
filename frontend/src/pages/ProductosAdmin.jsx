import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Sparkles,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

import { API_BASE } from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProductosAdmin() {
  const { token } = useAuth();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [mensajeAlerta, setMensajeAlerta] = useState(null);

  // Estados del Modal (Crear / Editar)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoActualId, setProductoActualId] = useState(null);

  // Formulario de Producto
  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: '',
    imagenUrl: ''
  });
  const [erroresForm, setErroresForm] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [tipoImagen, setTipoImagen] = useState('archivo'); // 'archivo' | 'url'
  const refInputArchivo = useRef(null);

  // Manejar selección y compresión de imagen local desde la computadora
  const manejarArchivoLocal = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      setErroresForm((prev) => ({
        ...prev,
        imagenUrl: 'El archivo seleccionado debe ser una imagen'
      }));
      return;
    }

    const lector = new FileReader();
    lector.onload = (evento) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar a máx 800px para mantenerla ligera (~70KB) y compatible con bases de datos
        const maxDim = 800;
        let ancho = img.width;
        let alto = img.height;
        if (ancho > maxDim || alto > maxDim) {
          if (ancho > alto) {
            alto = Math.round((alto * maxDim) / ancho);
            ancho = maxDim;
          } else {
            ancho = Math.round((ancho * maxDim) / alto);
            alto = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = ancho;
        canvas.height = alto;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, ancho, alto);
        const dataUrlOptimizada = canvas.toDataURL('image/jpeg', 0.85);
        setFormulario((prev) => ({ ...prev, imagenUrl: dataUrlOptimizada }));
      };
      img.src = evento.target.result;
    };
    lector.readAsDataURL(archivo);
  };

  // 1. Cargar productos desde el backend
  async function cargarProductos() {
    try {
      setCargando(true);
      const res = await fetch(`${API_BASE}/productos`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setProductos(data.datos || []);
      }
    } catch (err) {
      console.error('Error al cargar productos:', err);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  // Abrir modal para crear
  const abrirModalCrear = () => {
    setModoEdicion(false);
    setProductoActualId(null);
    setFormulario({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      categoria: '',
      imagenUrl: ''
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  // Abrir modal para editar
  const abrirModalEditar = (prod) => {
    setModoEdicion(true);
    setProductoActualId(prod.id);
    setFormulario({
      nombre: prod.nombre,
      descripcion: prod.descripcion || '',
      precio: prod.precio.toString(),
      stock: prod.stock.toString(),
      categoria: prod.categoria || '',
      imagenUrl: prod.imagenUrl || ''
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  // Validación local rápida antes de enviar al backend
  const validarFormularioLocal = () => {
    const err = {};
    if (!formulario.nombre.trim() || formulario.nombre.trim().length < 2) {
      err.nombre = 'El nombre debe tener al menos 2 caracteres';
    }
    const numPrecio = parseFloat(formulario.precio);
    if (isNaN(numPrecio) || numPrecio <= 0) {
      err.precio = 'El precio debe ser un número mayor a 0';
    }
    const numStock = parseInt(formulario.stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      err.stock = 'El stock debe ser un número entero mayor o igual a 0';
    }
    setErroresForm(err);
    return Object.keys(err).length === 0;
  };

  // Guardar (POST o PUT)
  const manejarGuardar = async (e) => {
    e.preventDefault();
    if (!validarFormularioLocal()) return;

    try {
      setGuardando(true);
      const url = modoEdicion
        ? `${API_BASE}/productos/${productoActualId}`
        : `${API_BASE}/productos`;

      const metodo = modoEdicion ? 'PUT' : 'POST';

      const payload = {
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim() || null,
        precio: parseFloat(formulario.precio),
        stock: parseInt(formulario.stock, 10),
        categoria: formulario.categoria.trim() || null,
        imagenUrl: formulario.imagenUrl.trim() || null
      };

      const res = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errores) {
          const mapa = {};
          data.errores.forEach((er) => {
            mapa[er.campo] = er.mensaje;
          });
          setErroresForm(mapa);
        } else {
          setErroresForm({ general: data.mensaje || 'Error al guardar' });
        }
        return;
      }

      setModalAbierto(false);
      setMensajeAlerta({
        tipo: 'exito',
        texto: modoEdicion
          ? 'Producto actualizado correctamente'
          : 'Producto creado y agregado al catálogo'
      });
      setTimeout(() => setMensajeAlerta(null), 4000);
      cargarProductos();
    } catch (err) {
      setErroresForm({ general: 'Error de conexión con el servidor' });
    } finally {
      setGuardando(false);
    }
  };

  // Desactivar producto (Borrado Lógico)
  const manejarDesactivar = async (id, nombre) => {
    if (!confirm(`¿Estás seguro de desactivar el producto "${nombre}" de tu catálogo público?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/productos/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.ok) {
        setMensajeAlerta({
          tipo: 'exito',
          texto: `El producto "${nombre}" fue desactivado.`
        });
        setTimeout(() => setMensajeAlerta(null), 4000);
        cargarProductos();
      }
    } catch (err) {
      console.error('Error al desactivar:', err);
    }
  };

  // Reactivar producto
  const manejarReactivar = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/productos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ activo: 1 })
      });
      if (res.ok) {
        cargarProductos();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtrado en la vista administrativa
  const productosFiltrados = productos.filter((p) => {
    const texto = busqueda.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(texto) ||
      (p.categoria && p.categoria.toLowerCase().includes(texto))
    );
  });

  // Métricas rápidas
  const totalActivos = productos.filter((p) => p.activo === 1).length;
  const totalAgotados = productos.filter((p) => p.activo === 1 && p.stock === 0).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Alerta de notificación flotante */}
      {mensajeAlerta && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-sm shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{mensajeAlerta.texto}</span>
          </div>
          <button onClick={() => setMensajeAlerta(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Encabezado del Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Gestión de Productos
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Administra los precios, fotografías y existencias de tu comercio local.
          </p>
        </div>

        <button
          onClick={abrirModalCrear}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </button>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-stone-200">
          <span className="text-xs text-stone-500 font-medium block">Total en Catálogo</span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">{productos.length}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-stone-200">
          <span className="text-xs text-stone-500 font-medium block">Visibles al Público</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{totalActivos}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-stone-200">
          <span className="text-xs text-stone-500 font-medium block">Sin Existencias (Agotados)</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{totalAgotados}</span>
        </div>
      </div>

      {/* Buscador dentro de la tabla */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between gap-4 bg-stone-50/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar por nombre o categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white focus:outline-hidden focus:border-amber-600"
            />
          </div>
          <span className="text-xs text-stone-500 hidden sm:block">
            {productosFiltrados.length} registros
          </span>
        </div>

        {/* Tabla Responsiva de Productos */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-100/70 text-stone-600 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="px-5 py-3">Producto</th>
                <th className="px-5 py-3">Categoría</th>
                <th className="px-5 py-3">Precio</th>
                <th className="px-5 py-3">Inventario (Stock)</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {cargando ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-stone-400">
                    Cargando inventario...
                  </td>
                </tr>
              ) : productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-stone-400">
                    No hay productos que coincidan.
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((prod) => (
                  <tr key={prod.id} className="hover:bg-stone-50/80 transition-colors">
                    {/* Nombre y Miniatura */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {prod.imagenUrl ? (
                          <img
                            src={prod.imagenUrl}
                            alt={prod.nombre}
                            className="w-10 h-10 rounded-lg object-cover border border-stone-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-stone-900 block">{prod.nombre}</span>
                          <span className="text-[11px] text-stone-600 line-clamp-1 max-w-xs">
                            {prod.descripcion || 'Sin descripción'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="px-5 py-3.5">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px]">
                        {prod.categoria || 'General'}
                      </span>
                    </td>

                    {/* Precio */}
                    <td className="px-5 py-3.5 font-bold text-stone-900">
                      ${Number(prod.precio).toFixed(2)}
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-3.5">
                      {prod.stock === 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                          <AlertTriangle className="w-3.5 h-3.5" /> 0 unidades
                        </span>
                      ) : (
                        <span className="text-stone-800 font-medium">{prod.stock} unidades</span>
                      )}
                    </td>

                    {/* Estado Activo / Inactivo */}
                    <td className="px-5 py-3.5">
                      {prod.activo === 1 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                          <XCircle className="w-3 h-3 text-stone-400" /> Desactivado
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => abrirModalEditar(prod)}
                          title="Editar producto"
                          className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {prod.activo === 1 ? (
                          <button
                            onClick={() => manejarDesactivar(prod.id, prod.nombre)}
                            title="Desactivar del catálogo"
                            className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => manejarReactivar(prod.id)}
                            title="Reactivar producto"
                            className="text-[11px] font-semibold text-emerald-700 hover:underline px-1"
                          >
                            Reactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Crear / Editar Producto */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-lg w-full p-6 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <h2 className="text-lg font-bold text-stone-900">
                {modoEdicion ? 'Editar Producto' : 'Nuevo Producto para el Catálogo'}
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {erroresForm.general && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {erroresForm.general}
              </div>
            )}

            <form onSubmit={manejarGuardar} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nombre del producto *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Pupusas Revueltas"
                  value={formulario.nombre}
                  onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-hidden"
                />
                {erroresForm.nombre && (
                  <p className="text-rose-600 text-[11px] mt-0.5">{erroresForm.nombre}</p>
                )}
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Categoría</label>
                <input
                  type="text"
                  placeholder="Ej. Comida Típica, Bebidas, Panadería..."
                  value={formulario.categoria}
                  onChange={(e) => setFormulario({ ...formulario, categoria: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-hidden"
                />
              </div>

              {/* Precio y Stock en 2 columnas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Precio ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="3.00"
                    value={formulario.precio}
                    onChange={(e) => setFormulario({ ...formulario, precio: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-hidden"
                  />
                  {erroresForm.precio && (
                    <p className="text-rose-600 text-[11px] mt-0.5">{erroresForm.precio}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Existencias (Stock) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="50"
                    value={formulario.stock}
                    onChange={(e) => setFormulario({ ...formulario, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-hidden"
                  />
                  {erroresForm.stock && (
                    <p className="text-rose-600 text-[11px] mt-0.5">{erroresForm.stock}</p>
                  )}
                </div>
              </div>

              {/* Fotografía del Producto (Local o Enlace Web) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-stone-700">
                    Fotografía del producto
                  </label>
                  <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setTipoImagen('archivo')}
                      className={`px-2 py-0.5 rounded-md transition-colors ${
                        tipoImagen === 'archivo'
                          ? 'bg-white font-semibold text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Subir archivo
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoImagen('url')}
                      className={`px-2 py-0.5 rounded-md transition-colors ${
                        tipoImagen === 'url'
                          ? 'bg-white font-semibold text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Enlace URL
                    </button>
                  </div>
                </div>

                {tipoImagen === 'archivo' ? (
                  <div>
                    <input
                      ref={refInputArchivo}
                      type="file"
                      accept="image/*"
                      onChange={manejarArchivoLocal}
                      className="hidden"
                    />
                    <div
                      onClick={() => refInputArchivo.current?.click()}
                      className="border-2 border-dashed border-stone-300 hover:border-amber-600 rounded-xl p-4 text-center cursor-pointer bg-stone-50/50 hover:bg-amber-50/20 transition-colors"
                    >
                      {formulario.imagenUrl ? (
                        <div className="flex items-center justify-center gap-3">
                          <img
                            src={formulario.imagenUrl}
                            alt="Vista previa"
                            className="w-14 h-14 object-cover rounded-lg border border-stone-200 shadow-xs"
                          />
                          <div className="text-left">
                            <span className="text-xs font-semibold text-stone-900 block">
                              Imagen seleccionada
                            </span>
                            <span className="text-[11px] text-stone-500 block">
                              Haz clic para cambiarla
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-stone-500">
                          <Upload className="w-6 h-6 text-amber-700 mb-1" />
                          <span className="text-xs font-semibold text-stone-800">
                            Haz clic para elegir una foto de tu computadora
                          </span>
                          <span className="text-[11px] text-stone-400 mt-0.5">
                            PNG, JPG o WEBP (se optimiza automáticamente)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... o /productos/foto.jpg"
                      value={formulario.imagenUrl}
                      onChange={(e) => setFormulario({ ...formulario, imagenUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-hidden"
                    />
                  </div>
                )}

                {formulario.imagenUrl && (
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Foto lista para guardar
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormulario({ ...formulario, imagenUrl: '' })}
                      className="text-[11px] text-rose-600 hover:underline"
                    >
                      Quitar imagen
                    </button>
                  </div>
                )}
                {erroresForm.imagenUrl && (
                  <p className="text-rose-600 text-[11px] mt-0.5">{erroresForm.imagenUrl}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Descripción</label>
                <textarea
                  rows="3"
                  placeholder="Detalles sobre ingredientes, tamaño o presentación..."
                  value={formulario.descripcion}
                  onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-hidden"
                ></textarea>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-medium hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : modoEdicion ? 'Actualizar' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
