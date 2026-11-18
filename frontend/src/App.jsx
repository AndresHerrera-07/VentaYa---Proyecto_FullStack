import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import CatalogoPublico from './pages/CatalogoPublico.jsx';
import ProductosAdmin from './pages/ProductosAdmin.jsx';
import PedidosAdmin from './pages/PedidosAdmin.jsx';
import DashboardAdmin from './pages/DashboardAdmin.jsx';
import NuevoPedidoVendedor from './pages/NuevoPedidoVendedor.jsx';
import CajeroVendedor from './pages/CajeroVendedor.jsx';
import PerfilDueno from './pages/PerfilDueno.jsx';
import Login from './pages/Login.jsx';
import RutaProtegida from './components/RutaProtegida.jsx';
import { CarritoProvider } from './context/CarritoContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CarritoProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900 dark:selection:bg-amber-900/50 dark:selection:text-amber-100 transition-colors duration-200">
              {/* Barra superior de navegación adaptativa por rol con toggle de modo oscuro */}
              <Navbar />

              {/* Contenido enrutado dinámicamente con control de acceso */}
              <main className="flex-1 flex flex-col">
                <Routes>
                  {/*
                    RUTA RAÍZ — Cliente
                    El cliente entra directamente al catálogo de la tienda principal.
                    No ve formulario de login; solo productos, búsqueda y carrito.
                  */}
                  <Route path="/" element={<CatalogoPublico />} />

                  {/* Ruta pública de tienda por slug (acceso directo a otras tiendas) */}
                  <Route path="/tienda/:slug" element={<CatalogoPublico />} />

                  {/*
                    ACCESO DE EMPLEADOS — Inicio de Sesión
                    Enlace discreto accesible desde el pie de página.
                  */}
                  <Route path="/login" element={<Login />} />

                  {/*
                    DUEÑO — Acceso Total
                    Dashboard, Productos, Pedidos y Perfil personal.
                  */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <RutaProtegida rolesPermitidos={['dueno']}>
                        <DashboardAdmin />
                      </RutaProtegida>
                    }
                  />

                  <Route
                    path="/admin/productos"
                    element={
                      <RutaProtegida rolesPermitidos={['dueno']}>
                        <ProductosAdmin />
                      </RutaProtegida>
                    }
                  />

                  <Route
                    path="/admin/pedidos"
                    element={
                      <RutaProtegida rolesPermitidos={['dueno', 'vendedor']}>
                        <PedidosAdmin />
                      </RutaProtegida>
                    }
                  />

                  {/* Perfil del Dueño: cambiar nombre, correo, título de negocio y contraseña */}
                  <Route
                    path="/admin/perfil"
                    element={
                      <RutaProtegida rolesPermitidos={['dueno']}>
                        <PerfilDueno />
                      </RutaProtegida>
                    }
                  />

                  {/*
                    VENDEDOR — Solo ventas y pedidos
                    Punto de venta / cajero y lista de pedidos.
                  */}
                  <Route
                    path="/admin/cajero"
                    element={
                      <RutaProtegida rolesPermitidos={['vendedor', 'dueno']}>
                        <CajeroVendedor />
                      </RutaProtegida>
                    }
                  />

                  {/* Ruta heredada para toma de pedidos en mostrador */}
                  <Route
                    path="/admin/nuevo-pedido"
                    element={
                      <RutaProtegida rolesPermitidos={['dueno', 'vendedor']}>
                        <NuevoPedidoVendedor />
                      </RutaProtegida>
                    }
                  />

                  {/* Ruta por defecto para URLs inexistentes */}
                  <Route
                    path="*"
                    element={
                      <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                          Página no encontrada
                        </h2>
                        <p className="text-stone-500 dark:text-stone-400 text-sm mt-2">
                          La dirección ingresada no existe en VendeYa.
                        </p>
                      </div>
                    }
                  />
                </Routes>
              </main>

              {/* Pie de página con enlace discreto para Acceso de Empleados */}
              <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 py-6 text-center text-xs text-stone-500 dark:text-stone-400 transition-colors">
                <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <p>VendeYa &copy; 2026 — Plataforma de Comercio Local para El Salvador</p>
                  <div className="flex items-center gap-4 text-stone-400 dark:text-stone-500">
                    <span>Node.js · Express 5 · MySQL · React 19 · Tailwind CSS</span>
                    {/* Enlace de acceso para empleados (Dueño / Vendedor) — discreto en el pie */}
                    <Link
                      to="/login"
                      className="underline underline-offset-2 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                    >
                      Acceso Personal
                    </Link>
                  </div>
                </div>
              </footer>
            </div>
          </BrowserRouter>
        </CarritoProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
