'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UsuarioPadre, Hijo, RolUsuario } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

interface AuthContextType {
  usuario: UsuarioPadre | null;
  cargando: boolean;
  esAdmin: boolean;
  esSuperAdmin: boolean;
  login: (identificador: string, password?: string) => Promise<{ ok: boolean; error?: string; esAdmin?: boolean; esSuperAdmin?: boolean }>;
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
  actualizarPerfil: (datos: {
    nombreCompleto: string;
    telefono: string;
    dni?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function sincronizarCookieSesion(u: UsuarioPadre | null) {
  if (typeof document === 'undefined') return;
  const esHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secureFlag = esHttps ? '; Secure' : '';
  const maxAge = 2592000; // 30 días de persistencia

  let usuarioFinal = u;
  // Si u es null, intentar recuperar de localStorage antes de decidir borrar la cookie
  if (!usuarioFinal && typeof window !== 'undefined') {
    try {
      const ses = localStorage.getItem('sesion_padre_almuerzos');
      if (ses) {
        const parsed = JSON.parse(ses);
        if (parsed && parsed.rol) {
          usuarioFinal = parsed;
        }
      }
    } catch (_) {}
  }

  if (usuarioFinal && usuarioFinal.rol) {
    document.cookie = `sesion_rol=${encodeURIComponent(usuarioFinal.rol)}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
    document.cookie = `sesion_activa=1; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
  } else if (u === null && !usuarioFinal) {
    // Solo borrar si explícitamente no hay sesión en memoria ni en localStorage
    document.cookie = `sesion_rol=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
    document.cookie = `sesion_activa=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
  }
}

// Sincronización inmediata al cargar el bundle en el navegador si hay sesión previa en localStorage
if (typeof window !== 'undefined') {
  try {
    const ses = localStorage.getItem('sesion_padre_almuerzos');
    if (ses) {
      const parsed = JSON.parse(ses);
      if (parsed && parsed.rol) {
        sincronizarCookieSesion(parsed);
      }
    }
  } catch (_) {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicialización síncrona desde localStorage para evitar estado null inicial y pérdida de cookies
  const [usuario, setUsuario] = useState<UsuarioPadre | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const ses = localStorage.getItem('sesion_padre_almuerzos');
        if (ses) {
          const parsed = JSON.parse(ses);
          if (parsed && parsed.rol) {
            sincronizarCookieSesion(parsed);
            return parsed;
          }
        }
      } catch (_) {}
    }
    return null;
  });

