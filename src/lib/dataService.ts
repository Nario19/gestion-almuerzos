import {
  Pedido,
  Plato,
  MenuDia,
  ResumenCocina,
  EstadoPedido,
  EstadoPago,
  MetodoPago,
  RolUsuario,
  DiaSemana,
  ColegioDetallado,
  AdminColegioInfo,
  PadreFiadoResumen,
  ItemFiadoPedido,
  EstudianteColegioInfo,
} from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';

export const COLEGIOS_DEFAULT: string[] = [];

export const GRADOS_DEFAULT = [
  '1.° Primaria',
  '2.° Primaria',
  '3.° Primaria',
  '4.° Primaria',
  '5.° Primaria A',
  '5.° Primaria B',
  '6.° Primaria',
  '1.° Secundaria (7mo)',
  '2.° Secundaria (8vo)',
  '3.° Secundaria (9no C)',
  '3.° Secundaria (9no A)',
  '4.° Secundaria',
  '5.° Secundaria',
];

export const OBSERVACIONES_DEFAULT = [
  'Sin cebolla',
  'Poca crema',
  'Sin ensalada',
  'Presa sin piel',
  'Solo segundo',
];

import {
  obtenerFechaHoyPeru,
  obtenerFechaPeruDeIso,
  obtenerDiaActualSemanaPeru,
  obtenerHoraActualPeru,
} from '@/lib/dateUtils';

export const DIAS_SEMANA: { key: DiaSemana; label: string; short: string }[] = [
  { key: 'LUNES', label: 'Lunes', short: 'Lun' },
  { key: 'MARTES', label: 'Martes', short: 'Mar' },
  { key: 'MIERCOLES', label: 'Miércoles', short: 'Mié' },
  { key: 'JUEVES', label: 'Jueves', short: 'Jue' },
  { key: 'VIERNES', label: 'Viernes', short: 'Vie' },
];

export function obtenerDiaActualSemana(): DiaSemana {
  return obtenerDiaActualSemanaPeru();
}

interface PedidoRowSupabase {
  id: string;
  codigo?: string | null;
  fecha?: string | null;
  created_at?: string | null;
  colegio_nombre?: string | null;
  colegio_id?: string | null;
  padre_id?: string | null;
  padre_nombre?: string | null;
  padre_telefono?: string | null;
  estudiante_nombre?: string | null;
  grado_seccion?: string | null;
  entrada_nombre?: string | null;
  segundo_nombre?: string | null;
  precio_total?: number | string | null;
  monto?: number | string | null;
  metodo_pago?: MetodoPago | null;
  estado_pago?: EstadoPago | null;
  estado_pedido?: EstadoPedido | null;
  comprobante_url?: string | null;
  observacion?: string | null;
  hora_entrega?: string | null;
}

interface PlatoRowSupabase {
  id: string;
  dia?: string | null;
  dia_semana?: string | null;
  tipo?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
  imagen_url?: string | null;
  precio?: number | string | null;
  disponible?: boolean | null;
  colegio_nombre?: string | null;
  colegio_id?: string | null;
}

interface PerfilAdminRow {
  id: string;
  nombre_completo: string;
  dni: string;
  email: string;
  telefono: string;
  rol: string;
  password_hash?: string;
}

interface HijoRowSupabase {
  id: string;
  padre_id: string;
  nombre_completo?: string | null;
  colegio_nombre?: string | null;
  colegio_id?: string | null;
  grado_seccion?: string | null;
  alergias_notas?: string | null;
  created_at?: string | null;
}

interface ConfigMenusDiaObj {
  grados?: string[];
  observaciones?: string[];
  adminsColegio?: Record<string, AdminColegioInfo>;
  gradosPorColegio?: Record<string, string[]>;
  observacionesPorColegio?: Record<string, string[]>;
}

interface ObservacionCocinaItem {
  estudiante: string;
  grado: string;
  colegio: string;
  observacion: string;
}

interface FiltroColegioParam {
  colegioId?: string;
  colegioNombre?: string;
}

// Catálogo inicial vacío: NO hay platos inventados; todo se gestiona desde la BD por colegio
export const PLATOS_INICIALES: Plato[] = [];

let platosMemoria: Plato[] = [];
const pedidosMemoria: Pedido[] = [];
let colegiosMemoria: string[] = [];
let colegiosDetalladosMemoria: ColegioDetallado[] = [];
let gradosMemoria: string[] = [...GRADOS_DEFAULT];
let observacionesMemoria: string[] = [...OBSERVACIONES_DEFAULT];
const gradosPorColegioMemoria: Record<string, string[]> = {};
const observacionesPorColegioMemoria: Record<string, string[]> = {};

if (typeof window !== 'undefined') {
  try {
    const c = localStorage.getItem('config_colegios');
    if (c) {
      const parsed = JSON.parse(c);
      if (Array.isArray(parsed) && parsed.length > 0) colegiosMemoria = parsed;
    }
    const cd = localStorage.getItem('config_colegios_detallados');
    if (cd) {
      const parsed = JSON.parse(cd);
      if (Array.isArray(parsed) && parsed.length > 0) colegiosDetalladosMemoria = parsed;
    }
    const g = localStorage.getItem('config_grados');
    if (g) {
      const parsed = JSON.parse(g);
      if (Array.isArray(parsed) && parsed.length > 0) gradosMemoria = parsed;
    }
    const o = localStorage.getItem('config_observaciones');
    if (o) {
      const parsed = JSON.parse(o);
      if (Array.isArray(parsed) && parsed.length > 0) observacionesMemoria = parsed;
    }
  } catch (_) {}
}

const listeners: (() => void)[] = [];

function notifyListeners() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (_) {}
  });
}

const LOCAL_STORAGE_HORAS_KEY = 'pedidos_horas_entrega';

function obtenerMapaHorasEntrega(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_HORAS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function guardarHoraEntregaLocal(id: string, hora: string) {
  if (typeof window === 'undefined') return;
  try {
    const map = obtenerMapaHorasEntrega();
    map[id] = hora;
    localStorage.setItem(LOCAL_STORAGE_HORAS_KEY, JSON.stringify(map));
  } catch (_) {}
}

function eliminarHoraEntregaLocal(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const map = obtenerMapaHorasEntrega();
    delete map[id];
    localStorage.setItem(LOCAL_STORAGE_HORAS_KEY, JSON.stringify(map));
  } catch (_) {}
}

function mapearPedidoDesdeSupabase(d: PedidoRowSupabase, mapLocal: Record<string, string>): Pedido {
  let horaEntrega = d.hora_entrega || mapLocal[d.id] || undefined;
  let obs = d.observacion;
  if (obs && obs.includes('[Entregado:')) {
    const match = obs.match(/\[Entregado:\s*([^\]]+)\]/);
    if (match) {
      horaEntrega = match[1].trim();
      obs = obs.replace(/\s*•?\s*\[Entregado:\s*[^\]]+\]/, '').trim() || undefined;
    }
  }

  let padreNombre = d.padre_nombre || undefined;
  if (obs && obs.includes('[Padre:')) {
    const matchPadre = obs.match(/\[Padre:\s*([^\]]+)\]/);
    if (matchPadre) {
      padreNombre = matchPadre[1].trim();
      obs = obs.replace(/\s*•?\s*\[Padre:\s*[^\]]+\]/, '').trim() || undefined;
    }
  }

  let colegioId = d.colegio_id || undefined;
  if (obs && obs.includes('[ColegioId:')) {
    const matchColId = obs.match(/\[ColegioId:\s*([^\]]+)\]/);
    if (matchColId) {
      colegioId = matchColId[1].trim();
      obs = obs.replace(/\s*•?\s*\[ColegioId:\s*[^\]]+\]/, '').trim() || undefined;
    }
  }

  // Normalización defensiva de fecha según la zona horaria de Perú (America/Lima)
  const fechaNormalizada = d.created_at
    ? obtenerFechaPeruDeIso(d.created_at)
    : (d.fecha || obtenerFechaHoyPeru());

  return {
    id: d.id,
    codigoPedido: d.codigo || (d as { codigo_pedido?: string }).codigo_pedido || '',
    fecha: fechaNormalizada,
    diaSemana: (d as { dia_semana?: DiaSemana }).dia_semana,
    padreId: d.padre_id || '',
    padreNombre: padreNombre || undefined,
    hijoId: (d as { hijo_id?: string }).hijo_id,
    colegioId,
    colegioNombre: d.colegio_nombre || '',
    gradoSeccion: d.grado_seccion || '',
    estudianteNombre: d.estudiante_nombre || '',
    telefonoContacto: d.padre_telefono || (d as { telefono_contacto?: string }).telefono_contacto || '',
    entradaNombre: d.entrada_nombre || '',
    segundoNombre: d.segundo_nombre || '',
    observacion: obs || undefined,
    metodoPago: d.metodo_pago || 'Pagar luego',
    estadoPago: d.estado_pago || 'PENDIENTE',
    estadoPedido: d.estado_pedido || 'REGISTRADO',
    comprobanteUrl: d.comprobante_url || undefined,
    monto: Number(d.monto) || Number(d.precio_total) || 12.0,
    createdAt: d.created_at || new Date().toISOString(),
    horaEntrega,
  };
}

