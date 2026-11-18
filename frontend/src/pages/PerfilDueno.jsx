import { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Key,
  Save,
  CheckCircle2,
  AlertCircle,
  Store,
  Mail,
  Eye,
  EyeOff,
  MapPin,
  Phone,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Trash2,
  MessageCircle
} from 'lucide-react';
import { API_BASE } from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function PerfilDueno() {
  const { usuario, token, actualizarUsuario } = useAuth();

  // Estados del formulario de perfil y negocio
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [correo, setCorreo] = useState(usuario?.correo || '');
  const [negocioNombre, setNegocioNombre] = useState(usuario?.negocioNombre || '');
  const [direccion, setDireccion] = useState(usuario?.negocioDireccion || '');
  const [telefono, setTelefono] = useState(usuario?.negocioTelefono || '');
  const [logoUrl, setLogoUrl] = useState(usuario?.negocioLogoUrl || '');

  // Modalidad de subida de imagen para el logo
  const [tipoSubidaLogo, setTipoSubidaLogo] = useState('archivo'); // 'archivo' | 'url'

  // Estados para cambio de contraseña
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNuevo, setPasswordNuevo] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  // Visibilidad de contraseñas
  const [verActual, setVerActual] = useState(false);
  const [verNuevo, setVerNuevo] = useState(false);

  // Estados de control
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [mensajeError, setMensajeError] = useState(null);

  // Cargar datos frescos del perfil y negocio desde la API al montar
  useEffect(() => {
    async function cargarDatosPerfil() {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/auth/perfil`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const p = data.datos;
          if (p) {
            setNombre(p.nombre || '');
            setCorreo(p.correo || '');
            setNegocioNombre(p.negocioNombre || '');
            setTelefono(p.negocioTelefono || '');
            setDireccion(p.negocioDireccion || '');
            setLogoUrl(p.negocioLogoUrl || '');

            actualizarUsuario({
              nombre: p.nombre,
              correo: p.correo,
              negocioNombre: p.negocioNombre,
              negocioTelefono: p.negocioTelefono,
              negocioDireccion: p.negocioDireccion,
              negocioLogoUrl: p.negocioLogoUrl
            });
          }
        }
      } catch (err) {
        console.error('Error al sincronizar datos del negocio:', err);
      }
    }
    cargarDatosPerfil();
  }, [token]);

  // Procesar archivo local desde la PC (HTML5 Canvas -> Base64 JPEG ligera)
  const procesarArchivoLogo = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      setMensajeError('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
      return;
    }

    const lector = new FileReader();
    lector.onload = (evento) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar a máx 800px para almacenamiento ligero en BD
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
        setLogoUrl(dataUrlOptimizada);
        setMensajeError(null);
      };
      img.src = evento.target.result;
    };
    lector.readAsDataURL(archivo);
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    setMensajeExito(null);
    setMensajeError(null);

    // Validaciones de cliente
    if (!nombre.trim() || nombre.trim().length < 2) {
      setMensajeError('El nombre debe contener al menos 2 caracteres.');
      return;
    }

    if (!correo.trim() || !correo.includes('@')) {
      setMensajeError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (!negocioNombre.trim() || negocioNombre.trim().length < 2) {
      setMensajeError('El nombre o título del negocio debe contener al menos 2 caracteres.');
      return;
    }

    if (passwordNuevo) {
      if (!passwordActual) {
        setMensajeError('Debes ingresar tu contraseña actual para establecer una nueva.');
        return;
      }
      if (passwordNuevo.length < 6) {
        setMensajeError('La nueva contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (passwordNuevo !== confirmarPassword) {
        setMensajeError('La confirmación de la contraseña no coincide con la nueva contraseña.');
        return;
      }
    }

    try {
      setGuardando(true);

      // 1. Actualizar datos comerciales del negocio (Nombre, Dirección, WhatsApp/Teléfono, Logo)
      const resNegocio = await fetch(`${API_BASE}/auth/negocio`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: negocioNombre.trim(),
          direccion: direccion.trim() || null,
          telefono: telefono.trim() || null,
          logoUrl: logoUrl.trim() || null
        })
      });

      const dataNegocio = await resNegocio.json();
      if (!resNegocio.ok) {
        throw new Error(dataNegocio.mensaje || 'Error al actualizar la información del negocio.');
      }

      // 2. Actualizar perfil personal (Nombre, Correo y Contraseña opcional)
      const payloadPerfil = {
        nombre: nombre.trim(),
        correo: correo.trim().toLowerCase()
      };

      if (passwordNuevo) {
        payloadPerfil.passwordActual = passwordActual;
        payloadPerfil.passwordNuevo = passwordNuevo;
      }

      const resPerfil = await fetch(`${API_BASE}/auth/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payloadPerfil)
      });

      const dataPerfil = await resPerfil.json();

      if (!resPerfil.ok) {
        throw new Error(dataPerfil.mensaje || 'Error al actualizar el perfil.');
      }

      // 3. Sincronizar en AuthContext para que Navbar y demás páginas reflejen los cambios inmediatamente
      actualizarUsuario({
        nombre: dataPerfil.datos.nombre,
        correo: dataPerfil.datos.correo,
        negocioNombre: dataNegocio.datos.nombre,
        negocioDireccion: dataNegocio.datos.direccion,
        negocioTelefono: dataNegocio.datos.telefono,
        negocioLogoUrl: dataNegocio.datos.logoUrl
      });

      // Limpiar campos de contraseña
      setPasswordActual('');
      setPasswordNuevo('');
      setConfirmarPassword('');

      setMensajeExito('¡Datos del negocio, dirección, WhatsApp, foto y credenciales actualizados con éxito!');
      setTimeout(() => setMensajeExito(null), 5000);
    } catch (err) {
      setMensajeError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full transition-colors duration-200">
      {/* Encabezado */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Acceso Total - Dueño
          </span>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50 tracking-tight">
          Configuración del Negocio y Perfil
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Personaliza el título comercial, logotipo, dirección, número de WhatsApp de pedidos y tus credenciales de acceso.
        </p>
      </div>

      {/* Alerta de Éxito */}
      {mensajeExito && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium">{mensajeExito}</span>
        </div>
      )}

      {/* Alerta de Error */}
      {mensajeError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 text-xs flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span className="font-medium">{mensajeError}</span>
        </div>
      )}

      <form onSubmit={manejarGuardar} className="space-y-6">
        {/* Tarjeta 1: Información Comercial del Negocio */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs p-6 transition-colors">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 mb-4">
            <Store className="w-4 h-4 text-amber-700 dark:text-amber-500" /> Datos Comerciales de la Tienda
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campo: Título o Nombre del Negocio */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Título del Negocio (Visible al Público) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={negocioNombre}
                  onChange={(e) => setNegocioNombre(e.target.value)}
                  required
                  placeholder="Ej. Antojitos Típicos Santa Tecla"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 dark:focus:border-amber-500"
                />
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                Nombre que aparece en la barra superior, catálogo público y tickets de venta.
              </p>
            </div>

            {/* Campo: Dirección Física del Negocio */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" /> Dirección Física del Local
              </label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ej. 4a Calle Poniente #2-3, Santa Tecla, La Libertad"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 dark:focus:border-amber-500"
              />
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                Se muestra a los clientes en el encabezado del catálogo público.
              </p>
            </div>

            {/* Campo: Número de WhatsApp / Teléfono */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Número de WhatsApp para Pedidos
              </label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. +503 7123-4567 o 71234567"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 dark:focus:border-amber-500"
              />
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                Los clientes enviarán sus órdenes confirmadas por WhatsApp directamente a este número.
              </p>
            </div>

            {/* Selector de Foto / Logotipo del Negocio */}
            <div className="md:col-span-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-600" /> Foto o Logotipo del Negocio
              </label>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* Previsualización del Logo */}
                <div className="relative group shrink-0">
                  {logoUrl ? (
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-500/30 dark:border-amber-500/40 shadow-xs">
                      <img
                        src={logoUrl}
                        alt="Logo del negocio"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        title="Quitar foto"
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-stone-100 dark:bg-stone-800 border-2 border-dashed border-stone-300 dark:border-stone-700 flex flex-col items-center justify-center text-stone-400 text-center p-2">
                      <Store className="w-7 h-7 mb-1 text-stone-400" />
                      <span className="text-[10px]">Sin foto</span>
                    </div>
                  )}
                </div>

                {/* Opciones de carga: Archivo local o URL */}
                <div className="flex-1 w-full space-y-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTipoSubidaLogo('archivo')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        tipoSubidaLogo === 'archivo'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" /> Subir desde mi PC
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoSubidaLogo('url')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        tipoSubidaLogo === 'url'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" /> Enlace URL de imagen web
                    </button>
                  </div>

                  {tipoSubidaLogo === 'archivo' ? (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={procesarArchivoLogo}
                        className="block w-full text-xs text-stone-500 dark:text-stone-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 dark:file:bg-amber-950/60 file:text-amber-800 dark:file:text-amber-200 hover:file:bg-amber-100 cursor-pointer"
                      />
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                        Sube una foto desde tu computadora. Se optimizará automáticamente para cargar al instante.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://ejemplo.com/mi-negocio.jpg"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                      />
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                        Pega el enlace directo a una imagen alojada en la web.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Cuenta Personal del Propietario */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs p-6 transition-colors">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-amber-700 dark:text-amber-500" /> Datos Personales del Propietario
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campo: Nombre del Dueño */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Nombre del Dueño *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Ej. Carmen Gómez"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 dark:focus:border-amber-500"
              />
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                Tu nombre visible en la barra y en los registros del sistema.
              </p>
            </div>

            {/* Campo: Correo Electrónico (Editable) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400" /> Correo Electrónico (Inicio de Sesión) *
              </label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                placeholder="dueño@negocio.sv"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 dark:focus:border-amber-500"
              />
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                Correo utilizado para ingresar a la plataforma.
              </p>
            </div>
          </div>
        </div>

        {/* Tarjeta 3: Cambio de Contraseña */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs p-6 transition-colors">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 mb-1">
            <Key className="w-4 h-4 text-amber-700 dark:text-amber-500" /> Cambiar Contraseña de Acceso
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
            Si deseas actualizar tu clave, completa los siguientes campos. Si deseas conservarla, déjalos vacíos.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Contraseña Actual */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Contraseña Actual
              </label>
              <div className="relative">
                <input
                  type={verActual ? 'text' : 'password'}
                  value={passwordActual}
                  onChange={(e) => setPasswordActual(e.target.value)}
                  placeholder="Tu contraseña actual"
                  className="w-full px-3.5 py-2 pr-9 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 dark:focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setVerActual(!verActual)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
                >
                  {verActual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Nueva Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={verNuevo ? 'text' : 'password'}
                  value={passwordNuevo}
                  onChange={(e) => setPasswordNuevo(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2 pr-9 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 dark:focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setVerNuevo(!verNuevo)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
                >
                  {verNuevo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Confirmar Nueva Contraseña
              </label>
              <input
                type={verNuevo ? 'text' : 'password'}
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 dark:focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={guardando}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {guardando ? 'Guardando cambios...' : 'Guardar Todos los Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}