import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../config/api.js';

const AuthContext = createContext(null);

const CLAVE_TOKEN = 'vendeya_token_v1';
const CLAVE_USUARIO = 'vendeya_usuario_v1';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem(CLAVE_TOKEN) || null;
  });

  const [usuario, setUsuario] = useState(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_USUARIO);
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  });

  const [cargando, setCargando] = useState(false);

  // Rol activo: 'dueno' | 'vendedor' | 'cliente'
  const rol = usuario?.rol || 'cliente';
  const esDueno = rol === 'dueno';
  const esVendedor = rol === 'vendedor';
  const esCliente = !usuario || rol === 'cliente';
  const autenticado = Boolean(token && usuario);

  // Iniciar sesión con correo y contraseña (HU-02)
  const iniciarSesion = async (correo, password) => {
    try {
      setCargando(true);
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'Error al iniciar sesión');
      }

      const { token: nuevoToken, usuario: nuevoUsuario } = data.datos;

      setToken(nuevoToken);
      setUsuario(nuevoUsuario);

      localStorage.setItem(CLAVE_TOKEN, nuevoToken);
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(nuevoUsuario));

      return { ok: true, usuario: nuevoUsuario };
    } catch (error) {
      return { ok: false, mensaje: error.message };
    } finally {
      setCargando(false);
    }
  };

  // Acceso demo rápido con un clic para cambiar entre Dueño, Vendedor y Cliente
  const iniciarSesionDemo = async (tipoRol) => {
    if (tipoRol === 'cliente') {
      cerrarSesion();
      return { ok: true, rol: 'cliente' };
    }

    const credenciales =
      tipoRol === 'dueno'
        ? { correo: 'testeo@antojitos.sv', password: 'admin123' }
        : { correo: 'vendedor@antojitos.sv', password: 'admin123' };

    return await iniciarSesion(credenciales.correo, credenciales.password);
  };

  // Actualizar datos del usuario en sesión (por ejemplo, al cambiar de nombre)
  const actualizarUsuario = (datosActualizados) => {
    setUsuario((anterior) => {
      const nuevo = { ...anterior, ...datosActualizados };
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(nuevo));
      return nuevo;
    });
  };

  // Cerrar sesión
  const cerrarSesion = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        rol,
        esDueno,
        esVendedor,
        esCliente,
        autenticado,
        cargando,
        iniciarSesion,
        iniciarSesionDemo,
        actualizarUsuario,
        cerrarSesion
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return contexto;
}
