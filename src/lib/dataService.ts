import {
  Pedido,
  Plato,
  MenuDia,
  ResumenCocina,
  EstadoPedido,
  EstadoPago,
  DiaSemana,
  ColegioDetallado,
  AdminColegioInfo,
} from '@/types';
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

// Catálogo inicial con fotografías reales de alta calidad (Unsplash food)
const PLATOS_INICIALES: Plato[] = [
  // LUNES
  {
    id: 'p-lun-1',
    diaSemana: 'LUNES',
    tipo: 'ENTRADA',
    nombre: 'Crema rosada',
    descripcion: 'Deliciosa crema de beterraga con queso fresco y galletas',
    precio: 0,
    imagenUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
    disponible: true,
    orden: 1,
  },
  {
    id: 'p-lun-2',
    diaSemana: 'LUNES',
    tipo: 'ENTRADA',
    nombre: 'Crema de huancaína tradicional',
    descripcion: 'Clásica salsa huancaína con papa sancochada y huevo duro',
    precio: 0,
    imagenUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
    disponible: true,
    orden: 2,
  },
  {
    id: 'p-lun-3',
    diaSemana: 'LUNES',
    tipo: 'SEGUNDO',
    nombre: 'Seco de pollo con frijoles y arroz',
    descripcion: 'Jugosa presa de pollo al culantro acompañada de frijoles canarios',
    precio: 12.0,
    imagenUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
    disponible: true,
    orden: 1,
  },
  {
    id: 'p-lun-4',
    diaSemana: 'LUNES',
    tipo: 'SEGUNDO',
    nombre: 'Tallarines rojos con pollo',
    descripcion: 'Spaghetti con salsa de tomate casera y presa de pollo dorada',
    precio: 12.0,
    imagenUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=600&q=80',
    disponible: true,
    orden: 2,
  },

  // MARTES
  {
    id: 'p-mar-1',
    diaSemana: 'MARTES',
    tipo: 'ENTRADA',
    nombre: 'Sopa de verduras y pollo',
    descripcion: 'Caldo reconfortante con verduras frescas y trozos de pollo',
    precio: 0,
    imagenUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    disponible: true,
    orden: 1,
  },
  {
    id: 'p-mar-2',
    diaSemana: 'MARTES',
    tipo: 'ENTRADA',
    nombre: 'Ensalada fresca con palta',
    descripcion: 'Lechuga orgánica, tomate, choclo y palta en láminas',
    precio: 0,
    imagenUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    disponible: true,
    orden: 2,
  },
  {
    id: 'p-mar-3',
    diaSemana: 'MARTES',
    tipo: 'SEGUNDO',
    nombre: 'Pescado frito con arroz y ensalada',
    descripcion: 'Filete de pescado fresco dorado con salsa criolla y arroz',
    precio: 12.0,
    imagenUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    disponible: true,
    orden: 1,
  },
  {
    id: 'p-mar-4',
    diaSemana: 'MARTES',
    tipo: 'SEGUNDO',
    nombre: 'Milanesa de pollo con puré de papa',
    descripcion: 'Milanesa crocante con suave puré de papa amarilla y arroz',
    precio: 12.0,
    imagenUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
    disponible: true,
    orden: 2,
  },

  // MIÉRCOLES
  {
    id: 'p-mie-1',
    diaSemana: 'MIERCOLES',
    tipo: 'ENTRADA',
    nombre: 'Tequeños de queso con guacamole',
    descripcion: '4 tequeños crujientes rellenos de queso andino',
    precio: 0,
    imagenUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
    disponible: true,
    orden: 1,
  },
  {
    id: 'p-mie-2',
    diaSemana: 'MIERCOLES',
    tipo: 'SEGUNDO',
    nombre: 'Lomo saltado criollo con papas fritas',
    descripcion: 'Trozos tiernos salteados al wok con cebolla, tomate y papas',
    precio: 13.0,
    imagenUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    disponible: true,
    orden: 1,
  },
  {
    id: 'p-mie-3',
    diaSemana: 'MIERCOLES',
    tipo: 'SEGUNDO',
    nombre: 'Ají de gallina con huevo y aceituna',
    descripcion: 'Crema suave de ají amarillo con pollo deshilachado y arroz',
    precio: 12.0,
    imagenUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
    disponible: true,
    orden: 2,
  },

  // JUEVES
  {
    id: 'p-jue-1',
    diaSemana: 'JUEVES',
    tipo: 'ENTRADA',
    nombre: 'Solterito de queso arequipeño',
    descripcion: 'Habas, choclo, queso fresco y aceitunas con vinagreta',
    precio: 0,
    imagenUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    disponible: true,
    orden: 1,
  },
  {
    id: 'p-jue-2',
    diaSemana: 'JUEVES',
    tipo: 'SEGUNDO',
    nombre: 'Arroz con pollo criollo y papa a la huancaína',
    descripcion: 'Arroz al culantro graneado con presa de pollo y salsa huancaína',
    precio: 12.0,
    imagenUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
    disponible: true,
    orden: 1,
  },

  // VIERNES
  {
    id: 'p-vie-1',
    diaSemana: 'VIERNES',
    tipo: 'ENTRADA',
    nombre: 'Crema de zapallo macre',
    descripcion: 'Crema suave con crutones y un toque de crema de leche',
    precio: 0,
    imagenUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
    disponible: true,
    orden: 1,
  },
  {
    id: 'p-vie-2',
    diaSemana: 'VIERNES',
    tipo: 'SEGUNDO',
    nombre: 'Chicharrón de pescado con yucas y tártara',
    descripcion: 'Trocitos crocantes de pescado con yuca frita y salsa tártara',
    precio: 13.0,
    imagenUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    disponible: true,
    orden: 1,
  },
];

