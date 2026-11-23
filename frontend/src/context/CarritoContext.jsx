import { createContext, useContext, useState, useEffect } from 'react';
import { MAX_POR_PRODUCTO } from '../config/constantes.js';

const CarritoContext = createContext(null);

const CLAVE_STORAGE = 'vendeya_carrito_v1';

export function CarritoProvider({ children }) {
  // Cargar estado inicial desde localStorage asegurando el límite MAX_POR_PRODUCTO
  const [items, setItems] = useState(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_STORAGE);
      if (!guardado) return [];
      const parseado = JSON.parse(guardado);
      if (!Array.isArray(parseado)) return [];
      return parseado.map((item) => {
        const stock = item.producto?.stock ?? MAX_POR_PRODUCTO;
        const limiteMax = Math.min(MAX_POR_PRODUCTO, stock);
        return {
          ...item,
          cantidad: Math.max(1, Math.min(item.cantidad || 1, limiteMax))
        };
      });
    } catch {
      return [];
    }
  });

  // Persistir cambios en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items));
    } catch (e) {
      console.error('Error al guardar carrito en almacenamiento local:', e);
    }
  }, [items]);

  // HU-07: Agregar un producto al carrito
  const agregarAlCarrito = (producto, cantidad = 1) => {
    if (!producto || producto.stock <= 0) return false;

    setItems((itemsActuales) => {
      const indiceExistente = itemsActuales.findIndex((i) => i.producto.id === producto.id);
      // Límite: el menor entre MAX_POR_PRODUCTO y el stock disponible
      const limiteMax = Math.min(MAX_POR_PRODUCTO, producto.stock);

      if (indiceExistente >= 0) {
        // Si ya está en el carrito, aumentar cantidad sin exceder el límite
        const copia = [...itemsActuales];
        const cantidadTotal = copia[indiceExistente].cantidad + cantidad;
        const cantidadValida = Math.min(cantidadTotal, limiteMax);

        copia[indiceExistente] = {
          ...copia[indiceExistente],
          cantidad: cantidadValida
        };
        return copia;
      }

      // Si es un producto nuevo en el carrito
      return [
        ...itemsActuales,
        {
          producto,
          cantidad: Math.min(cantidad, limiteMax)
        }
      ];
    });

    return true;
  };

  // HU-07: Modificar cantidad de un producto
  const actualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      quitarDelCarrito(productoId);
      return;
    }

    setItems((itemsActuales) =>
      itemsActuales.map((item) => {
        if (item.producto.id === productoId) {
          // Límite: el menor entre MAX_POR_PRODUCTO y el stock disponible
          const limiteMax = Math.min(MAX_POR_PRODUCTO, item.producto.stock);
          return {
            ...item,
            cantidad: Math.min(nuevaCantidad, limiteMax)
          };
        }
        return item;
      })
    );
  };

  // HU-07: Quitar un producto del carrito
  const quitarDelCarrito = (productoId) => {
    setItems((itemsActuales) => itemsActuales.filter((i) => i.producto.id !== productoId));
  };

  // Vaciar carrito tras checkout exitoso
  const vaciarCarrito = () => {
    setItems([]);
  };

  // Cálculos visuales para el cliente (RN-11 y RN-12)
  const totalArticulos = items.reduce((acc, item) => acc + item.cantidad, 0);
  const totalPrecio = Number(
    items.reduce((acc, item) => acc + Number(item.producto.precio) * item.cantidad, 0).toFixed(2)
  );

  return (
    <CarritoContext.Provider
      value={{
        items,
        agregarAlCarrito,
        actualizarCantidad,
        quitarDelCarrito,
        vaciarCarrito,
        totalArticulos,
        totalPrecio
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const contexto = useContext(CarritoContext);
  if (!contexto) {
    throw new Error('useCarrito debe utilizarse dentro de un CarritoProvider');
  }
  return contexto;
}