function mapearPlatoDesdeSupabase(d: PlatoRowSupabase): Plato {
  let colegioNombre: string | undefined = d.colegio_nombre || undefined;
  let colegioId: string | undefined = d.colegio_id || undefined;
  let tipoFinal: string = d.tipo || 'Segundo';
  if (tipoFinal === 'ENTRADA') tipoFinal = 'Sopa o postre';
  else if (tipoFinal === 'SEGUNDO') tipoFinal = 'Segundo';

  let descLimpia = d.descripcion || '';
  if (descLimpia) {
    const matchTipo = descLimpia.match(/\[TipoOriginal:\s*([^\]]+)\]/);
    if (matchTipo) {
      tipoFinal = matchTipo[1].trim();
      descLimpia = descLimpia.replace(/\s*\[TipoOriginal:\s*[^\]]+\]/, '').trim();
    }
    const matchId = descLimpia.match(/\[ColegioId:\s*([^\]]+)\]/);
    if (matchId) {
      colegioId = matchId[1].trim();
      descLimpia = descLimpia.replace(/\s*\[ColegioId:\s*[^\]]+\]/, '').trim();
    }
    const match = descLimpia.match(/\[Colegio:\s*([^\]]+)\]/);
    if (match) {
      colegioNombre = match[1].trim();
      descLimpia = descLimpia.replace(/\s*•?\s*\[Colegio:\s*[^\]]+\]/, '').trim();
    }
  }
  return {
    id: d.id,
    menuId: (d as { menu_id?: string }).menu_id,
    colegioId,
    colegioNombre,
    diaSemana: (d.dia_semana || d.dia || 'LUNES') as DiaSemana,
    tipo: tipoFinal,
    nombre: d.nombre || '',
    descripcion: descLimpia || undefined,
    precio: Number(d.precio) || 12.0,
    imagenUrl: d.imagen_url || undefined,
    disponible: d.disponible ?? true,
    orden: (d as { orden?: number }).orden || 1,
  };
}

