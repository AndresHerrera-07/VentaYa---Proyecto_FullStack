import {
  Store,
  Package,
  ShoppingBag,
  ClipboardList,
  BarChart3,
  DollarSign,
  User,
  LogOut,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Navbar() {
  const location = useLocation();
  const { esDueno, esVendedor, autenticado, usuario, cerrarSesion } = useAuth();
  const { temaOscuro, alternarTema } = useTheme();

  const esRutaActiva = (ruta) => {
    if (ruta === '/' && location.pathname === '/') return true;
    if (ruta !== '/' && location.pathname.startsWith(ruta)) return true;
    return false;
  };

  return (
    <header className="border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logotipo principal */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-amber-700 dark:bg-amber-600 flex items-center justify-center text-white shadow-sm shadow-amber-900/10 group-hover:bg-amber-800 dark:group-hover:bg-amber-700 transition-colors">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
                {usuario?.negocioNombre || 'VendeYa'}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                SV
              </span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 hidden sm:block -mt-0.5">
              Comercio Local
            </p>
          </div>
        </Link>

        {/* Enlaces de navegación adaptados por ROL */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* CLIENTE: Solo ve el Catálogo de Productos y Tienda */}
          {!autenticado && (
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                esRutaActiva('/')
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-700 dark:text-amber-500" />
              <span>Catálogo de Productos</span>
            </Link>
          )}

          {/* DUEÑO: Acceso Total (Dashboard, Productos, Pedidos, Mi Perfil) */}
          {esDueno && (
            <>
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  esRutaActiva('/admin/dashboard')
                    ? 'bg-stone-900 dark:bg-stone-800 text-white'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <Link
                to="/admin/productos"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  esRutaActiva('/admin/productos')
                    ? 'bg-stone-900 dark:bg-stone-800 text-white'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <Package className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Productos</span>
              </Link>

              <Link
                to="/admin/pedidos"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  esRutaActiva('/admin/pedidos')
                    ? 'bg-stone-900 dark:bg-stone-800 text-white'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span>Pedidos</span>
              </Link>

              <Link
                to="/admin/perfil"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  esRutaActiva('/admin/perfil')
                    ? 'bg-stone-900 dark:bg-stone-800 text-white'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">Mi</span> Perfil
              </Link>
            </>
          )}

          {/* VENDEDOR: Exclusivamente Cajero / Ventas y Lista de Pedidos */}
          {esVendedor && (
            <>
              <Link
                to="/admin/cajero"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                  esRutaActiva('/admin/cajero')
                    ? 'bg-blue-700 text-white'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/60'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Cajero / Ventas</span>
              </Link>

              <Link
                to="/admin/pedidos"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  esRutaActiva('/admin/pedidos')
                    ? 'bg-stone-900 dark:bg-stone-800 text-white'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span>Lista Pedidos</span>
              </Link>
            </>
          )}

          {/* Botón de Modo Oscuro / Modo Claro */}
          <button
            type="button"
            onClick={alternarTema}
            title={temaOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Alternar tema"
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 border border-stone-200 dark:border-stone-700 transition-colors"
          >
            {temaOscuro ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-stone-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Insignia de Rol y Cerrar Sesión para Dueño y Vendedor */}
          {autenticado && (
            <div className="flex items-center gap-2 pl-2 border-l border-stone-200 dark:border-stone-800 ml-1">
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1 ${
                  esDueno
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/70'
                    : 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800/70'
                }`}
                title={`Conectado como ${usuario?.nombre} (${usuario?.correo})`}
              >
                {esDueno ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    <span>👑 {usuario?.nombre || 'Dueño'}</span>
                  </>
                ) : (
                  <>
                    <span>🧑‍💼 {usuario?.nombre || 'Vendedor'}</span>
                  </>
                )}
              </span>

              <button
                onClick={cerrarSesion}
                title="Cerrar sesión"
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
