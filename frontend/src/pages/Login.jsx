import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
  Store,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { iniciarSesion, cargando } = useAuth();

  // Correo predeterminado configurado a testeo@antojitos.sv
  const [correo, setCorreo] = useState('testeo@antojitos.sv');
  const [password, setPassword] = useState('admin123');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState(null);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!correo.trim() || !password) {
      setError('Por favor, ingresa tu correo y contraseña autorizados.');
      return;
    }

    const res = await iniciarSesion(correo.trim(), password);
    if (!res.ok) {
      setError(res.mensaje || 'Credenciales inválidas. Verifica tu correo y contraseña.');
      return;
    }

    // Redirigir según el rol del colaborador
    if (res.usuario.rol === 'vendedor') {
      navigate('/admin/cajero');
    } else if (res.usuario.rol === 'dueno') {
      navigate('/admin/dashboard');
    } else {
      setError('Esta área es exclusiva para el Dueño y Vendedores del negocio.');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-4 py-12 transition-colors duration-200">
      {/* Encabezado del Portal de Personal */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-700 dark:bg-amber-600 text-white flex items-center justify-center mx-auto mb-3 shadow-sm shadow-amber-900/10">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 mb-2">
          <Store className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          <span>Portal Exclusivo para Dueño y Vendedor</span>
        </div>
        <h1 className="text-2xl font-black text-stone-900 dark:text-stone-50 tracking-tight">
          Acceso de Colaboradores
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
          Inicia sesión con tus credenciales asignadas para administrar el catálogo, inventario o registrar ventas.
        </p>
      </div>

      {/* Formulario de Acceso para Personal */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs transition-colors mb-6">
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={manejarSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              Correo Electrónico de Trabajo
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="testeo@antojitos.sv"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 dark:focus:border-amber-500 outline-hidden transition-colors"
              />
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
              Correo predeterminado: <strong className="text-amber-700 dark:text-amber-400">testeo@antojitos.sv</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              Contraseña de Acceso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={mostrarPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 dark:focus:border-amber-500 outline-hidden transition-colors"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              >
                {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {cargando ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Ingresar al Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Separación y Redirección hacia la Tienda del Cliente */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/50 p-4 text-center transition-colors">
        <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1 flex items-center justify-center gap-1.5">
          <ShoppingBag className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          <span>¿Eres un cliente y deseas hacer un pedido?</span>
        </p>
        <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-3">
          Los clientes no necesitan registrarse ni iniciar sesión para comprar.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition-colors shadow-2xs"
        >
          <span>Ir a la Tienda de Clientes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}