  const [cargando, setCargando] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const ses = localStorage.getItem('sesion_padre_almuerzos');
        if (ses) return false;
      } catch (_) {}
    }
    return true;
  });

  // Sincronizar cookie de sesión cuando cambia el usuario, sin borrar cookies en el montaje inicial
  useEffect(() => {
    if (usuario) {
      sincronizarCookieSesion(usuario);
    }
  }, [usuario]);

  const resolverColegioAsignadoAdmin = async (
    adminId: string,
    dni: string,
    email?: string
  ): Promise<string | undefined> => {
    if (!isSupabaseConfigured || !supabase) return undefined;
    try {
      // 1. Buscar en tabla colegios por campo sede que contiene "| ADM-DNI"
      const { data: cols } = await supabase
        .from('colegios')
        .select('nombre, sede')
        .order('created_at', { ascending: false });

      if (cols) {
        const colMatch = cols.find(
          (c) =>
            c.sede &&
            (c.sede.includes(`| ${dni}`) ||
              c.sede.includes(dni) ||
              (email && c.sede.includes(email)))
        );
        if (colMatch) {
          return colMatch.nombre;
        }
      }

      // 2. Si no encontró en sede, revisar el registro central de admins en menus_dia SABADO
      const { data: configRow } = await supabase
        .from('menus_dia')
        .select('mensaje_aviso')
        .eq('dia_semana', 'SABADO')
        .maybeSingle();
      if (configRow && configRow.mensaje_aviso) {
        try {
          const cfg = JSON.parse(configRow.mensaje_aviso);
          if (cfg.adminsColegio) {
            for (const [colNombre, adminInfo] of Object.entries(cfg.adminsColegio as Record<string, { id?: string; dni?: string; email?: string; adminId?: string }>)) {
              const matchId = (adminInfo.id && adminInfo.id === adminId) || (adminInfo.adminId && adminInfo.adminId === adminId);
              const matchDni = dni && adminInfo.dni && adminInfo.dni.trim() === dni.trim();
              const matchEmail = email && adminInfo.email && adminInfo.email.trim().toLowerCase() === email.trim().toLowerCase();
              if (matchId || matchDni || matchEmail) {
                return colNombre;
              }
            }
          }
        } catch {
          // Fallback silencioso si el JSON es inválido
        }
      }

      // 3. Fallback inteligente: si hay un único colegio registrado en el sistema y el usuario es admin, vincularlo
      if (cols && cols.length === 1 && cols[0].nombre) {
        return cols[0].nombre;
      }
    } catch (e) {
      console.warn('Error resolviendo colegio asignado para admin:', e);
    }

    // 3. Fallback a localStorage si offline o en caché
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('config_admins_colegio');
        if (cached) {
          const map = JSON.parse(cached);
          for (const [colNombre, adminInfo] of Object.entries(map as Record<string, { dni?: string; email?: string; adminId?: string }>)) {
            if (adminInfo.dni === dni || (email && adminInfo.email === email)) {
              return colNombre;
            }
          }
        }
      } catch {
        // Fallback silencioso
      }
    }

    return undefined;
  };

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

  // Cargar sesión guardada y re-verificar contra la base de datos
  useEffect(() => {
    let montado = true;

    const inicializarSesion = async () => {
      const sesionGuardada = typeof window !== 'undefined' ? localStorage.getItem('sesion_padre_almuerzos') : null;
      if (!sesionGuardada) {
        if (montado) setCargando(false);
        return;
      }

      let u: UsuarioPadre | null = null;
      try {
        u = JSON.parse(sesionGuardada);
      } catch (e) {
        console.error('Error restaurando sesión:', e);
        if (typeof window !== 'undefined') localStorage.removeItem('sesion_padre_almuerzos');
        if (montado) {
          setUsuario(null);
          setCargando(false);
        }
        return;
      }

      if (!u || !u.id) {
        if (typeof window !== 'undefined') localStorage.removeItem('sesion_padre_almuerzos');
        if (montado) {
          setUsuario(null);
          setCargando(false);
        }
        return;
      }

      // Si Supabase está configurado, re-verificar identidad y privilegios legítimos en la base de datos
      if (isSupabaseConfigured && supabase) {
        try {
          const esUuid = Boolean(u.id && u.id.length === 36 && u.id.includes('-'));
          const query = esUuid
            ? supabase.from('perfiles_padres').select('id, nombre_completo, dni, telefono, email, rol, activo').eq('id', u.id)
            : (u.dni
                ? supabase.from('perfiles_padres').select('id, nombre_completo, dni, telefono, email, rol, activo').eq('dni', u.dni)
                : supabase.from('perfiles_padres').select('id, nombre_completo, dni, telefono, email, rol, activo').eq('id', u.id));

          const { data: perfilData, error: errInicial } = await query.maybeSingle();
          let error = errInicial;
          let perfil: {
            id: string;
            nombre_completo: string;
            dni: string;
            telefono: string;
            email: string;
            rol: RolUsuario;
            activo?: boolean | null;
          } | null = perfilData as {
            id: string;
            nombre_completo: string;
            dni: string;
            telefono: string;
            email: string;
            rol: RolUsuario;
            activo?: boolean | null;
          } | null;

          // Si el error fue porque la columna 'activo' no existe aún en el esquema de Supabase, reintentar con columnas estándar
          if (error && (error.code === '42703' || error.message?.includes('activo') || error.code === 'PGRST204')) {
            const fallbackQuery = esUuid
              ? supabase.from('perfiles_padres').select('id, nombre_completo, dni, telefono, email, rol').eq('id', u.id)
              : (u.dni
                  ? supabase.from('perfiles_padres').select('id, nombre_completo, dni, telefono, email, rol').eq('dni', u.dni)
                  : supabase.from('perfiles_padres').select('id, nombre_completo, dni, telefono, email, rol').eq('id', u.id));
            const resFallback = await fallbackQuery.maybeSingle();
            if (!resFallback.error) {
              perfil = resFallback.data as {
                id: string;
                nombre_completo: string;
                dni: string;
                telefono: string;
                email: string;
                rol: RolUsuario;
                activo?: boolean | null;
              } | null;
              error = null;
            }
          }

          // Si es cuenta bootstrap (superadmin o admin inicial) y aún no está en BD, no desloguear
          if (!perfil) {
            const esBootstrapSuperAdmin = (u.dni === '00000001' || u.id === 'superadmin-sistema-id') && u.rol === 'SUPER_ADMIN';
            const esBootstrapAdmin = (u.dni === '00000000' || u.id === 'admin-sistema-id') && u.rol === 'ADMIN';
            if (esBootstrapSuperAdmin || esBootstrapAdmin) {
              if (montado) {
                setUsuario(u);
                setCargando(false);
              }
              return;
            }
          }

          // Si hubo un fallo de red o conectividad temporal con Supabase, mantener la sesión local
          if (error && (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('Failed to fetch'))) {
            console.warn('Aviso de conectividad al revalidar sesión con base de datos:', error.message);
            if (montado) {
              setUsuario(u);
              setCargando(false);
            }
            return;
          }

          // Si el perfil fue borrado o desactivado en base de datos, invalidar sesión de inmediato
          if (error || !perfil || perfil.activo === false) {
            console.warn('Sesión no encontrada o cuenta inactiva en base de datos. Cerrando sesión.');
            if (typeof window !== 'undefined') localStorage.removeItem('sesion_padre_almuerzos');
            sincronizarCookieSesion(null);
            if (montado) {
              setUsuario(null);
              setCargando(false);
            }
            return;
          }

          // Imponer el rol real guardado en la base de datos (previene escalado de privilegios en localStorage)
          const rolReal: RolUsuario =
            perfil.rol === 'SUPER_ADMIN' || perfil.dni === '00000001'
              ? 'SUPER_ADMIN'
              : perfil.rol === 'ADMIN' || perfil.dni === '00000000'
              ? 'ADMIN'
              : 'PADRE';

          let colegioAsignado: string | undefined = u.colegioNombre;
          if (rolReal === 'ADMIN') {
            const col = await resolverColegioAsignadoAdmin(perfil.id, perfil.dni, perfil.email);
            if (col) colegioAsignado = col;
          }

          const hijosActualizados =
            rolReal === 'PADRE' ? (await cargarHijosDeSupabase(perfil.id)) || u.hijos || [] : [];

          const usuarioVerificado: UsuarioPadre = {
            id: perfil.id,
            nombreCompleto: perfil.nombre_completo,
            dni: perfil.dni,
            telefono: perfil.telefono,
            email: perfil.email,
            rol: rolReal,
            colegioNombre: colegioAsignado,
            hijos: hijosActualizados,
          };

          if (montado) {
            setUsuario(usuarioVerificado);
            sincronizarCookieSesion(usuarioVerificado);
            if (typeof window !== 'undefined') {
              localStorage.setItem('sesion_padre_almuerzos', JSON.stringify(usuarioVerificado));
            }
            setCargando(false);
          }
          return;
        } catch (err) {
          console.error('Error re-verificando perfil con base de datos:', err);
        }
      }

      // Modo local / offline
      if (montado) {
        setUsuario(u);
        setCargando(false);
      }
    };

    inicializarSesion();

    return () => {
      montado = false;
    };
  }, []);

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
        sincronizarCookieSesion(nuevoUsuario);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sesion_padre_almuerzos', JSON.stringify(nuevoUsuario));
        }
        return { ok: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { ok: false, error: msg || 'Error en el registro' };
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('sesion_padre_almuerzos', JSON.stringify(nuevoUsuario));
      }
      return { ok: true };
    }
  };

  const login = async (identificador: string, password?: string) => {
    const idLimpio = identificador.trim();

    if (isSupabaseConfigured && supabase) {
      try {
        // Buscar por DNI primero, luego por email si aplica
        const query = supabase
          .from('perfiles_padres')
          .select('*')
          .eq('dni', idLimpio);

        const { data: dataDni } = await query.maybeSingle();
        let data = dataDni;

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
          // Si no está en BD pero son credenciales de bootstrap de superadmin/admin inicial
          if (
            (idLimpio === '00000001' ||
              idLimpio.toLowerCase() === 'superadmin' ||
              idLimpio.toLowerCase() === 'superadmin@almuerzos.com') &&
            password === 'superadmin123'
          ) {
            const superAdminUser: UsuarioPadre = {
              id: 'superadmin-sistema-id',
              nombreCompleto: 'Super Administrador',
              dni: '00000001',
              telefono: '999999998',
              email: 'superadmin@almuerzos.com',
              rol: 'SUPER_ADMIN',
              hijos: [],
            };
            setUsuario(superAdminUser);
            sincronizarCookieSesion(superAdminUser);
            if (typeof window !== 'undefined') {
              localStorage.setItem('sesion_padre_almuerzos', JSON.stringify(superAdminUser));
            }
            return { ok: true, esAdmin: true, esSuperAdmin: true };
          }

          if ((idLimpio === '00000000' || idLimpio.toLowerCase() === 'admin') && password === 'admin123') {
            const adminUser: UsuarioPadre = {
              id: 'admin-sistema-id',
              nombreCompleto: 'Administrador General',
              dni: '00000000',
              telefono: '999999999',
              email: 'admin@almuerzos.com',
              rol: 'ADMIN',
              hijos: [],
            };
            setUsuario(adminUser);
            sincronizarCookieSesion(adminUser);
            if (typeof window !== 'undefined') {
              localStorage.setItem('sesion_padre_almuerzos', JSON.stringify(adminUser));
            }
            return { ok: true, esAdmin: true, esSuperAdmin: false };
          }

          return { ok: false, error: 'No se encontró una cuenta con ese DNI o credencial.' };
        }

        if (data.activo === false) {
          return { ok: false, error: 'Esta cuenta ha sido desactivada por el administrador.' };
        }

        if (password && data.password_hash && data.password_hash !== password) {
          return { ok: false, error: 'Contraseña incorrecta.' };
        }

        const esSuperAdmin = data.rol === 'SUPER_ADMIN' || data.dni === '00000001';
        const esAdmin = esSuperAdmin || data.rol === 'ADMIN' || data.dni === '00000000';
        const hijos = esAdmin ? [] : (await cargarHijosDeSupabase(data.id)) || [];

        // Si es administrador regular (no superadmin), detectar colegio asignado
        let colegioAsignado: string | undefined = undefined;
        if (esAdmin && !esSuperAdmin) {
          colegioAsignado = await resolverColegioAsignadoAdmin(data.id, data.dni, data.email);
        }

        const rolFinal: RolUsuario = esSuperAdmin ? 'SUPER_ADMIN' : esAdmin ? 'ADMIN' : 'PADRE';

        const u: UsuarioPadre = {
          id: data.id,
          nombreCompleto: data.nombre_completo,
          dni: data.dni,
          telefono: data.telefono,
          email: data.email,
          rol: rolFinal,
          colegioNombre: colegioAsignado,
          hijos,
        };

        setUsuario(u);
        sincronizarCookieSesion(u);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sesion_padre_almuerzos', JSON.stringify(u));
        }
        return { ok: true, esAdmin, esSuperAdmin };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { ok: false, error: msg || 'Error al iniciar sesión' };
      }
    } else {
      // Modo local/fallback cuando Supabase no está configurado (tests, demo)
      if (
        (idLimpio === '00000001' ||
          idLimpio.toLowerCase() === 'superadmin' ||
          idLimpio.toLowerCase() === 'superadmin@almuerzos.com') &&
        password === 'superadmin123'
      ) {
        const superAdminUser: UsuarioPadre = {
          id: 'superadmin-sistema-id',
          nombreCompleto: 'Super Administrador',
          dni: '00000001',
          telefono: '999999998',
          email: 'superadmin@almuerzos.com',
          rol: 'SUPER_ADMIN',
          hijos: [],
        };
        setUsuario(superAdminUser);
        sincronizarCookieSesion(superAdminUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sesion_padre_almuerzos', JSON.stringify(superAdminUser));
        }
        return { ok: true, esAdmin, esSuperAdmin, };
      }

      if ((idLimpio === '00000000' || idLimpio.toLowerCase() === 'admin') && password === 'admin123') {
        const adminUser: UsuarioPadre = {
          id: 'admin-sistema-id',
          nombreCompleto: 'Administrador General',
          dni: '00000000',
          telefono: '999999999',
          email: 'admin@almuerzos.com',
          rol: 'ADMIN',
          hijos: [],
        };
        setUsuario(adminUser);
        sincronizarCookieSesion(adminUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sesion_padre_almuerzos', JSON.stringify(adminUser));
        }
        return { ok: true, esAdmin, esSuperAdmin: false };
      }

      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem('sesion_padre_almuerzos');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && (parsed.dni === idLimpio || parsed.email === idLimpio)) {
              setUsuario(parsed);
              return { ok: true, esAdmin: false, esSuperAdmin: false };
            }
          }
        } catch (_) {}
      }

      return { ok: false, error: 'No se encontró una cuenta con ese DNI o credencial.' };
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sesion_padre_almuerzos');
    }
    setUsuario(null);
    sincronizarCookieSesion(null);
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
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { ok: false, error: msg || 'Error guardando en Supabase' };
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
        const { error } = await supabase.from('hijos').delete().eq('id', hijoId);
        if (error) {
          console.error('Error eliminando hijo en base de datos:', error);
          return { ok: false, error: error.message || 'Error al eliminar el estudiante en base de datos' };
        }
      } catch (err: unknown) {
        console.error('Error eliminando hijo:', err);
        const msg = err instanceof Error ? err.message : String(err);
        return { ok: false, error: msg || 'Error de conexión al eliminar hijo' };
      }
    }

    const hijosActualizados = usuario.hijos.filter((h) => h.id !== hijoId);
    const usuarioActualizado = { ...usuario, hijos: hijosActualizados };
    setUsuario(usuarioActualizado);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sesion_padre_almuerzos', JSON.stringify(usuarioActualizado));
    }

    return { ok: true };
  };

  const actualizarHijos = async () => {
    if (!usuario || usuario.rol === 'ADMIN' || usuario.rol === 'SUPER_ADMIN') return;
    const hijos = await cargarHijosDeSupabase(usuario.id);
    if (hijos) {
      const u = { ...usuario, hijos };
      setUsuario(u);
      if (typeof window !== 'undefined') {
        localStorage.setItem('sesion_padre_almuerzos', JSON.stringify(u));
      }
    }
  };

  const actualizarPerfil = async (datos: {
    nombreCompleto: string;
    telefono: string;
    dni?: string;
  }) => {
    if (!usuario) {
      return { ok: false, error: 'No hay una sesión activa.' };
    }

    const nombreLimpio = datos.nombreCompleto.trim();
    const telLimpio = datos.telefono.trim();
    const dniLimpio = datos.dni ? datos.dni.trim() : usuario.dni;

    if (!nombreLimpio) {
      return { ok: false, error: 'El nombre completo es requerido.' };
    }
    if (!telLimpio) {
      return { ok: false, error: 'El número de teléfono es requerido.' };
    }
    if (!dniLimpio) {
      return { ok: false, error: 'El DNI es requerido.' };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('perfiles_padres')
          .update({
            nombre_completo: nombreLimpio,
            telefono: telLimpio,
            dni: dniLimpio,
            updated_at: new Date().toISOString(),
          })
          .eq('id', usuario.id);

        if (error) {
          console.error('Error actualizando perfil en Supabase:', error);
          return { ok: false, error: error.message || 'Error al actualizar perfil en base de datos' };
        }
      } catch (err: unknown) {
        console.error('Error de conexión al actualizar perfil:', err);
        const msg = err instanceof Error ? err.message : String(err);
        return { ok: false, error: msg || 'Error de conexión al actualizar perfil' };
      }
    }

    const usuarioActualizado: UsuarioPadre = {
      ...usuario,
      nombreCompleto: nombreLimpio,
      telefono: telLimpio,
      dni: dniLimpio,
    };

    setUsuario(usuarioActualizado);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sesion_padre_almuerzos', JSON.stringify(usuarioActualizado));
    }

    return { ok: true };
  };

  const esSuperAdmin = Boolean(usuario && usuario.rol === 'SUPER_ADMIN');
  const esAdmin = Boolean(usuario && (usuario.rol === 'ADMIN' || usuario.rol === 'SUPER_ADMIN'));

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        esAdmin,
        esSuperAdmin,
        login,
        registro,
        logout,
        agregarHijo,
        eliminarHijo,
        actualizarHijos,
        actualizarPerfil,
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
