import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

export default function RutaProtegida({ children, rolesPermitidos = [] }) {
  const { autenticado, rol, usuario } = useAuth();

  // Si no está autenticado, redirigir a Login
  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  // Si se especificaron roles y el rol actual no está en la lista permitida
  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(rol)) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-stone-200 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-1">Acceso Restringido</h2>
        <p className="text-xs text-stone-500 mb-6 leading-relaxed">
          Esta sección requiere permisos de rol{' '}
          <strong className="text-stone-700">[{rolesPermitidos.join(', ')}]</strong>.
          Actualmente has ingresado como <strong className="text-amber-800 capitalize">{rol}</strong> ({usuario?.nombre}).
        </p>
        <div className="space-y-2">
          {rol === 'vendedor' ? (
            <Link
              to="/admin/cajero"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Ir al Cajero / Ventas
            </Link>
          ) : (
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a la Tienda
            </Link>
          )}
        </div>
      </div>
    );
  }

  return children;
}
