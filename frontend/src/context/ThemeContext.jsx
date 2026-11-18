import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);
const CLAVE_TEMA = 'vendeya_tema_v1';

export function ThemeProvider({ children }) {
  const [temaOscuro, setTemaOscuro] = useState(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_TEMA);
      if (guardado !== null) {
        return guardado === 'dark';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (temaOscuro) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(CLAVE_TEMA, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(CLAVE_TEMA, 'light');
      }
    } catch (err) {
      console.error('Error al sincronizar tema:', err);
    }
  }, [temaOscuro]);

  const alternarTema = () => {
    setTemaOscuro((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ temaOscuro, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser utilizado dentro de un ThemeProvider');
  }
  return context;
}