export const dataService = {
  async obtenerPlatosPorDia(dia: DiaSemana, colegioNombre?: string | FiltroColegioParam): Promise<Plato[]> {
    const colegioIdONombre =
      typeof colegioNombre === 'object' && colegioNombre !== null
        ? (colegioNombre.colegioNombre || colegioNombre.colegioId)
        : colegioNombre;

    let platos: Plato[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('platos')
          .select('*')
          .eq('dia_semana', dia)
          .order('orden', { ascending: true });

        if (!error && data && data.length > 0) {
          platos = data.map(mapearPlatoDesdeSupabase);
        }
      } catch (e) {
        console.warn('Error trayendo platos de Supabase, usando memoria:', e);
      }
    }
    if (platos.length === 0) {
      platos = platosMemoria.filter((p) => p.diaSemana === dia);
    }

    if (!colegioIdONombre) {
      return platos;
    }

    let targetId = '';
    let targetNombre = '';

    if (typeof colegioNombre === 'object' && colegioNombre !== null) {
      targetId = (colegioNombre.colegioId || '').toLowerCase().trim();
      targetNombre = (colegioNombre.colegioNombre || '').toLowerCase().trim();
    }

    if (typeof colegioIdONombre === 'string') {
      const val = colegioIdONombre.toLowerCase().trim();
      if (val === 'todos' || !val) {
        return platos;
      }
      if (!targetId) targetId = val;
      if (!targetNombre) targetNombre = val;
    }

    if (!targetId && !targetNombre) {
      return platos;
    }

    // Filtrar platos estrictamente por Colegio ID o Nombre para independencia total
    const platosColegio = platos.filter((p) => {
      const pId = (p.colegioId || '').toLowerCase().trim();
      const pNom = (p.colegioNombre || '').toLowerCase().trim();

      if (targetId && (pId === targetId || pNom === targetId)) return true;
      if (targetNombre && (pNom === targetNombre || pId === targetNombre)) return true;
      return false;
    });

    // Cada colegio es independiente: sólo devuelve platos de ese colegio
    return platosColegio;
  },

  async agregarPlato(platoData: Omit<Plato, 'id'>): Promise<Plato> {
    const nuevoPlato: Plato = {
      ...platoData,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `plato-${Date.now()}`,
    };

    // Mapeo seguro para el constraint 'platos_tipo_check' de la BD ('ENTRADA' | 'SEGUNDO' | 'BEBIDA' | 'POSTRE')
    let tipoColumna: 'ENTRADA' | 'SEGUNDO' | 'BEBIDA' | 'POSTRE' = 'SEGUNDO';
    const tipoNormalizado = (nuevoPlato.tipo || '').trim().toUpperCase();
    if (tipoNormalizado === 'ENTRADA' || tipoNormalizado.includes('SOPA')) {
      tipoColumna = 'ENTRADA';
    } else if (tipoNormalizado === 'BEBIDA') {
      tipoColumna = 'BEBIDA';
    } else if (tipoNormalizado === 'POSTRE') {
      tipoColumna = 'POSTRE';
    } else {
      tipoColumna = 'SEGUNDO';
    }

    let descFinal = nuevoPlato.descripcion || '';
    if (nuevoPlato.tipo) {
      descFinal = `[TipoOriginal: ${nuevoPlato.tipo}] ${descFinal}`.trim();
    }
    if (nuevoPlato.colegioId) {
      descFinal = `[ColegioId: ${nuevoPlato.colegioId}] ${descFinal}`.trim();
    }
    if (nuevoPlato.colegioNombre && nuevoPlato.colegioNombre !== 'TODOS') {
      descFinal = `${descFinal} [Colegio: ${nuevoPlato.colegioNombre}]`.trim();
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('platos')
          .insert([
            {
              dia_semana: nuevoPlato.diaSemana,
              tipo: tipoColumna,
              nombre: nuevoPlato.nombre,
              descripcion: descFinal || null,
              precio: nuevoPlato.precio,
              imagen_url: nuevoPlato.imagenUrl,
              disponible: nuevoPlato.disponible,
              orden: nuevoPlato.orden,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error('Error insertando plato en Supabase:', error);
          throw new Error(`Error en base de datos al guardar plato: ${error.message}`);
        }
        if (data) {
          nuevoPlato.id = data.id;
        }
      } catch (e: unknown) {
        console.error('Error en agregarPlato:', e);
        throw e;
      }
    }

    platosMemoria.push(nuevoPlato);
    notifyListeners();
    return nuevoPlato;
  },

  async eliminarPlato(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('platos').delete().eq('id', id);
      } catch (e) {
        console.error('Error eliminando plato en Supabase:', e);
      }
    }
    platosMemoria = platosMemoria.filter((p) => p.id !== id);
    notifyListeners();
  },

  async obtenerPedidos(opciones?: { limit?: number; offset?: number }): Promise<Pedido[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('pedidos')
          .select('*')
          .order('created_at', { ascending: false });

        if (typeof opciones?.limit === 'number' && opciones.limit > 0) {
          const from = opciones.offset || 0;
          const to = from + opciones.limit - 1;
          query = query.range(from, to);
        }

        const { data, error } = await query;

        if (!error && data) {
          const mapLocal = obtenerMapaHorasEntrega();
          return data.map((d) => mapearPedidoDesdeSupabase(d, mapLocal));
        }
      } catch (err) {
        console.warn('Error leyendo pedidos de Supabase:', err);
      }
    }
    const mem = [...pedidosMemoria];
    if (typeof opciones?.limit === 'number' && opciones.limit > 0) {
      const from = opciones.offset || 0;
      return mem.slice(from, from + opciones.limit);
    }
    return mem;
  },

  async obtenerPedidosPorPadre(padreId?: string, telefono?: string): Promise<Pedido[]> {
    if (!padreId && !telefono) return [];
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('pedidos')
          .select('*')
          .order('created_at', { ascending: false });

        if (padreId && telefono) {
          query = query.or(`padre_id.eq.${padreId},telefono_contacto.eq.${telefono}`);
        } else if (padreId) {
          query = query.eq('padre_id', padreId);
        } else if (telefono) {
          query = query.eq('telefono_contacto', telefono);
        }

        const { data, error } = await query;
        if (!error && data) {
          const mapLocal = obtenerMapaHorasEntrega();
          return data.map((d) => mapearPedidoDesdeSupabase(d, mapLocal));
        }
      } catch (err) {
        console.warn('Error leyendo pedidos por padre de Supabase:', err);
      }
    }
    return pedidosMemoria.filter(
      (p) => (padreId && p.padreId === padreId) || (telefono && p.telefonoContacto === telefono)
    );
  },

  async crearPedido(
    pedidoData: Omit<Pedido, 'id' | 'codigoPedido' | 'createdAt' | 'fecha' | 'estadoPedido' | 'estadoPago'> & {
      estadoPago?: EstadoPago;
    }
  ): Promise<Pedido> {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const timePart = Date.now().toString().slice(-4);
    const randomCode = `ALM-${timePart}-${randomNum}`;
    const nuevo: Pedido = {
      ...pedidoData,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}`,
      codigoPedido: randomCode,
      fecha: obtenerFechaHoyPeru(),
      estadoPedido: 'REGISTRADO',
      estadoPago: pedidoData.estadoPago || 'PENDIENTE',
      createdAt: new Date().toISOString(),
    };

    let obsCompleta = nuevo.observacion || '';
    if (nuevo.padreNombre) {
      obsCompleta = obsCompleta ? `${obsCompleta} • [Padre: ${nuevo.padreNombre}]` : `[Padre: ${nuevo.padreNombre}]`;
    }
    if (nuevo.colegioId) {
      obsCompleta = `${obsCompleta} • [ColegioId: ${nuevo.colegioId}]`;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('pedidos')
          .insert([
            {
              codigo_pedido: nuevo.codigoPedido,
              fecha: nuevo.fecha,
              dia_semana: nuevo.diaSemana || 'HOY',
              padre_id: nuevo.padreId,
              hijo_id: nuevo.hijoId,
              colegio_nombre: nuevo.colegioNombre,
              grado_seccion: nuevo.gradoSeccion,
              estudiante_nombre: nuevo.estudianteNombre,
              telefono_contacto: nuevo.telefonoContacto,
              entrada_nombre: nuevo.entradaNombre,
              segundo_nombre: nuevo.segundoNombre,
              observacion: obsCompleta || null,
              metodo_pago: nuevo.metodoPago,
              estado_pago: nuevo.estadoPago,
              estado_pedido: nuevo.estadoPedido,
              comprobante_url: nuevo.comprobanteUrl,
              monto: nuevo.monto,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error('Error insertando pedido en Supabase:', error);
          throw new Error(`Error al registrar pedido: ${error.message || 'No se pudo guardar la orden'}`);
        }
        if (data) {
          nuevo.id = data.id;
        }
      } catch (err: unknown) {
        console.error('Fallo al crear pedido en Supabase:', err);
        throw err;
      }
    }

    pedidosMemoria.unshift(nuevo);
    notifyListeners();
    return nuevo;
  },

  async cambiarEstadoPedido(id: string, nuevoEstado: EstadoPedido, horaEntregaManual?: string): Promise<void> {
    const hora = nuevoEstado === 'ENTREGADO'
      ? (horaEntregaManual || obtenerHoraActualPeru())
      : undefined;

    const index = pedidosMemoria.findIndex((p) => p.id === id);
    let observacionExistente = index !== -1 ? (pedidosMemoria[index].observacion || '') : '';

    if (nuevoEstado === 'ENTREGADO' && hora) {
      guardarHoraEntregaLocal(id, hora);
    } else {
      eliminarHoraEntregaLocal(id);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        // Si no tenemos la observación en memoria, consultarla de Supabase para no borrar notas/alergias
        if (!observacionExistente) {
          const { data: pBD } = await supabase
            .from('pedidos')
            .select('observacion')
            .eq('id', id)
            .maybeSingle();
          if (pBD?.observacion) {
            observacionExistente = pBD.observacion;
          }
        }

        // Limpiar únicamente marcas de entrega previas conservando todas las notas, alergias y etiquetas
        const limpiaObs = observacionExistente.replace(/\s*•?\s*\[Entregado:\s*[^\]]+\]/g, '').trim();
        let nuevaObs: string | null = limpiaObs || null;

        if (nuevoEstado === 'ENTREGADO' && hora) {
          nuevaObs = limpiaObs ? `${limpiaObs} • [Entregado: ${hora}]` : `[Entregado: ${hora}]`;
        }

        await supabase
          .from('pedidos')
          .update({
            estado_pedido: nuevoEstado,
            observacion: nuevaObs,
          })
          .eq('id', id);

        // Actualizar la observación limpia en memoria para mantener consistencia
        if (index !== -1) {
          pedidosMemoria[index].observacion = nuevaObs || '';
        }
      } catch (e) {
        console.error('Error actualizando pedido en Supabase:', e);
      }
    }

    if (index !== -1) {
      pedidosMemoria[index] = {
        ...pedidosMemoria[index],
        estadoPedido: nuevoEstado,
        horaEntrega: hora,
      };
    }

    notifyListeners();
  },

  async cambiarEstadoPago(id: string, nuevoEstado: EstadoPago): Promise<void> {
    const index = pedidosMemoria.findIndex((p) => p.id === id);
    if (index !== -1) {
      pedidosMemoria[index] = { ...pedidosMemoria[index], estadoPago: nuevoEstado };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pedidos').update({ estado_pago: nuevoEstado }).eq('id', id);
      } catch (e) {
        console.error('Error actualizando pago en Supabase:', e);
      }
    }
    notifyListeners();
  },

  async obtenerFiados(colegioNombre?: string): Promise<PadreFiadoResumen[]> {
    let todosLosPedidos: Pedido[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('pedidos')
          .select('*')
          .in('metodo_pago', ['Pagar luego', 'Efectivo', 'pagar_luego'])
          .order('created_at', { ascending: false });

        if (colegioNombre && colegioNombre !== 'TODOS') {
          query = query.eq('colegio_nombre', colegioNombre);
        }

        const { data, error } = await query;
        if (!error && data) {
          const mapLocal = obtenerMapaHorasEntrega();
          todosLosPedidos = data.map((d) => mapearPedidoDesdeSupabase(d, mapLocal));
        }
      } catch (e) {
        console.error('Error obteniendo fiados de Supabase:', e);
      }
    }

    if (todosLosPedidos.length === 0) {
      todosLosPedidos = pedidosMemoria.filter(
        (p) => p.metodoPago === 'Pagar luego' || p.metodoPago === 'Efectivo'
      );
      if (colegioNombre && colegioNombre !== 'TODOS') {
        todosLosPedidos = todosLosPedidos.filter((p) => p.colegioNombre === colegioNombre);
      }
    }

    const mapaPadres: Record<string, { nombre: string; telefono: string }> = {};
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: padresData } = await supabase
          .from('perfiles_padres')
          .select('id, nombre_completo, telefono');
        if (padresData) {
          padresData.forEach((pad) => {
            mapaPadres[pad.id] = {
              nombre: pad.nombre_completo,
              telefono: pad.telefono || '',
            };
          });
        }
      } catch (_) {}
    }

    const gruposMap = new Map<string, {
      padreId?: string;
      nombrePadre: string;
      telefono: string;
      colegioNombre: string;
      hijosSet: Set<string>;
      pedidos: ItemFiadoPedido[];
      totalDeuda: number;
      pedidosEntregados: number;
    }>();

    todosLosPedidos.forEach((p) => {
      const clave = p.padreId || p.telefonoContacto || p.estudianteNombre;
      const datosPadre = p.padreId && mapaPadres[p.padreId] ? mapaPadres[p.padreId] : null;
      const nombrePadre = p.padreNombre || datosPadre?.nombre || `Padre de ${p.estudianteNombre}`;
      const telefono = datosPadre?.telefono || p.telefonoContacto || '';

      if (!gruposMap.has(clave)) {
        gruposMap.set(clave, {
          padreId: p.padreId,
          nombrePadre,
          telefono,
          colegioNombre: p.colegioNombre,
          hijosSet: new Set<string>(),
          pedidos: [],
          totalDeuda: 0,
          pedidosEntregados: 0,
        });
      }

      const g = gruposMap.get(clave)!;
      g.hijosSet.add(p.estudianteNombre);
      if (p.estadoPedido === 'ENTREGADO') {
        g.pedidosEntregados++;
      }
      if (p.estadoPago !== 'PAGADO') {
        g.totalDeuda += (Number(p.monto) || 12.0);
      }

      g.pedidos.push({
        id: p.id,
        codigoPedido: p.codigoPedido,
        fecha: p.fecha,
        diaSemana: p.diaSemana,
        hijoId: p.hijoId,
        estudianteNombre: p.estudianteNombre,
        gradoSeccion: p.gradoSeccion,
        colegioNombre: p.colegioNombre,
        entradaNombre: p.entradaNombre,
        segundoNombre: p.segundoNombre,
        monto: Number(p.monto) || 12.0,
        estadoPedido: p.estadoPedido,
        horaEntrega: p.horaEntrega,
        estadoPago: p.estadoPago,
        createdAt: p.createdAt,
      });
    });

    const resultado: PadreFiadoResumen[] = Array.from(gruposMap.values()).map((g) => ({
      padreId: g.padreId,
      nombrePadre: g.nombrePadre,
      telefono: g.telefono,
      colegioNombre: g.colegioNombre,
      hijosNombres: Array.from(g.hijosSet),
      totalDeuda: g.totalDeuda,
      totalPedidos: g.pedidos.length,
      pedidosEntregados: g.pedidosEntregados,
      pedidos: g.pedidos.sort((a, b) => (b.fecha > a.fecha ? 1 : -1)),
    }));

    return resultado.sort((a, b) => b.totalDeuda - a.totalDeuda);
  },

  async liquidarDeudaPadre(
    padreIdOTelefono: string,
    colegioNombre?: string,
    pedidoIds?: string[]
  ): Promise<{ ok: boolean; count: number; error?: string }> {
    let idsAActualizar: string[] = [];
    const tieneIds = Array.isArray(pedidoIds) && pedidoIds.length > 0;

    pedidosMemoria.forEach((p) => {
      const matchId = tieneIds && pedidoIds.includes(p.id);
      const coincidePadre = p.padreId === padreIdOTelefono || p.telefonoContacto === padreIdOTelefono;
      const coincideColegio = !colegioNombre || colegioNombre === 'TODOS' || p.colegioNombre === colegioNombre;
      const debeLiquidar = tieneIds ? matchId : (coincidePadre && coincideColegio);

      if (debeLiquidar && (p.metodoPago === 'Pagar luego' || p.metodoPago === 'Efectivo') && p.estadoPago !== 'PAGADO') {
        p.estadoPago = 'PAGADO';
        idsAActualizar.push(p.id);
      }
    });

    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('pedidos')
          .update({ estado_pago: 'PAGADO' })
          .in('metodo_pago', ['Pagar luego', 'Efectivo'])
          .neq('estado_pago', 'PAGADO');

        if (tieneIds) {
          query = query.in('id', pedidoIds);
        } else {
          if (padreIdOTelefono.includes('-') || padreIdOTelefono.length > 20) {
            query = query.eq('padre_id', padreIdOTelefono);
          } else {
            query = query.or(`padre_id.eq.${padreIdOTelefono},telefono_contacto.eq.${padreIdOTelefono}`);
          }

          if (colegioNombre && colegioNombre !== 'TODOS') {
            query = query.eq('colegio_nombre', colegioNombre);
          }
        }

        const { data, error } = await query.select('id');
        if (error) {
          console.error('Error liquidando deuda del padre en Supabase:', error);
          return { ok: false, count: 0, error: error.message };
        }
        if (data) {
          idsAActualizar = data.map((d) => d.id);
        }
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : 'Error desconocido al liquidar deuda';
        console.error('Error liquidando deuda del padre en Supabase:', e);
        return { ok: false, count: 0, error: errorMsg };
      }
    }

    notifyListeners();
    return { ok: true, count: idsAActualizar.length };
  },

  async marcarFiadoComoPagado(pedidoId: string): Promise<void> {
    await this.cambiarEstadoPago(pedidoId, 'PAGADO');
  },

  calcularResumenCocina(pedidos: Pedido[]): ResumenCocina {
    const entradasMap = new Map<string, { count: number; obs: ObservacionCocinaItem[] }>();
    const segundosMap = new Map<string, { count: number; obs: ObservacionCocinaItem[] }>();

    let pedidosConObservacion = 0;
    let pendientesPago = 0;
    let pagados = 0;

    pedidos.forEach((p) => {
      if (p.estadoPago === 'PAGADO') pagados++;
      else pendientesPago++;

      const tieneObs = Boolean(p.observacion && p.observacion.trim().length > 0);
      if (tieneObs) pedidosConObservacion++;

      // Contar Entradas
      const entradaActual = entradasMap.get(p.entradaNombre) || { count: 0, obs: [] };
      entradaActual.count += 1;
      if (tieneObs) {
        entradaActual.obs.push({
          estudiante: p.estudianteNombre,
          grado: p.gradoSeccion,
          colegio: p.colegioNombre,
          observacion: p.observacion!,
        });
      }
      entradasMap.set(p.entradaNombre, entradaActual);

      // Contar Segundos
      const segundoActual = segundosMap.get(p.segundoNombre) || { count: 0, obs: [] };
      segundoActual.count += 1;
      if (tieneObs) {
        segundoActual.obs.push({
          estudiante: p.estudianteNombre,
          grado: p.gradoSeccion,
          colegio: p.colegioNombre,
          observacion: p.observacion!,
        });
      }
      segundosMap.set(p.segundoNombre, segundoActual);
    });

    const entradas = Array.from(entradasMap.entries()).map(([plato, data]) => ({
      plato,
      tipo: 'ENTRADA' as const,
      cantidad: data.count,
      observacionesEspeciales: data.obs,
    }));

    const segundos = Array.from(segundosMap.entries()).map(([plato, data]) => ({
      plato,
      tipo: 'SEGUNDO' as const,
      cantidad: data.count,
      observacionesEspeciales: data.obs,
    }));

    return {
      totalPedidos: pedidos.length,
      entradas,
      segundos,
      pedidosConObservacion,
      pedidosPendientesPago: pendientesPago,
      pedidosPagados: pagados,
    };
  },

  suscribirCambios(callback: () => void): () => void {
    listeners.push(callback);
    let channel: RealtimeChannel | null = null;

    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel('pedidos-realtime-global')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
          callback();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'platos' }, () => {
          callback();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'colegios' }, () => {
          callback();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'menus_dia' }, () => {
          callback();
        })
        .subscribe();
    }

    return () => {
      const idx = listeners.indexOf(callback);
      if (idx !== -1) listeners.splice(idx, 1);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  },

  // --- GESTIÓN DE COLEGIOS Y ADMINISTRADORES DE SEDE (SUPER ADMIN) ---
  async obtenerColegios(): Promise<string[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('colegios')
          .select('nombre, activo')
          .order('nombre', { ascending: true });

        if (!error && data) {
          const nombres = data
            .filter((d) => d.activo !== false)
            .map((d) => (d.nombre ? d.nombre.trim() : ''))
            .filter((n) => n.length > 0);

          colegiosMemoria = nombres;
          if (typeof window !== 'undefined') {
            localStorage.setItem('config_colegios', JSON.stringify(nombres));
          }
          return [...colegiosMemoria];
        }
      } catch (e) {
        console.warn('Error trayendo colegios de Supabase, usando caché:', e);
      }
    }

    // Fallback de emergencia solo si no hay Supabase o falló la red
    if (typeof window !== 'undefined') {
      try {
        const c = localStorage.getItem('config_colegios');
        if (c) {
          const parsed = JSON.parse(c);
          if (Array.isArray(parsed) && parsed.length > 0) {
            colegiosMemoria = parsed;
            return [...colegiosMemoria];
          }
        }
      } catch (_) {}
    }
    return [...colegiosMemoria];
  },

  async obtenerColegiosDetallados(): Promise<ColegioDetallado[]> {
    let colegiosBase: Array<{ id: string; nombre: string; activo?: boolean; created_at?: string; sede?: string | null }> = [];
    let adminsMap: Record<string, AdminColegioInfo> = {};

    // 1. Cargar desde Supabase si está disponible
    if (isSupabaseConfigured && supabase) {
      try {
        // A. Cargar lista de colegios
        const { data: colsData, error: errCols } = await supabase
          .from('colegios')
          .select('*')
          .order('created_at', { ascending: true });

        if (!errCols && colsData) {
          colegiosBase = colsData;
        }

        // B. Cargar admins registrados en perfiles_padres
        const { data: adminsData } = await supabase
          .from('perfiles_padres')
          .select('id, nombre_completo, dni, email, telefono, rol, password_hash')
          .in('rol', ['ADMIN', 'SUPER_ADMIN']);

        const adminsPorDni: Record<string, PerfilAdminRow> = {};
        if (adminsData) {
          adminsData.forEach((a) => {
            if (a.dni) adminsPorDni[a.dni] = a;
            if (a.email) adminsPorDni[a.email] = a;
          });
        }

        // C. Cargar diccionario de asignación de menus_dia (SABADO)
        const { data: configRow } = await supabase
          .from('menus_dia')
          .select('mensaje_aviso')
          .eq('dia_semana', 'SABADO')
          .maybeSingle();

        if (configRow && configRow.mensaje_aviso) {
          try {
            const parsed = JSON.parse(configRow.mensaje_aviso);
            if (parsed.adminsColegio) {
              adminsMap = parsed.adminsColegio;
            }
            if (parsed.gradosPorColegio) {
              Object.entries(parsed.gradosPorColegio).forEach(([k, v]) => {
                if (Array.isArray(v) && gradosPorColegioMemoria[k] === undefined) {
                  gradosPorColegioMemoria[k] = [...v];
                }
              });
            }
            if (parsed.observacionesPorColegio) {
              Object.entries(parsed.observacionesPorColegio).forEach(([k, v]) => {
                if (Array.isArray(v) && observacionesPorColegioMemoria[k] === undefined) {
                  observacionesPorColegioMemoria[k] = [...v];
                }
              });
            }
          } catch (_) {}
        }

        // D. Cargar conteo de pedidos por colegio (asociación exacta sin duplicación)
        const pedidosPorColegio: Record<string, number> = {};
        const { data: pedData } = await supabase.from('pedidos').select('colegio_id, colegio_nombre');
        if (pedData) {
          pedData.forEach((p) => {
            const colMatch = colegiosBase.find(
              (c) =>
                (p.colegio_id && c.id === p.colegio_id) ||
                (p.colegio_nombre && c.nombre.trim().toLowerCase() === p.colegio_nombre.trim().toLowerCase())
            );
            if (colMatch) {
              pedidosPorColegio[colMatch.id] = (pedidosPorColegio[colMatch.id] || 0) + 1;
            }
          });
        }

        // E. Cargar conteo de estudiantes (hijos) asociados a cada colegio (sin doble incremento)
        const conteoEstudiantes: Record<string, number> = {};
        const { data: hijosData } = await supabase.from('hijos').select('id, colegio_id, colegio_nombre');
        if (hijosData) {
          hijosData.forEach((h) => {
            const colMatch = colegiosBase.find(
              (c) =>
                (h.colegio_id && c.id === h.colegio_id) ||
                (h.colegio_nombre && c.nombre.trim().toLowerCase() === h.colegio_nombre.trim().toLowerCase())
            );
            if (colMatch) {
              conteoEstudiantes[colMatch.id] = (conteoEstudiantes[colMatch.id] || 0) + 1;
            }
          });
        }

        // Ensamblar los colegios detallados
        const listaDetallada: ColegioDetallado[] = colegiosBase.map((c) => {
          let sedeLimpia = c.sede || '';
          let adminDniFromSede = '';
          if (c.sede && c.sede.includes('|')) {
            const partes = c.sede.split('|');
            sedeLimpia = partes[0].trim();
            adminDniFromSede = partes[1].trim();
          } else if (c.sede && (c.sede.startsWith('ADM-') || c.sede.startsWith('admin_'))) {
            adminDniFromSede = c.sede.trim();
            sedeLimpia = '';
          }

          // Resolver admin asignado
          let adminAsignado: AdminColegioInfo | null = null;
          if (adminsMap[c.nombre]) {
            adminAsignado = { ...adminsMap[c.nombre] };
          } else if (adminDniFromSede && adminsPorDni[adminDniFromSede]) {
            const a = adminsPorDni[adminDniFromSede];
            adminAsignado = {
              id: a.id,
              nombreCompleto: a.nombre_completo,
              dni: a.dni,
              email: a.email || '',
              telefono: a.telefono || '',
              password: a.password_hash || '',
            };
          }

          if (adminAsignado && !adminAsignado.password) {
            const adminKey = adminAsignado.dni || adminAsignado.email;
            const a = adminKey ? adminsPorDni[adminKey] : undefined;
            if (a && a.password_hash) {
              adminAsignado.password = a.password_hash;
            }
          }

          const totalEstudiantes = conteoEstudiantes[c.id] || 0;
          const totalPedidos = pedidosPorColegio[c.id] || 0;

          const cRaw = c as { grados?: string[]; observaciones?: string[] };
          const colGrados = Array.isArray(cRaw.grados) ? cRaw.grados : undefined;
          const colObs = Array.isArray(cRaw.observaciones) ? cRaw.observaciones : undefined;
          if (colGrados) {
            gradosPorColegioMemoria[c.nombre] = [...colGrados];
            gradosPorColegioMemoria[c.id] = [...colGrados];
          }
          if (colObs) {
            observacionesPorColegioMemoria[c.nombre] = [...colObs];
            observacionesPorColegioMemoria[c.id] = [...colObs];
          }

          return {
            id: c.id,
            nombre: c.nombre,
            sede: sedeLimpia,
            activo: c.activo !== false,
            admin: adminAsignado,
            totalPedidos,
            totalEstudiantes,
            grados: colGrados,
            observaciones: colObs,
            createdAt: c.created_at,
          };
        });

        colegiosDetalladosMemoria = listaDetallada;
        colegiosMemoria = listaDetallada.filter((c) => c.activo).map((c) => c.nombre);

        if (typeof window !== 'undefined') {
          localStorage.setItem('config_colegios_detallados', JSON.stringify(listaDetallada));
          localStorage.setItem('config_colegios', JSON.stringify(colegiosMemoria));
        }

        return [...colegiosDetalladosMemoria];
      } catch (e) {
        console.warn('Error obteniendo colegios detallados de Supabase:', e);
      }
    }

    // Fallback local
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('config_colegios_detallados');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            colegiosDetalladosMemoria = parsed;
            return [...colegiosDetalladosMemoria];
          }
        }
      } catch (_) {}
    }

    return [...colegiosDetalladosMemoria];
  },

  async obtenerEstudiantesPorColegio(
    colegioNombreOId?: string,
    colegioNombreFallback?: string
  ): Promise<EstudianteColegioInfo[]> {
    let estudiantes: EstudianteColegioInfo[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: hijos, error: errH } = await supabase
          .from('hijos')
          .select('*')
          .order('created_at', { ascending: false });

        if (!errH && hijos) {
          const { data: padres } = await supabase
            .from('perfiles_padres')
            .select('id, nombre_completo, telefono, dni');

          const padreMap: Record<string, { nombre_completo?: string; telefono?: string; dni?: string }> = {};
          if (padres) {
            padres.forEach((p) => {
              padreMap[p.id] = p;
            });
          }

          estudiantes = hijos.map((h: HijoRowSupabase) => {
            const p = padreMap[h.padre_id] || {};
            return {
              id: h.id,
              padreId: h.padre_id,
              nombreCompleto: h.nombre_completo || '',
              colegioNombre: h.colegio_nombre || '',
              colegioId: h.colegio_id || undefined,
              gradoSeccion: h.grado_seccion || '',
              alergiasNotas: h.alergias_notas || undefined,
              createdAt: h.created_at || new Date().toISOString(),
              padreNombre: p.nombre_completo || 'No especificado',
              padreTelefono: p.telefono || 'Sin teléfono',
              padreDni: p.dni || '',
            };
          });
        }
      } catch (e) {
        console.warn('Error obteniendo estudiantes de Supabase:', e);
      }
    }

    // Filtrar por colegio si se especificó
    if (colegioNombreOId && colegioNombreOId !== 'TODOS') {
      const target = colegioNombreOId.toLowerCase().trim();
      const fallback = (colegioNombreFallback || '').toLowerCase().trim();
      estudiantes = estudiantes.filter((est) => {
        const idMatch = est.colegioId && (est.colegioId.toLowerCase().trim() === target || (fallback && est.colegioId.toLowerCase().trim() === fallback));
        const nombreMatch = est.colegioNombre && (est.colegioNombre.toLowerCase().trim() === target || (fallback && est.colegioNombre.toLowerCase().trim() === fallback));
        return idMatch || nombreMatch;
      });
    }

    return estudiantes;
  },

  async crearColegioConAdmin(
    colegio: { nombre: string; sede?: string; activo?: boolean },
    admin: AdminColegioInfo
  ): Promise<{ ok: boolean; error?: string; colegio?: ColegioDetallado }> {
    const nombreLimpio = colegio.nombre.trim();
    if (!nombreLimpio) {
      return { ok: false, error: 'El nombre del colegio es obligatorio.' };
    }
    if (!admin.nombreCompleto?.trim() || !admin.dni?.trim() || !admin.password?.trim()) {
      return { ok: false, error: 'Debe ingresar el nombre, usuario/DNI y contraseña del administrador.' };
    }

    const dniAdmin = admin.dni.trim();
    const emailAdmin = admin.email?.trim() || `${dniAdmin.toLowerCase()}@almuerzos.com`;
    const telAdmin = admin.telefono?.trim() || '999999999';
    const sedeBase = (colegio.sede || '').trim().replace(/\|.*$/, '').trim();
    const sedeConAdmin = (sedeBase ? `${sedeBase.slice(0, 50)} | ${dniAdmin}` : dniAdmin).slice(0, 95);

    let nuevoId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `col-${Date.now()}`;
    let adminId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `adm-${Date.now()}`;

    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Crear o actualizar usuario Administrador en perfiles_padres
        const { data: usuarioData, error: errUsuario } = await supabase
          .from('perfiles_padres')
          .upsert(
            [
              {
                nombre_completo: admin.nombreCompleto.trim(),
                dni: dniAdmin,
                email: emailAdmin,
                telefono: telAdmin,
                password_hash: admin.password,
                rol: 'ADMIN',
              },
            ],
            { onConflict: 'dni' }
          )
          .select()
          .single();

        if (errUsuario) {
          console.error('Error creando admin en Supabase:', errUsuario);
          return { ok: false, error: `Error al crear administrador: ${errUsuario.message}` };
        }
        if (usuarioData?.id) adminId = usuarioData.id;

        // 2. Insertar Colegio en tabla colegios
        const { data: colData, error: errCol } = await supabase
          .from('colegios')
          .insert([
            {
              nombre: nombreLimpio,
              sede: sedeConAdmin,
              activo: colegio.activo !== false,
              grados: GRADOS_DEFAULT,
              observaciones: OBSERVACIONES_DEFAULT,
            },
          ])
          .select()
          .single();

        if (errCol) {
          console.error('Error insertando colegio en Supabase:', errCol);
          return { ok: false, error: `Error al registrar colegio: ${errCol.message}` };
        }
        if (colData?.id) nuevoId = colData.id;

        // 3. Persistir mapeo en menus_dia (SABADO)
        const { data: configRow } = await supabase
          .from('menus_dia')
          .select('mensaje_aviso')
          .eq('dia_semana', 'SABADO')
          .maybeSingle();

        let cfgObj: ConfigMenusDiaObj = { grados: GRADOS_DEFAULT, observaciones: OBSERVACIONES_DEFAULT, adminsColegio: {} };
        if (configRow && configRow.mensaje_aviso) {
          try {
            cfgObj = JSON.parse(configRow.mensaje_aviso);
            if (!cfgObj.adminsColegio) cfgObj.adminsColegio = {};
          } catch (_) {}
        }
        if (!cfgObj.adminsColegio) cfgObj.adminsColegio = {};
        cfgObj.adminsColegio[nombreLimpio] = {
          id: adminId,
          nombreCompleto: admin.nombreCompleto.trim(),
          dni: dniAdmin,
          email: emailAdmin,
          telefono: telAdmin,
        };
        if (!cfgObj.gradosPorColegio) cfgObj.gradosPorColegio = {};
        cfgObj.gradosPorColegio[nombreLimpio] = [...GRADOS_DEFAULT];
        if (!cfgObj.observacionesPorColegio) cfgObj.observacionesPorColegio = {};
        cfgObj.observacionesPorColegio[nombreLimpio] = [...OBSERVACIONES_DEFAULT];

        await supabase
          .from('menus_dia')
          .update({ mensaje_aviso: JSON.stringify(cfgObj) })
          .eq('dia_semana', 'SABADO');
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : 'Error general en base de datos';
        return { ok: false, error: errorMsg };
      }
    }

    gradosPorColegioMemoria[nombreLimpio] = [...GRADOS_DEFAULT];
    gradosPorColegioMemoria[nuevoId] = [...GRADOS_DEFAULT];
    observacionesPorColegioMemoria[nombreLimpio] = [...OBSERVACIONES_DEFAULT];
    observacionesPorColegioMemoria[nuevoId] = [...OBSERVACIONES_DEFAULT];

    const nuevoColegioDetallado: ColegioDetallado = {
      id: nuevoId,
      nombre: nombreLimpio,
      sede: sedeBase,
      activo: colegio.activo !== false,
      admin: {
        id: adminId,
        nombreCompleto: admin.nombreCompleto.trim(),
        dni: dniAdmin,
        email: emailAdmin,
        telefono: telAdmin,
      },
      totalPedidos: 0,
      grados: [...GRADOS_DEFAULT],
      observaciones: [...OBSERVACIONES_DEFAULT],
      createdAt: new Date().toISOString(),
    };

    colegiosDetalladosMemoria.push(nuevoColegioDetallado);
    if (!colegiosMemoria.includes(nombreLimpio) && nuevoColegioDetallado.activo) {
      colegiosMemoria.push(nombreLimpio);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('config_colegios_detallados', JSON.stringify(colegiosDetalladosMemoria));
      localStorage.setItem('config_colegios', JSON.stringify(colegiosMemoria));
    }

    notifyListeners();
    return { ok: true, colegio: nuevoColegioDetallado };
  },

  async actualizarColegioConAdmin(
    colegioId: string,
    colegio: { nombre: string; sede?: string; activo?: boolean },
    admin?: AdminColegioInfo
  ): Promise<{ ok: boolean; error?: string }> {
    const nombreLimpio = colegio.nombre.trim();
    if (!nombreLimpio) return { ok: false, error: 'El nombre es obligatorio.' };

    const colegioOriginal = colegiosDetalladosMemoria.find((c) => c.id === colegioId);
    const nombreAntiguo = colegioOriginal?.nombre || '';
    const huboCambioNombre = Boolean(nombreAntiguo && nombreAntiguo.toLowerCase() !== nombreLimpio.toLowerCase());

    const sedeBase = (colegio.sede || '').trim().replace(/\|.*$/, '').trim();
    const dniAdmin = admin?.dni?.trim() || '';
    const sedeConAdmin = dniAdmin
      ? (sedeBase ? `${sedeBase.slice(0, 50)} | ${dniAdmin}` : dniAdmin).slice(0, 95)
      : sedeBase.slice(0, 95);

    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Actualizar datos del colegio
        const { error: errCol } = await supabase
          .from('colegios')
          .update({
            nombre: nombreLimpio,
            sede: sedeConAdmin,
            activo: colegio.activo !== false,
          })
          .eq('id', colegioId);

        if (errCol) throw errCol;

        // 2. Si hubo cambio de nombre, actualizar en cascada referencias en hijos y pedidos
        if (huboCambioNombre) {
          await supabase
            .from('hijos')
            .update({ colegio_nombre: nombreLimpio })
            .eq('colegio_nombre', nombreAntiguo);

          await supabase
            .from('pedidos')
            .update({ colegio_nombre: nombreLimpio })
            .eq('colegio_nombre', nombreAntiguo);
        }

        // 3. Actualizar o migrar en menus_dia (SABADO)
        const { data: configRow } = await supabase
          .from('menus_dia')
          .select('mensaje_aviso')
          .eq('dia_semana', 'SABADO')
          .maybeSingle();

        let cfgObj: ConfigMenusDiaObj = { grados: GRADOS_DEFAULT, observaciones: OBSERVACIONES_DEFAULT, adminsColegio: {} };
        if (configRow && configRow.mensaje_aviso) {
          try {
            cfgObj = JSON.parse(configRow.mensaje_aviso);
            if (!cfgObj.adminsColegio) cfgObj.adminsColegio = {};
          } catch (_) {}
        }
        if (!cfgObj.adminsColegio) cfgObj.adminsColegio = {};

        // Si se renombró el colegio, trasladar la entrada en adminsColegio
        if (huboCambioNombre && cfgObj.adminsColegio[nombreAntiguo]) {
          cfgObj.adminsColegio[nombreLimpio] = cfgObj.adminsColegio[nombreAntiguo];
          delete cfgObj.adminsColegio[nombreAntiguo];
        }

        // 4. Si se proporcionó información de admin, actualizar en perfiles_padres y en config
        if (admin && admin.dni) {
          const updateData: {
            nombre_completo: string;
            telefono: string;
            rol: RolUsuario;
            email?: string;
            password_hash?: string;
          } = {
            nombre_completo: admin.nombreCompleto.trim(),
            telefono: admin.telefono?.trim() || '999999999',
            rol: 'ADMIN',
          };
          if (admin.email) updateData.email = admin.email.trim();
          if (admin.password) updateData.password_hash = admin.password;

          await supabase
            .from('perfiles_padres')
            .upsert(
              [
                {
                  dni: admin.dni.trim(),
                  ...updateData,
                },
              ],
              { onConflict: 'dni' }
            );

          cfgObj.adminsColegio[nombreLimpio] = {
            nombreCompleto: admin.nombreCompleto.trim(),
            dni: admin.dni.trim(),
            email: admin.email?.trim() || '',
            telefono: admin.telefono?.trim() || '',
          };
        }

        await supabase
          .from('menus_dia')
          .update({ mensaje_aviso: JSON.stringify(cfgObj) })
          .eq('dia_semana', 'SABADO');
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : 'Error desconocido al actualizar colegio';
        console.error('Error actualizando colegio con admin:', e);
        return { ok: false, error: errorMsg };
      }
    }

    // Actualizar memoria
    if (huboCambioNombre) {
      pedidosMemoria.forEach((p) => {
        if (p.colegioNombre === nombreAntiguo) p.colegioNombre = nombreLimpio;
      });
    }

    const idx = colegiosDetalladosMemoria.findIndex((c) => c.id === colegioId || c.nombre === nombreLimpio);
    if (idx !== -1) {
      colegiosDetalladosMemoria[idx] = {
        ...colegiosDetalladosMemoria[idx],
        nombre: nombreLimpio,
        sede: sedeBase,
        activo: colegio.activo !== false,
        admin: admin ? { ...colegiosDetalladosMemoria[idx].admin, ...admin } : colegiosDetalladosMemoria[idx].admin,
      };
    }

    colegiosMemoria = colegiosDetalladosMemoria.filter((c) => c.activo).map((c) => c.nombre);
    if (typeof window !== 'undefined') {
      localStorage.setItem('config_colegios_detallados', JSON.stringify(colegiosDetalladosMemoria));
      localStorage.setItem('config_colegios', JSON.stringify(colegiosMemoria));
    }

    notifyListeners();
    return { ok: true };
  },

  async eliminarColegioCompleto(colegioId: string, nombreColegio: string): Promise<{ ok: boolean; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      try {
        let adminDniAEliminar = '';
        const { data: configRow } = await supabase
          .from('menus_dia')
          .select('mensaje_aviso')
          .eq('dia_semana', 'SABADO')
          .maybeSingle();

        if (configRow && configRow.mensaje_aviso) {
          try {
            const cfgObj = JSON.parse(configRow.mensaje_aviso);
            if (cfgObj.adminsColegio && cfgObj.adminsColegio[nombreColegio]) {
              adminDniAEliminar = cfgObj.adminsColegio[nombreColegio].dni || '';
              delete cfgObj.adminsColegio[nombreColegio];
              await supabase
                .from('menus_dia')
                .update({ mensaje_aviso: JSON.stringify(cfgObj) })
                .eq('dia_semana', 'SABADO');
            }
          } catch (_) {}
        }

        // Revocar el rol ADMIN a PADRE para que el admin del colegio eliminado no quede con acceso privilegiado
        if (adminDniAEliminar) {
          await supabase
            .from('perfiles_padres')
            .update({ rol: 'PADRE' })
            .eq('dni', adminDniAEliminar)
            .eq('rol', 'ADMIN');
        }

        const { error: errDel } = await supabase.from('colegios').delete().eq('id', colegioId);
        if (errDel) {
          console.error('Error eliminando colegio de Supabase:', errDel);
          return { ok: false, error: errDel.message };
        }
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : 'Error al eliminar colegio';
        console.error('Error eliminando colegio de Supabase:', e);
        return { ok: false, error: errorMsg };
      }
    }

    colegiosDetalladosMemoria = colegiosDetalladosMemoria.filter(
      (c) => c.id !== colegioId && c.nombre.toLowerCase() !== nombreColegio.toLowerCase()
    );
    colegiosMemoria = colegiosMemoria.filter((c) => c.toLowerCase() !== nombreColegio.toLowerCase());

    if (typeof window !== 'undefined') {
      localStorage.setItem('config_colegios_detallados', JSON.stringify(colegiosDetalladosMemoria));
      localStorage.setItem('config_colegios', JSON.stringify(colegiosMemoria));
    }

    notifyListeners();
    return { ok: true };
  },

  async cambiarEstadoColegio(colegioId: string, activo: boolean): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('colegios').update({ activo }).eq('id', colegioId);
      } catch (e) {
        console.error('Error cambiando estado del colegio:', e);
      }
    }

    const idx = colegiosDetalladosMemoria.findIndex((c) => c.id === colegioId);
    if (idx !== -1) {
      colegiosDetalladosMemoria[idx].activo = activo;
    }
    colegiosMemoria = colegiosDetalladosMemoria.filter((c) => c.activo).map((c) => c.nombre);

    if (typeof window !== 'undefined') {
      localStorage.setItem('config_colegios_detallados', JSON.stringify(colegiosDetalladosMemoria));
      localStorage.setItem('config_colegios', JSON.stringify(colegiosMemoria));
    }

    notifyListeners();
  },

  async agregarColegio(nombre: string): Promise<string[]> {
    const limpio = nombre.trim();
    if (!limpio) return [...colegiosMemoria];

    const yaExiste = colegiosMemoria.some((c) => c.toLowerCase() === limpio.toLowerCase());
    if (yaExiste) return [...colegiosMemoria];

    colegiosMemoria.push(limpio);
    if (typeof window !== 'undefined') {
      localStorage.setItem('config_colegios', JSON.stringify(colegiosMemoria));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('colegios').insert([{ nombre: limpio, activo: true }]);
      } catch (e) {
        console.error('Error insertando colegio en Supabase:', e);
      }
    }
    notifyListeners();
    return [...colegiosMemoria];
  },

  async eliminarColegio(nombre: string): Promise<string[]> {
    const target = nombre.trim();
    colegiosMemoria = colegiosMemoria.filter((c) => c.toLowerCase() !== target.toLowerCase());
    colegiosDetalladosMemoria = colegiosDetalladosMemoria.filter((c) => c.nombre.toLowerCase() !== target.toLowerCase());
    if (typeof window !== 'undefined') {
      localStorage.setItem('config_colegios', JSON.stringify(colegiosMemoria));
      localStorage.setItem('config_colegios_detallados', JSON.stringify(colegiosDetalladosMemoria));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('colegios').delete().eq('nombre', target);
      } catch (e) {
        console.error('Error eliminando colegio en Supabase:', e);
      }
    }
    notifyListeners();
    return [...colegiosMemoria];
  },

  // --- GESTIÓN DE GRADOS Y SECCIONES (INDEPENDIENTE POR COLEGIO) ---
  async obtenerGrados(colegioNombreOId?: string): Promise<string[]> {
    const colKey = (colegioNombreOId || '').trim();

    if (!colKey || colKey === 'TODOS') {
      return [...gradosMemoria];
    }

    if (gradosPorColegioMemoria[colKey] !== undefined) {
      return [...gradosPorColegioMemoria[colKey]];
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const esUuid = colKey.length === 36 && colKey.includes('-');
        let query = supabase.from('colegios').select('id, nombre, grados');
        if (esUuid) {
          query = query.eq('id', colKey);
        } else {
          query = query.ilike('nombre', colKey);
        }
        const { data: colData } = await query.maybeSingle();
        if (colData && Array.isArray(colData.grados)) {
          gradosPorColegioMemoria[colKey] = colData.grados;
          gradosPorColegioMemoria[colData.nombre] = colData.grados;
          gradosPorColegioMemoria[colData.id] = colData.grados;
          if (typeof window !== 'undefined') {
            localStorage.setItem(`config_grados_${colData.nombre}`, JSON.stringify(colData.grados));
          }
          return [...colData.grados];
        }
      } catch (_) {}

      try {
        const { data: configRow } = await supabase
          .from('menus_dia')
          .select('mensaje_aviso')
          .eq('dia_semana', 'SABADO')
          .maybeSingle();

        if (configRow?.mensaje_aviso) {
          const parsed = JSON.parse(configRow.mensaje_aviso);
          if (parsed.gradosPorColegio && parsed.gradosPorColegio[colKey] !== undefined) {
            const list = parsed.gradosPorColegio[colKey];
            if (Array.isArray(list)) {
              gradosPorColegioMemoria[colKey] = list;
              return [...list];
            }
          }
        }
      } catch (_) {}
    }

    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`config_grados_${colKey}`);
        if (cached !== null) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            gradosPorColegioMemoria[colKey] = parsed;
            return [...parsed];
          }
        }
      } catch (_) {}
    }

    gradosPorColegioMemoria[colKey] = [...GRADOS_DEFAULT];
    return [...GRADOS_DEFAULT];
  },

  async guardarGradosColegio(nuevosGrados: string[], colegioNombreOId?: string): Promise<void> {
    const colKey = (colegioNombreOId || '').trim();
    if (!colKey || colKey === 'TODOS') {
      gradosMemoria = [...nuevosGrados];
      await this.guardarConfiguracionSistema(nuevosGrados, undefined);
      return;
    }

    gradosPorColegioMemoria[colKey] = [...nuevosGrados];

    if (typeof window !== 'undefined') {
      localStorage.setItem(`config_grados_${colKey}`, JSON.stringify(nuevosGrados));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const esUuid = colKey.length === 36 && colKey.includes('-');
        let query = supabase.from('colegios').update({ grados: nuevosGrados });
        if (esUuid) {
          query = query.eq('id', colKey);
        } else {
          query = query.ilike('nombre', colKey);
        }
        await query;
      } catch (e) {
        console.warn('Actualización de columna grados en colegios omitida:', e);
      }

      try {
        const { data: configRow } = await supabase
          .from('menus_dia')
          .select('mensaje_aviso')
          .eq('dia_semana', 'SABADO')
          .maybeSingle();

        let cfgObj: ConfigMenusDiaObj = { adminsColegio: {}, gradosPorColegio: {}, observacionesPorColegio: {} };
        if (configRow?.mensaje_aviso) {
          try {
            cfgObj = JSON.parse(configRow.mensaje_aviso);
          } catch (_) {}
        }
        if (!cfgObj.gradosPorColegio) cfgObj.gradosPorColegio = {};
        cfgObj.gradosPorColegio[colKey] = nuevosGrados;

        await supabase
          .from('menus_dia')
          .update({ mensaje_aviso: JSON.stringify(cfgObj) })
          .eq('dia_semana', 'SABADO');
      } catch (e) {
        console.error('Error guardando grados en menus_dia:', e);
      }
    }
    notifyListeners();
  },

  async agregarGrado(nombre: string, colegioNombreOId?: string): Promise<string[]> {
    const limpio = nombre.trim();
    if (!limpio) return this.obtenerGrados(colegioNombreOId);

    const actuales = await this.obtenerGrados(colegioNombreOId);
    if (actuales.some((g) => g.toLowerCase() === limpio.toLowerCase())) {
      return [...actuales];
    }
    const nuevos = [...actuales, limpio];
    await this.guardarGradosColegio(nuevos, colegioNombreOId);
    return nuevos;
  },

  async eliminarGrado(nombre: string, colegioNombreOId?: string): Promise<string[]> {
    const target = nombre.trim();
    const actuales = await this.obtenerGrados(colegioNombreOId);
    const nuevos = actuales.filter((g) => g.toLowerCase() !== target.toLowerCase());
    await this.guardarGradosColegio(nuevos, colegioNombreOId);
    return nuevos;
  },

  // --- GESTIÓN DE OBSERVACIONES / RESTRICCIONES (INDEPENDIENTE POR COLEGIO) ---
  async obtenerObservaciones(colegioNombreOId?: string): Promise<string[]> {
    const colKey = (colegioNombreOId || '').trim();

    if (!colKey || colKey === 'TODOS') {
      return [...observacionesMemoria];
    }

    if (observacionesPorColegioMemoria[colKey] !== undefined) {
      return [...observacionesPorColegioMemoria[colKey]];
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const esUuid = colKey.length === 36 && colKey.includes('-');
        let query = supabase.from('colegios').select('id, nombre, observaciones');
        if (esUuid) {
          query = query.eq('id', colKey);
        } else {
          query = query.ilike('nombre', colKey);
        }
        const { data: colData } = await query.maybeSingle();
        if (colData && Array.isArray(colData.observaciones)) {
          observacionesPorColegioMemoria[colKey] = colData.observaciones;
          observacionesPorColegioMemoria[colData.nombre] = colData.observaciones;
          observacionesPorColegioMemoria[colData.id] = colData.observaciones;
          if (typeof window !== 'undefined') {
            localStorage.setItem(`config_observaciones_${colData.nombre}`, JSON.stringify(colData.observaciones));
          }
          return [...colData.observaciones];
        }
      } catch (_) {}

      try {
        const { data: configRow } = await supabase
          .from('menus_dia')
          .select('mensaje_aviso')
          .eq('dia_semana', 'SABADO')
          .maybeSingle();

        if (configRow?.mensaje_aviso) {
          const parsed = JSON.parse(configRow.mensaje_aviso);
          if (parsed.observacionesPorColegio && parsed.observacionesPorColegio[colKey] !== undefined) {
            const list = parsed.observacionesPorColegio[colKey];
            if (Array.isArray(list)) {
              observacionesPorColegioMemoria[colKey] = list;
              return [...list];
            }
          }
        }
      } catch (_) {}
    }

    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`config_observaciones_${colKey}`);
        if (cached !== null) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            observacionesPorColegioMemoria[colKey] = parsed;
            return [...parsed];
          }
        }
      } catch (_) {}
    }

    observacionesPorColegioMemoria[colKey] = [...OBSERVACIONES_DEFAULT];
    return [...OBSERVACIONES_DEFAULT];
  },

  async guardarObservacionesColegio(nuevasObs: string[], colegioNombreOId?: string): Promise<void> {
    const colKey = (colegioNombreOId || '').trim();
    if (!colKey || colKey === 'TODOS') {
      observacionesMemoria = [...nuevasObs];
      await this.guardarConfiguracionSistema(undefined, nuevasObs);
      return;
    }

    observacionesPorColegioMemoria[colKey] = [...nuevasObs];

    if (typeof window !== 'undefined') {
      localStorage.setItem(`config_observaciones_${colKey}`, JSON.stringify(nuevasObs));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const esUuid = colKey.length === 36 && colKey.includes('-');
        let query = supabase.from('colegios').update({ observaciones: nuevasObs });
        if (esUuid) {
          query = query.eq('id', colKey);
        } else {
          query = query.ilike('nombre', colKey);
        }
        await query;
      } catch (e) {
        console.warn('Actualización de observaciones en colegios omitida:', e);
      }

      try {
        const { data: configRow } = await supabase
          .from('menus_dia')
          .select('mensaje_aviso')
          .eq('dia_semana', 'SABADO')
          .maybeSingle();

        let cfgObj: ConfigMenusDiaObj = { adminsColegio: {}, gradosPorColegio: {}, observacionesPorColegio: {} };
        if (configRow?.mensaje_aviso) {
          try {
            cfgObj = JSON.parse(configRow.mensaje_aviso);
          } catch (_) {}
        }
        if (!cfgObj.observacionesPorColegio) cfgObj.observacionesPorColegio = {};
        cfgObj.observacionesPorColegio[colKey] = nuevasObs;

        await supabase
          .from('menus_dia')
          .update({ mensaje_aviso: JSON.stringify(cfgObj) })
          .eq('dia_semana', 'SABADO');
      } catch (e) {
        console.error('Error guardando observaciones en menus_dia:', e);
      }
    }
    notifyListeners();
  },

  async agregarObservacion(tag: string, colegioNombreOId?: string): Promise<string[]> {
    const limpio = tag.trim();
    if (!limpio) return this.obtenerObservaciones(colegioNombreOId);

    const actuales = await this.obtenerObservaciones(colegioNombreOId);
    if (actuales.some((o) => o.toLowerCase() === limpio.toLowerCase())) {
      return [...actuales];
    }
    const nuevas = [...actuales, limpio];
    await this.guardarObservacionesColegio(nuevas, colegioNombreOId);
    return nuevas;
  },

  async eliminarObservacion(tag: string, colegioNombreOId?: string): Promise<string[]> {
    const target = tag.trim();
    const actuales = await this.obtenerObservaciones(colegioNombreOId);
    const nuevas = actuales.filter((o) => o.toLowerCase() !== target.toLowerCase());
    await this.guardarObservacionesColegio(nuevas, colegioNombreOId);
    return nuevas;
  },

  async guardarConfiguracionSistema(nuevosGrados?: string[], nuevasObs?: string[]): Promise<void> {
    const g = nuevosGrados || gradosMemoria;
    const o = nuevasObs || observacionesMemoria;

    if (typeof window !== 'undefined') {
      localStorage.setItem('config_grados', JSON.stringify(g));
      localStorage.setItem('config_observaciones', JSON.stringify(o));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        let adminsColegio = {};
        let gradosPorColegio = {};
        let observacionesPorColegio = {};
        const { data: configRow } = await supabase
          .from('menus_dia')
          .select('mensaje_aviso')
          .eq('dia_semana', 'SABADO')
          .maybeSingle();

        if (configRow && configRow.mensaje_aviso) {
          try {
            const parsed = JSON.parse(configRow.mensaje_aviso);
            if (parsed.adminsColegio) adminsColegio = parsed.adminsColegio;
            if (parsed.gradosPorColegio) gradosPorColegio = parsed.gradosPorColegio;
            if (parsed.observacionesPorColegio) observacionesPorColegio = parsed.observacionesPorColegio;
          } catch (_) {}
        }

        const jsonStr = JSON.stringify({
          grados: g,
          observaciones: o,
          adminsColegio,
          gradosPorColegio,
          observacionesPorColegio,
        });

        await supabase
          .from('menus_dia')
          .update({ mensaje_aviso: jsonStr })
          .eq('dia_semana', 'SABADO');
      } catch (e) {
        console.error('Error guardando configuración en Supabase:', e);
      }
    }
    notifyListeners();
  },
};