let platosMemoria: Plato[] = [...PLATOS_INICIALES];
let pedidosMemoria: Pedido[] = [];
let colegiosMemoria: string[] = [];
let colegiosDetalladosMemoria: ColegioDetallado[] = [];
let gradosMemoria: string[] = [...GRADOS_DEFAULT];
let observacionesMemoria: string[] = [...OBSERVACIONES_DEFAULT];

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

function mapearPedidoDesdeSupabase(d: any, mapLocal: Record<string, string>): Pedido {
  let horaEntrega = d.hora_entrega || mapLocal[d.id] || undefined;
  let obs = d.observacion;
  if (obs && obs.includes('[Entregado:')) {
    const match = obs.match(/\[Entregado:\s*([^\]]+)\]/);
    if (match) {
      horaEntrega = match[1].trim();
      obs = obs.replace(/\s*•?\s*\[Entregado:\s*[^\]]+\]/, '').trim() || undefined;
    }
  }
  // Normalización defensiva de fecha según la zona horaria de Perú (America/Lima)
  const fechaNormalizada = d.created_at
    ? obtenerFechaPeruDeIso(d.created_at)
    : (d.fecha || obtenerFechaHoyPeru());

  return {
    id: d.id,
    codigoPedido: d.codigo_pedido,
    fecha: fechaNormalizada,
    diaSemana: d.dia_semana,
    padreId: d.padre_id,
    hijoId: d.hijo_id,
    colegioNombre: d.colegio_nombre,
    gradoSeccion: d.grado_seccion,
    estudianteNombre: d.estudiante_nombre,
    telefonoContacto: d.telefono_contacto,
    entradaNombre: d.entrada_nombre,
    segundoNombre: d.segundo_nombre,
    observacion: obs,
    metodoPago: d.metodo_pago,
    estadoPago: d.estado_pago,
    estadoPedido: d.estado_pedido,
    comprobanteUrl: d.comprobante_url,
    monto: Number(d.monto) || 12.0,
    createdAt: d.created_at,
    horaEntrega,
  };
}

