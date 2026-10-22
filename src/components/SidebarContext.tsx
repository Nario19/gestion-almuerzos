'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  sidebarColapsado: boolean;
  setSidebarColapsado: (colapsado: boolean) => void;
  toggleSidebarColapsado: () => void;
  sidebarMovilAbierto: boolean;
  setSidebarMovilAbierto: (abierto: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  sidebarColapsado: false,
  setSidebarColapsado: () => {},
  toggleSidebarColapsado: () => {},
  sidebarMovilAbierto: false,
  setSidebarMovilAbierto: () => {},
});

const STORAGE_KEY = 'placeres_sidebar_colapsado';

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [sidebarColapsado, setSidebarColapsadoState] = useState(false);
  const [sidebarMovilAbierto, setSidebarMovilAbierto] = useState(false);

  // Cargar preferencia persistida del usuario en cliente evitando errores de hidratación
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado !== null) {
        setSidebarColapsadoState(guardado === 'true');
      }
    } catch {
      // Ignorar si localStorage no está disponible
    }
  }, []);

  const setSidebarColapsado = (colapsado: boolean) => {
    setSidebarColapsadoState(colapsado);
    try {
      localStorage.setItem(STORAGE_KEY, String(colapsado));
    } catch {
      // Ignorar
    }
  };

  const toggleSidebarColapsado = () => {
    setSidebarColapsado(!sidebarColapsado);
  };

  return (
    <SidebarContext.Provider
      value={{
        sidebarColapsado,
        setSidebarColapsado,
        toggleSidebarColapsado,
        sidebarMovilAbierto,
        setSidebarMovilAbierto,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
