'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UsuarioPadre, Hijo, RolUsuario } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

interface AuthContextType {
  usuario: UsuarioPadre | null;
  cargando: boolean;
  esAdmin: boolean;
  login: (identificador: string, password?: string) => Promise<{ ok: boolean; error?: string; esAdmin?: boolean }>;
  registro: (datos: {
    nombreCompleto: string;
    dni: string;
    telefono: string;
    password?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  agregarHijo: (datos: {
    nombreCompleto: string;
    colegioNombre: string;
    gradoSeccion: string;
    alergiasNotas?: string;
  }) => Promise<{ ok: boolean; error?: string; hijo?: Hijo }>;
  eliminarHijo: (hijoId: string) => Promise<{ ok: boolean; error?: string }>;
  actualizarHijos: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioPadre | null>(null);
  const [cargando, setCargando] = useState(true);

  // Cargar sesión guardada al iniciar
  useEffect(() => {
    const sesionGuardada = typeof window !== 'undefined' ? localStorage.getItem('sesion_padre_almuerzos') : null;
    if (sesionGuardada) {
      try {
        const u: UsuarioPadre = JSON.parse(sesionGuardada);
        setUsuario(u);
        if (u.id && u.rol !== 'ADMIN') {
          cargarHijosDeSupabase(u.id).then((hijosActualizados) => {
            if (hijosActualizados) {
              const actualizado = { ...u, hijos: hijosActualizados };
              setUsuario(actualizado);
              localStorage.setItem('sesion_padre_almuerzos', JSON.stringify(actualizado));
            }
          });
        }
      } catch (e) {
        console.error('Error restaurando sesión:', e);
      }
    }
    setCargando(false);
  }, []);

  const cargarHijosDeSupabase = async (padreId: string): Promise<Hijo[] | null> => {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('hijos')
        .select('*')
        .eq('padre_id', padreId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        return data.map((h) => ({
          id: h.id,
          padreId: h.padre_id,
          nombreCompleto: h.nombre_completo,
          colegioNombre: h.colegio_nombre,
          gradoSeccion: h.grado_seccion,
          alergiasNotas: h.alergias_notas,
          createdAt: h.created_at,
        }));
      }
    } catch (e) {
      console.error('Error cargando hijos de Supabase:', e);
    }
    return null;
  };

  const registro = async (datos: {
    nombreCompleto: string;
    dni: string;
    telefono: string;
    password?: string;
  }) => {
    const dniLimpio = datos.dni.trim();
    const telLimpio = datos.telefono.trim();
    const nombreLimpio = datos.nombreCompleto.trim();

    if (isSupabaseConfigured && supabase) {
      try {
        // Verificar si el DNI ya existe
        const { data: existente } = await supabase
          .from('perfiles_padres')
          .select('id')
          .eq('dni', dniLimpio)
          .maybeSingle();

        if (existente) {
          return { ok: false, error: 'Ya existe una cuenta registrada con este número de DNI.' };
        }

        const { data, error } = await supabase
          .from('perfiles_padres')
          .insert([
            {
              nombre_completo: nombreLimpio,
              dni: dniLimpio,
              telefono: telLimpio,
              rol: 'PADRE',
              password_hash: datos.password || 'password123',
            },
          ])
          .select()
          .single();

        if (error) {
          return { ok: false, error: error.message };
        }

        const nuevoUsuario: UsuarioPadre = {
          id: data.id,
          nombreCompleto: data.nombre_completo,
          dni: data.dni,
          telefono: data.telefono,
          rol: 'PADRE',
          hijos: [],
        };

        setUsuario(nuevoUsuario);
        localStorage.setItem('sesion_padre_almuerzos', JSON.stringify(nuevoUsuario));
        return { ok: true };
      } catch (err: any) {
        return { ok: false, error: err.message || 'Error en el registro' };
      }
    } else {
      // Modo local/fallback
      const nuevoUsuario: UsuarioPadre = {
        id: `padre-${Date.now()}`,
        nombreCompleto: nombreLimpio,
        dni: dniLimpio,
        telefono: telLimpio,
        rol: 'PADRE',
        hijos: [],
      };
      setUsuario(nuevoUsuario);
      localStorage.setItem('sesion_padre_almuerzos', JSON.stringify(nuevoUsuario));
      return { ok: true };
    }
  };

  const login = async (identificador: string, password?: string) => {
    const idLimpio = identificador.trim();

    // Comprobación directa para cuenta Administrador inicial (seeder/fallback)
    if ((idLimpio === '00000000' || idLimpio.toLowerCase() === 'admin') && password === 'admin123') {
      const adminUser: UsuarioPadre = {
        id: 'admin-sistema-id',
        nombreCompleto: 'Administrador General',
        dni: '00000000',
        telefono: '999999999',
        rol: 'ADMIN',
        hijos: [],
      };
      setUsuario(adminUser);
      localStorage.setItem('sesion_padre_almuerzos', JSON.stringify(adminUser));
      return { ok: true, esAdmin: true };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        // Buscar por DNI primero, luego por email si aplica
        let query = supabase
          .from('perfiles_padres')
          .select('*')
          .eq('dni', idLimpio);

        let { data, error } = await query.maybeSingle();

        // Si no encontró por DNI, buscar por email
        if (!data) {
          const { data: dataEmail } = await supabase
            .from('perfiles_padres')
            .select('*')
            .eq('email', idLimpio.toLowerCase())
            .maybeSingle();
          data = dataEmail;
        }

        if (!data) {
          return { ok: false, error: 'No se encontró una cuenta con ese DNI o credencial.' };
        }

        if (password && data.password_hash && data.password_hash !== password) {
          return { ok: false, error: 'Contraseña incorrecta.' };
        }

        const esAdmin = data.rol === 'ADMIN' || data.dni === '00000000';
        const hijos = esAdmin ? [] : (await cargarHijosDeSupabase(data.id)) || [];

        const u: UsuarioPadre = {
          id: data.id,
          nombreCompleto: data.nombre_completo,
          dni: data.dni,
          telefono: data.telefono,
          email: data.email,
          rol: esAdmin ? 'ADMIN' : 'PADRE',
          hijos,
        };

        setUsuario(u);
        localStorage.setItem('sesion_padre_almuerzos', JSON.stringify(u));
        return { ok: true, esAdmin };
      } catch (err: any) {
        return { ok: false, error: err.message || 'Error al iniciar sesión' };
      }
    } else {
      // Fallback local
      const u: UsuarioPadre = {
        id: 'padre-demo',
        nombreCompleto: 'Padre de Familia',
        dni: idLimpio,
        telefono: '999999999',
        rol: 'PADRE',
        hijos: [],
      };
      setUsuario(u);
      localStorage.setItem('sesion_padre_almuerzos', JSON.stringify(u));
      return { ok: true, esAdmin: false };
    }
  };

