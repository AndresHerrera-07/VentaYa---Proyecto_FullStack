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
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { API_BASE } from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function PerfilDueno() {
  const { usuario, token, actualizarUsuario } = useAuth();

  // Estados del formulario
  const [nombre, setNombre] = useState(usuario?.nombre || '');
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

      const payload = {
        nombre: nombre.trim()
      };

      if (passwordNuevo) {
        payload.passwordActual = passwordActual;
        payload.passwordNuevo = passwordNuevo;
      }

      const res = await fetch(`${API_BASE}/auth/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'Error al actualizar el perfil.');
      }

      // Actualizar datos locales en el contexto de autenticación
      actualizarUsuario({ nombre: data.datos.nombre });

      // Limpiar campos de contraseña
      setPasswordActual('');
      setPasswordNuevo('');
      setConfirmarPassword('');

      setMensajeExito(
        passwordNuevo
          ? '¡Nombre y contraseña actualizados exitosamente!'
          : '¡Nombre del perfil actualizado exitosamente!'
      );
    } catch (err) {
      setMensajeError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
      {/* Encabezado */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Acceso Total - Dueño
          </span>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
          Perfil del Dueño del Negocio
        </h1>
        <p className="text-xs text-stone-500">
          Administra tu nombre comercial visible y actualiza tu contraseña de acceso administrativo.
        </p>
      </div>

      {/* Alerta de Éxito */}
      {mensajeExito && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-medium">{mensajeExito}</span>
        </div>
      )}

      {/* Alerta de Error */}
      {mensajeError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="font-medium">{mensajeError}</span>
        </div>
      )}

      <form onSubmit={manejarGuardar} className="space-y-6">
        {/* Tarjeta 1: Información de la Cuenta */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6">
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-amber-700" /> Datos de la Cuenta
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campo: Nombre del Dueño */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nombre Completo
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  placeholder="Ej. Carmen Gómez"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
              <p className="text-[11px] text-stone-600 mt-1">
                Este nombre se muestra en la barra de navegación y en los reportes de ventas.
              </p>
            </div>

            {/* Campo: Correo Electrónico (Solo Lectura) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Correo Electrónico (Usuario)
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span>{usuario?.correo || 'correo@negocio.sv'}</span>
              </div>
              <p className="text-[11px] text-stone-600 mt-1">
                El correo es el identificador único para iniciar sesión.
              </p>
            </div>

            {/* Campo: Negocio Asociado */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Negocio Administrado
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
                <Store className="w-3.5 h-3.5 text-stone-400" />
                <span>{usuario?.negocioNombre || 'Antojitos Típicos Santa Tecla'}</span>
              </div>
            </div>

            {/* Campo: Rol */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nivel de Privilegios
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-semibold text-amber-800">Dueño (Acceso Total al Sistema)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Cambio de Contraseña */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6">
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2 mb-1">
            <Key className="w-4 h-4 text-amber-700" /> Cambiar Contraseña de Acceso
          </h2>
          <p className="text-xs text-stone-500 mb-4">
            Si deseas cambiar tu contraseña, completa los siguientes campos. Si prefieres conservarla, déjalos vacíos.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Contraseña Actual */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Contraseña Actual
              </label>
              <div className="relative">
                <input
                  type={verActual ? 'text' : 'password'}
                  value={passwordActual}
                  onChange={(e) => setPasswordActual(e.target.value)}
                  placeholder="Tu contraseña actual"
                  className="w-full px-3.5 py-2 pr-9 rounded-xl border border-stone-300 text-xs text-stone-900 outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
                <button
                  type="button"
                  onClick={() => setVerActual(!verActual)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {verActual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Nueva Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={verNuevo ? 'text' : 'password'}
                  value={passwordNuevo}
                  onChange={(e) => setPasswordNuevo(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2 pr-9 rounded-xl border border-stone-300 text-xs text-stone-900 outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
                <button
                  type="button"
                  onClick={() => setVerNuevo(!verNuevo)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {verNuevo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Confirmar Nueva Contraseña
              </label>
              <input
                type={verNuevo ? 'text' : 'password'}
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
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
            {guardando ? 'Guardando cambios...' : 'Guardar Perfil'}
          </button>
        </div>
      </form>
    </div>
  );
}
