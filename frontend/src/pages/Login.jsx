import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Store,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { iniciarSesion, iniciarSesionDemo, cargando } = useAuth();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!correo || !password) {
      setError('Por favor, ingresa tu correo y contraseña');
      return;
    }

    const res = await iniciarSesion(correo, password);
    if (!res.ok) {
      setError(res.mensaje);
      return;
    }

    if (res.usuario.rol === 'vendedor') {
      navigate('/admin/cajero');
    } else {
      navigate('/admin/dashboard');
    }
  };

  const manejarDemo = async (tipoRol) => {
    setError(null);
    if (tipoRol === 'cliente') {
      iniciarSesionDemo('cliente');
      navigate('/');
      return;
    }

    const res = await iniciarSesionDemo(tipoRol);
    if (res.ok) {
      if (tipoRol === 'vendedor') {
        navigate('/admin/cajero');
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      setError(res.mensaje);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-4 py-12 transition-colors duration-200">
      {/* Encabezado */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-700 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Store className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-stone-900 dark:text-stone-50 tracking-tight">Acceso a VendeYa</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Inicia sesión para gestionar tu negocio o consultar pedidos
        </p>
      </div>

      {/* Botones de Acceso Rápido por Rol con 1 solo clic */}
      <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl p-4 mb-6 shadow-xs">
        <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          <span>Acceso Rápido por Rol</span>
        </div>

        <div className="space-y-2">
          {/* Botón Dueño */}
          <button
            type="button"
            onClick={() => manejarDemo('dueno')}
            className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800/80 border border-stone-200 dark:border-stone-800 text-left flex items-center justify-between text-xs transition-colors shadow-xs group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 flex items-center justify-center font-bold text-xs border border-amber-200/50 dark:border-amber-800/40">
                👑
              </span>
              <div>
                <span className="font-bold text-stone-900 dark:text-stone-100 block group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  Dueño (Acceso Total)
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
                  Dashboard, Productos, Pedidos y Perfil
                </span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-700 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Botón Vendedor */}
          <button
            type="button"
            onClick={() => manejarDemo('vendedor')}
            className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800/80 border border-stone-200 dark:border-stone-800 text-left flex items-center justify-between text-xs transition-colors shadow-xs group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 flex items-center justify-center font-bold text-xs border border-blue-200/50 dark:border-blue-800/40">
                🧑‍💼
              </span>
              <div>
                <span className="font-bold text-stone-900 dark:text-stone-100 block group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                  Vendedor (Cajero / Ventas)
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
                  Terminal POS de ventas y lista de pedidos
                </span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-blue-700 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Botón Cliente */}
          <button
            type="button"
            onClick={() => manejarDemo('cliente')}
            className="w-full py-2 px-3 rounded-xl bg-white/70 dark:bg-stone-900/60 hover:bg-white dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-300 text-left flex items-center justify-between text-xs transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-200/50 dark:border-emerald-800/40">
                🛒
              </span>
              <div>
                <span className="font-semibold text-stone-700 dark:text-stone-200 block">
                  Modo Cliente (Tienda Pública)
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
                  Navegar catálogo y comprar sin iniciar sesión
                </span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
          </button>
        </div>
      </div>

      {/* Formulario Estándar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs transition-colors">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={manejarSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="ejemplo@antojitos.sv"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {cargando ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Iniciar Sesión</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
