import { useState } from 'react';
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
  EyeOff
} from 'lucide-react';
import { API_BASE } from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function PerfilDueno() {
  const { usuario, token, actualizarUsuario } = useAuth();

  // Estados del formulario de perfil y negocio
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [correo, setCorreo] = useState(usuario?.correo || '');
  const [negocioNombre, setNegocioNombre] = useState(usuario?.negocioNombre || '');

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

      // 1. Si cambió el nombre del negocio, actualizarlo en la API
      let nuevoNegocioNombre = usuario?.negocioNombre;
      if (negocioNombre.trim() !== usuario?.negocioNombre) {
        const resNegocio = await fetch(`${API_BASE}/auth/negocio`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ nombre: negocioNombre.trim() })
        });
        const dataNegocio = await resNegocio.json();
        if (!resNegocio.ok) {
          throw new Error(dataNegocio.mensaje || 'Error al actualizar el nombre del negocio.');
        }
        nuevoNegocioNombre = dataNegocio.datos.nombre;
      }

      // 2. Actualizar perfil (nombre, correo y opcionalmente contraseña)
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payloadPerfil)
      });

      const dataPerfil = await resPerfil.json();

      if (!resPerfil.ok) {
        throw new Error(dataPerfil.mensaje || 'Error al actualizar el perfil.');
      }

      // 3. Actualizar datos en sesión localmente
      actualizarUsuario({
        nombre: dataPerfil.datos.nombre,
        correo: dataPerfil.datos.correo,
        negocioNombre: nuevoNegocioNombre
      });

      // Limpiar campos de contraseña
      setPasswordActual('');
      setPasswordNuevo('');
      setConfirmarPassword('');

      setMensajeExito('¡Datos del negocio, perfil y credenciales actualizados con éxito!');
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
          Personaliza el título de tu negocio, tu nombre visible, tu correo y tus credenciales de acceso.
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
        {/* Tarjeta 1: Información Comercial y de Cuenta */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs p-6 transition-colors">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 mb-4">
            <Store className="w-4 h-4 text-amber-700 dark:text-amber-500" /> Datos del Negocio y Cuenta
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campo: Título o Nombre del Negocio */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Título del Negocio (Visible al Público)
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
                Se refleja en la cabecera, catálogo público y tickets de venta.
              </p>
            </div>

            {/* Campo: Nombre del Dueño */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Nombre del Dueño
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  placeholder="Ej. Carmen Gómez"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 dark:focus:border-amber-500"
                />
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                Nombre del propietario visible en reportes internos.
              </p>
            </div>

            {/* Campo: Correo Electrónico (Editable) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Correo Electrónico (Inicio de Sesión)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                  placeholder="dueño@negocio.sv"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 dark:focus:border-amber-500"
                />
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                Puedes cambiar tu correo cuando lo requieras para ingresar al sistema.
              </p>
            </div>

            {/* Campo: Rol */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Nivel de Privilegios
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold text-amber-800 dark:text-amber-300">
                  Dueño (Acceso Total al Sistema)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Cambio de Contraseña */}
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {guardando ? 'Guardando cambios...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
