import {
  Store,
  ShoppingBag,
  ShieldCheck,
  Zap,
  ArrowRight,
  Eye,
  Package,
  ClipboardList,
  BarChart3,
  ShoppingCart,
  UserCheck,
  PlusCircle,
  LogIn
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Inicio() {
  const { rol, autenticado, usuario } = useAuth();

  return (
    <div className="flex-1 flex flex-col justify-center max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Título y Presentación */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-4 border border-amber-200">
          <Store className="w-3.5 h-3.5 text-amber-700" /> Plataforma de Comercio Local
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-900 leading-tight">
          Comercio digital sencillo para emprendedores
        </h1>
        <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed">
          Catálogos públicos individuales, pedidos directos por WhatsApp, control de inventario y roles de usuario para tu equipo de trabajo.
        </p>

        {/* Acceso por Roles Directo */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <Link
            to="/tienda/antojitos-santa-tecla"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Catálogo Público (Cliente)</span>
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Acceso Empleados (Dueño / Vendedor)</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas de arquitectura de los 3 ROLES del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
        {/* Rol 1: Dueño del negocio */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-4 border border-amber-200 font-bold text-lg">
              👑
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-stone-900">Dueño del Negocio</h2>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900">
                Acceso Total
              </span>
            </div>
            <p className="text-stone-600 text-xs mb-4 leading-relaxed">
              Control integral de la plataforma: gestión de catálogo, inventario, pedidos, métricas financieras y administración de usuarios.
            </p>
            <ul className="text-xs text-stone-500 space-y-1.5 border-t border-stone-100 pt-3 mb-6">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>CRUD de productos y control de stock</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Dashboard con gráficos de ventas Recharts</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Creación y gestión de vendedores</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            <Link
              to="/admin/dashboard"
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              Panel Dueño &rarr;
            </Link>
          </div>
        </div>

        {/* Rol 2: Vendedor */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center mb-4 border border-blue-200 font-bold text-lg">
              🧑‍💼
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-stone-900">Vendedor</h2>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-900">
                Operaciones
              </span>
            </div>
            <p className="text-stone-600 text-xs mb-4 leading-relaxed">
              Atención directa en tienda: consulta pedidos en tiempo real, actualiza estados y toma pedidos en mostrador o llamada.
            </p>
            <ul className="text-xs text-stone-500 space-y-1.5 border-t border-stone-100 pt-3 mb-6">
              <li className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Visualización y transición de pedidos</span>
              </li>
              <li className="flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Registro rápido de pedidos mostrador</span>
              </li>
              <li className="flex items-center gap-1.5 text-stone-400">
                <span className="text-[11px]">🔒 Sin acceso a métricas ni edición de precios</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            <Link
              to="/admin/pedidos"
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              Panel Pedidos &rarr;
            </Link>
          </div>
        </div>

        {/* Rol 3: Cliente público */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4 border border-emerald-200 font-bold text-lg">
              🛒
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-stone-900">Cliente Público</h2>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                Sin Registro
              </span>
            </div>
            <p className="text-stone-600 text-xs mb-4 leading-relaxed">
              Accede a la tienda por su slug único, busca productos, agrega al carrito y confirma órdenes sin necesidad de crear cuenta.
            </p>
            <ul className="text-xs text-stone-500 space-y-1.5 border-t border-stone-100 pt-3 mb-6">
              <li className="flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Buscador y filtros por categoría</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Carrito reactivo en tiempo real</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Checkout express y aviso por WhatsApp</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            <Link
              to="/tienda/antojitos-santa-tecla"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Explorar Tienda &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