export const dataService = {
  async obtenerPlatosPorDia(dia: DiaSemana): Promise<Plato[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('platos')
          .select('*')
          .eq('dia_semana', dia)
          .order('orden', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((d) => ({
            id: d.id,
            menuId: d.menu_id,
            diaSemana: d.dia_semana,
            tipo: d.tipo,
            nombre: d.nombre,
            descripcion: d.descripcion,
            precio: Number(d.precio) || 12.0,
            imagenUrl: d.imagen_url,
            disponible: d.disponible ?? true,
            orden: d.orden || 1,
          }));
        }
      } catch (e) {
        console.warn('Error trayendo platos de Supabase, usando memoria:', e);
      }
    }
    return platosMemoria.filter((p) => p.diaSemana === dia);
  },

  async agregarPlato(platoData: Omit<Plato, 'id'>): Promise<Plato> {
    const nuevoPlato: Plato = {
      ...platoData,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `plato-${Date.now()}`,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('platos')
          .insert([
            {
              dia_semana: nuevoPlato.diaSemana,
              tipo: nuevoPlato.tipo,
              nombre: nuevoPlato.nombre,
              descripcion: nuevoPlato.descripcion,
              precio: nuevoPlato.precio,
              imagen_url: nuevoPlato.imagenUrl,
              disponible: nuevoPlato.disponible,
              orden: nuevoPlato.orden,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          nuevoPlato.id = data.id;
        }
      } catch (e) {
        console.error('Error insertando plato en Supabase:', e);
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
    const randomCode = `ALM-${Math.floor(100 + Math.random() * 900)}`;
    const nuevo: Pedido = {
      ...pedidoData,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}`,
      codigoPedido: randomCode,
      fecha: obtenerFechaHoyPeru(),
      estadoPedido: 'REGISTRADO',
      estadoPago: pedidoData.estadoPago || 'PENDIENTE',
      createdAt: new Date().toISOString(),
    };

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
              observacion: nuevo.observacion,
              metodo_pago: nuevo.metodoPago,
              estado_pago: nuevo.estadoPago,
              estado_pedido: nuevo.estadoPedido,
              comprobante_url: nuevo.comprobanteUrl,
              monto: nuevo.monto,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          nuevo.id = data.id;
        } else if (error) {
          console.error('Error insertando pedido en Supabase:', error);
        }
      } catch (err) {
        console.error('Fallo de red al crear pedido en Supabase:', err);
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
    let observacionOriginal = '';
    if (index !== -1) {
      observacionOriginal = pedidosMemoria[index].observacion || '';
      pedidosMemoria[index] = {
        ...pedidosMemoria[index],
        estadoPedido: nuevoEstado,
        horaEntrega: hora,
      };
    }

    if (nuevoEstado === 'ENTREGADO' && hora) {
      guardarHoraEntregaLocal(id, hora);
    } else {
      eliminarHoraEntregaLocal(id);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        let nuevaObs = observacionOriginal.replace(/\s*•?\s*\[Entregado:\s*[^\]]+\]/, '').trim();
        if (nuevoEstado === 'ENTREGADO' && hora) {
          nuevaObs = nuevaObs ? `${nuevaObs} • [Entregado: ${hora}]` : `[Entregado: ${hora}]`;
        }
        await supabase
          .from('pedidos')
          .update({
            estado_pedido: nuevoEstado,
            observacion: nuevaObs || null,
          })
          .eq('id', id);
      } catch (e) {
        console.error('Error actualizando pedido en Supabase:', e);
      }
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

  calcularResumenCocina(pedidos: Pedido[]): ResumenCocina {
    const entradasMap = new Map<string, { count: number; obs: any[] }>();
    const segundosMap = new Map<string, { count: number; obs: any[] }>();

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
    let channel: any = null;

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
    let colegiosBase: any[] = [];
    let adminsMap: Record<string, AdminColegioInfo> = {};
    let conteoPedidos: Record<string, number> = {};

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
          .select('id, nombre_completo, dni, email, telefono, rol')
          .in('rol', ['ADMIN', 'SUPER_ADMIN']);

        const adminsPorDni: Record<string, any> = {};
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
          } catch (_) {}
        }

        // D. Cargar conteo de pedidos por colegio
        const { data: pedData } = await supabase.from('pedidos').select('colegio_nombre');
        if (pedData) {
          pedData.forEach((p) => {
            if (p.colegio_nombre) {
              conteoPedidos[p.colegio_nombre] = (conteoPedidos[p.colegio_nombre] || 0) + 1;
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
            adminAsignado = adminsMap[c.nombre];
          } else if (adminDniFromSede && adminsPorDni[adminDniFromSede]) {
            const a = adminsPorDni[adminDniFromSede];
            adminAsignado = {
              id: a.id,
              nombreCompleto: a.nombre_completo,
              dni: a.dni,
              email: a.email || '',
              telefono: a.telefono || '',
            };
          }

          return {
            id: c.id,
            nombre: c.nombre,
            sede: sedeLimpia,
            activo: c.activo !== false,
            admin: adminAsignado,
            totalPedidos: conteoPedidos[c.nombre] || 0,
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

        let cfgObj: any = { grados: GRADOS_DEFAULT, observaciones: OBSERVACIONES_DEFAULT, adminsColegio: {} };
        if (configRow && configRow.mensaje_aviso) {
          try {
            cfgObj = JSON.parse(configRow.mensaje_aviso);
            if (!cfgObj.adminsColegio) cfgObj.adminsColegio = {};
          } catch (_) {}
        }
        cfgObj.adminsColegio[nombreLimpio] = {
          id: adminId,
          nombreCompleto: admin.nombreCompleto.trim(),
          dni: dniAdmin,
          email: emailAdmin,
          telefono: telAdmin,
        };

        await supabase
          .from('menus_dia')
          .update({ mensaje_aviso: JSON.stringify(cfgObj) })
          .eq('dia_semana', 'SABADO');
      } catch (e: any) {
        return { ok: false, error: e.message || 'Error general en base de datos' };
      }
    }

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

    const sedeBase = (colegio.sede || '').trim().replace(/\|.*$/, '').trim();
    const dniAdmin = admin?.dni?.trim() || '';
    const sedeConAdmin = dniAdmin
      ? (sedeBase ? `${sedeBase.slice(0, 50)} | ${dniAdmin}` : dniAdmin).slice(0, 95)
      : sedeBase.slice(0, 95);

    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Actualizar datos del colegio
        await supabase
          .from('colegios')
          .update({
            nombre: nombreLimpio,
            sede: sedeConAdmin,
            activo: colegio.activo !== false,
          })
          .eq('id', colegioId);

        // 2. Si se proporcionó información de admin, actualizar en perfiles_padres
        if (admin && admin.dni) {
          const updateData: any = {
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

          // Actualizar en diccionario de menus_dia (SABADO)
          const { data: configRow } = await supabase
            .from('menus_dia')
            .select('mensaje_aviso')
            .eq('dia_semana', 'SABADO')
            .maybeSingle();

          let cfgObj: any = { grados: GRADOS_DEFAULT, observaciones: OBSERVACIONES_DEFAULT, adminsColegio: {} };
          if (configRow && configRow.mensaje_aviso) {
            try {
              cfgObj = JSON.parse(configRow.mensaje_aviso);
              if (!cfgObj.adminsColegio) cfgObj.adminsColegio = {};
            } catch (_) {}
          }
          cfgObj.adminsColegio[nombreLimpio] = {
            nombreCompleto: admin.nombreCompleto.trim(),
            dni: admin.dni.trim(),
            email: admin.email?.trim() || '',
            telefono: admin.telefono?.trim() || '',
          };

          await supabase
            .from('menus_dia')
            .update({ mensaje_aviso: JSON.stringify(cfgObj) })
            .eq('dia_semana', 'SABADO');
        }
      } catch (e: any) {
        console.error('Error actualizando colegio con admin:', e);
        return { ok: false, error: e.message };
      }
    }

    // Actualizar memoria
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
        await supabase.from('colegios').delete().eq('id', colegioId);

        // Remover de config en menus_dia
        const { data: configRow } = await supabase
          .from('menus_dia')
          .select('mensaje_aviso')
          .eq('dia_semana', 'SABADO')
          .maybeSingle();

        if (configRow && configRow.mensaje_aviso) {
          try {
            const cfgObj = JSON.parse(configRow.mensaje_aviso);
            if (cfgObj.adminsColegio && cfgObj.adminsColegio[nombreColegio]) {
              delete cfgObj.adminsColegio[nombreColegio];
              await supabase
                .from('menus_dia')
                .update({ mensaje_aviso: JSON.stringify(cfgObj) })
                .eq('dia_semana', 'SABADO');
            }
          } catch (_) {}
        }
      } catch (e: any) {
        console.error('Error eliminando colegio de Supabase:', e);
        return { ok: false, error: e.message };
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

  // --- GESTIÓN DE GRADOS Y SECCIONES ---
  async obtenerGrados(): Promise<string[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('menus_dia')
          .select('mensaje_aviso')
          .eq('dia_semana', 'SABADO')
          .maybeSingle();

        if (!error && data && data.mensaje_aviso) {
          try {
            const parsed = JSON.parse(data.mensaje_aviso);
            if (Array.isArray(parsed.grados) && parsed.grados.length > 0) {
              gradosMemoria = parsed.grados;
              if (typeof window !== 'undefined') {
                localStorage.setItem('config_grados', JSON.stringify(gradosMemoria));
              }
              return [...gradosMemoria];
            }
          } catch (_) {}
        }
      } catch (e) {
        console.warn('Error leyendo grados de Supabase:', e);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const g = localStorage.getItem('config_grados');
        if (g) {
          const parsed = JSON.parse(g);
          if (Array.isArray(parsed) && parsed.length > 0) {
            gradosMemoria = parsed;
            return [...gradosMemoria];
          }
        }
      } catch (_) {}
    }
    return [...gradosMemoria];
  },

  async guardarConfiguracionSistema(nuevosGrados?: string[], nuevasObs?: string[]): Promise<void> {
    const g = nuevosGrados || gradosMemoria;
    const o = nuevasObs || observacionesMemoria;
    const jsonStr = JSON.stringify({ grados: g, observaciones: o });

    if (typeof window !== 'undefined') {
      localStorage.setItem('config_grados', JSON.stringify(g));
      localStorage.setItem('config_observaciones', JSON.stringify(o));
    }

    if (isSupabaseConfigured && supabase) {
      try {
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

  async agregarGrado(nombre: string): Promise<string[]> {
    const limpio = nombre.trim();
    if (!limpio || gradosMemoria.some((g) => g.toLowerCase() === limpio.toLowerCase())) {
      return [...gradosMemoria];
    }
    gradosMemoria.push(limpio);
    await this.guardarConfiguracionSistema(gradosMemoria, undefined);
    return [...gradosMemoria];
  },

  async eliminarGrado(nombre: string): Promise<string[]> {
    const target = nombre.trim();
    gradosMemoria = gradosMemoria.filter((g) => g.toLowerCase() !== target.toLowerCase());
    await this.guardarConfiguracionSistema(gradosMemoria, undefined);
    return [...gradosMemoria];
  },

  // --- GESTIÓN DE OBSERVACIONES / RESTRICCIONES ---
  async obtenerObservaciones(): Promise<string[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('menus_dia')
          .select('mensaje_aviso')
          .eq('dia_semana', 'SABADO')
          .maybeSingle();

        if (!error && data && data.mensaje_aviso) {
          try {
            const parsed = JSON.parse(data.mensaje_aviso);
            if (Array.isArray(parsed.observaciones) && parsed.observaciones.length > 0) {
              observacionesMemoria = parsed.observaciones;
              if (typeof window !== 'undefined') {
                localStorage.setItem('config_observaciones', JSON.stringify(observacionesMemoria));
              }
              return [...observacionesMemoria];
            }
          } catch (_) {}
        }
      } catch (e) {
        console.warn('Error leyendo observaciones de Supabase:', e);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const o = localStorage.getItem('config_observaciones');
        if (o) {
          const parsed = JSON.parse(o);
          if (Array.isArray(parsed) && parsed.length > 0) {
            observacionesMemoria = parsed;
            return [...observacionesMemoria];
          }
        }
      } catch (_) {}
    }
    return [...observacionesMemoria];
  },

  async agregarObservacion(tag: string): Promise<string[]> {
    const limpio = tag.trim();
    if (!limpio || observacionesMemoria.some((o) => o.toLowerCase() === limpio.toLowerCase())) {
      return [...observacionesMemoria];
    }
    observacionesMemoria.push(limpio);
    await this.guardarConfiguracionSistema(undefined, observacionesMemoria);
    return [...observacionesMemoria];
  },

  async eliminarObservacion(tag: string): Promise<string[]> {
    const target = tag.trim();
    observacionesMemoria = observacionesMemoria.filter((o) => o.toLowerCase() !== target.toLowerCase());
    await this.guardarConfiguracionSistema(undefined, observacionesMemoria);
    return [...observacionesMemoria];
  },
};
