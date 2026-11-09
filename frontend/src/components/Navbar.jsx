import {
  Store,
  Package,
  ShoppingBag,
  ClipboardList,
  BarChart3,
  DollarSign,
  User,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const location = useLocation();
  const { esDueno, esVendedor, autenticado, usuario, cerrarSesion } = useAuth();

  const esRutaActiva = (ruta) => {
    if (ruta === '/' && location.pathname === '/') return true;
    if (ruta !== '/' && location.pathname.startsWith(ruta)) return true;
    return false;
  };

  return (
    <header className="border-b border-stone-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logotipo principal */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-amber-700 flex items-center justify-center text-white shadow-sm shadow-amber-900/10 group-hover:bg-amber-800 transition-colors">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-stone-900">VendeYa</span>
              <span className="hidden sm:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900">
                SV
              </span>
            </div>
            <p className="text-[11px] text-stone-600 hidden sm:block -mt-0.5">Comercio Local</p>
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
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-700" />
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
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <Link
                to="/admin/productos"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  esRutaActiva('/admin/productos')
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Package className="w-4 h-4 text-amber-400" />
                <span>Productos</span>
              </Link>

              <Link
                to="/admin/pedidos"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  esRutaActiva('/admin/pedidos')
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-blue-400" />
                <span>Pedidos</span>
              </Link>

              <Link
                to="/admin/perfil"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  esRutaActiva('/admin/perfil')
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <User className="w-4 h-4 text-amber-500" />
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
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Cajero / Ventas</span>
              </Link>

              <Link
                to="/admin/pedidos"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  esRutaActiva('/admin/pedidos')
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-blue-500" />
                <span>Lista Pedidos</span>
              </Link>
            </>
          )}

          {/* Insignia de Rol y Cerrar Sesión para Dueño y Vendedor */}
          {autenticado && (
            <div className="flex items-center gap-2 pl-2 border-l border-stone-200 ml-1">
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1 ${
                  esDueno
                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                    : 'bg-blue-100 text-blue-900 border border-blue-200'
                }`}
                title={`Conectado como ${usuario?.nombre} (${usuario?.correo})`}
              >
                {esDueno ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
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
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
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
