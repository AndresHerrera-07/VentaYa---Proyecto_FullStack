import { Store, ShoppingBag, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      {/* Barra superior de navegación */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-700 flex items-center justify-center text-white shadow-sm shadow-amber-900/10">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-stone-900">VendeYa</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                El Salvador
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Fase 1: Base Lista
            </span>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200/60 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5 text-amber-600" /> Plataforma de Comercio Local
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-900 leading-tight">
            Comercio digital sencillo para emprendedores
          </h1>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed">
            Catálogos públicos accesibles mediante enlace único, gestión de inventario y pedidos con checkout express sin registro para el cliente.
          </p>
        </div>

        {/* Tarjetas de arquitectura de los 2 roles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
          {/* Dueño del negocio */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-amber-700 mb-5">
              <Store className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">Panel del Emprendedor</h2>
            <p className="text-stone-600 text-sm mb-4 leading-relaxed">
              Administración completa de productos, existencias en tiempo real, cambio de estados de pedidos y métricas visuales con código QR.
            </p>
            <ul className="text-xs text-stone-500 space-y-1.5 border-t border-stone-100 pt-4">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                Autenticación JWT con contraseñas encriptadas con bcryptjs
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                Aislamiento estricto multitenant por negocio
              </li>
            </ul>
          </div>

          {/* Cliente público */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-emerald-700 mb-5">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">Tienda Pública para Clientes</h2>
            <p className="text-stone-600 text-sm mb-4 leading-relaxed">
              Catálogo rápido mediante slug único, buscador, filtros por categoría y checkout express sin necesidad de crear cuenta.
            </p>
            <ul className="text-xs text-stone-500 space-y-1.5 border-t border-stone-100 pt-4">
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                Checkout express con descuento atómico de inventario
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                Cálculo de totales validado en el servidor
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Pie de página */}
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>VendeYa &copy; 2026 — Proyecto Académico y de Portafolio</p>
          <p className="text-stone-400">Node.js · Express 5 · MySQL · React · Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
