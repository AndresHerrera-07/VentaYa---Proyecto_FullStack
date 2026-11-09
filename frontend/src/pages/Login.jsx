import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Store,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
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
    <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-4 py-12">
      {/* Encabezado */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-700 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Store className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">Acceso a VendeYa</h1>
        <p className="text-xs text-stone-500 mt-1">
          Inicia sesión para gestionar tu negocio o consultar pedidos
        </p>
      </div>

      {/* Botones de Acceso Rápido por Rol con 1 solo clic */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 mb-6 shadow-xs">
        <div className="flex items-center gap-1.5 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Acceso Rápido por Rol</span>
        </div>

        <div className="space-y-2">
          {/* Botón Dueño */}
          <button
            type="button"
            onClick={() => manejarDemo('dueno')}
            className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-left flex items-center justify-between text-xs transition-colors shadow-xs group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                👑
              </span>
              <div>
                <span className="font-bold text-stone-900 block group-hover:text-amber-700 transition-colors">
                  Dueño (Acceso Total)
                </span>
                <span className="text-[10px] text-stone-500 block">
                  Dashboard, Productos y Pedidos
                </span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Botón Vendedor */}
          <button
            type="button"
            onClick={() => manejarDemo('vendedor')}
            className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-left flex items-center justify-between text-xs transition-colors shadow-xs group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs">
                🧑‍💼
              </span>
              <div>
                <span className="font-bold text-stone-900 block group-hover:text-blue-700 transition-colors">
                  Vendedor (Operación de Tienda)
                </span>
                <span className="text-[10px] text-stone-500 block">
                  Lista de Pedidos y Nuevo Pedido Mostrador
                </span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Botón Cliente */}
          <button
            type="button"
            onClick={() => manejarDemo('cliente')}
            className="w-full py-2 px-3 rounded-xl bg-white/60 hover:bg-white text-stone-600 text-left flex items-center justify-between text-xs transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs">
                🛒
              </span>
              <div>
                <span className="font-semibold text-stone-700 block">
                  Modo Cliente (Tienda Pública)
                </span>
                <span className="text-[10px] text-stone-500 block">
                  Navegar catálogo y comprar sin iniciar sesión
                </span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
          </button>
        </div>
      </div>

      {/* Formulario Estándar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={manejarSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="ejemplo@antojitos.sv"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