  const logout = () => {
    setUsuario(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sesion_padre_almuerzos');
    }
  };

  const agregarHijo = async (datos: {
    nombreCompleto: string;
    colegioNombre: string;
    gradoSeccion: string;
    alergiasNotas?: string;
  }) => {
    if (!usuario) {
      return { ok: false, error: 'Debes iniciar sesión para agregar a tus hijos.' };
    }

    const nuevoHijo: Hijo = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `hijo-${Date.now()}`,
      padreId: usuario.id,
      nombreCompleto: datos.nombreCompleto.trim(),
      colegioNombre: datos.colegioNombre,
      gradoSeccion: datos.gradoSeccion,
      alergiasNotas: datos.alergiasNotas?.trim(),
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('hijos')
          .insert([
            {
              padre_id: usuario.id,
              nombre_completo: nuevoHijo.nombreCompleto,
              colegio_nombre: nuevoHijo.colegioNombre,
              grado_seccion: nuevoHijo.gradoSeccion,
              alergias_notas: nuevoHijo.alergiasNotas,
            },
          ])
          .select()
          .single();

        if (error) {
          return { ok: false, error: error.message };
        }
        nuevoHijo.id = data.id;
      } catch (err: any) {
        return { ok: false, error: err.message || 'Error guardando en Supabase' };
      }
    }

    const hijosActualizados = [...usuario.hijos, nuevoHijo];
    const usuarioActualizado = { ...usuario, hijos: hijosActualizados };
    setUsuario(usuarioActualizado);
    localStorage.setItem('sesion_padre_almuerzos', JSON.stringify(usuarioActualizado));

    return { ok: true, hijo: nuevoHijo };
  };

  const eliminarHijo = async (hijoId: string) => {
    if (!usuario) return { ok: false, error: 'No autenticado' };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('hijos').delete().eq('id', hijoId);
      } catch (err: any) {
        console.error('Error eliminando hijo:', err);
      }
    }

    const hijosActualizados = usuario.hijos.filter((h) => h.id !== hijoId);
    const usuarioActualizado = { ...usuario, hijos: hijosActualizados };
    setUsuario(usuarioActualizado);
    localStorage.setItem('sesion_padre_almuerzos', JSON.stringify(usuarioActualizado));

    return { ok: true };
  };

  const actualizarHijos = async () => {
    if (!usuario || usuario.rol === 'ADMIN') return;
    const hijos = await cargarHijosDeSupabase(usuario.id);
    if (hijos) {
      const u = { ...usuario, hijos };
      setUsuario(u);
      localStorage.setItem('sesion_padre_almuerzos', JSON.stringify(u));
    }
  };

  const esAdmin = Boolean(usuario && usuario.rol === 'ADMIN');

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        esAdmin,
        login,
        registro,
        logout,
        agregarHijo,
        eliminarHijo,
        actualizarHijos,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
