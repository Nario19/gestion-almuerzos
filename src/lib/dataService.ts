import { Pedido, Plato, MenuDia, ResumenCocina, EstadoPedido, EstadoPago, DiaSemana } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

export const COLEGIOS_DEFAULT = [
  'Colegio San José',
  'Colegio Santa Rosa',
  'I.E. Miguel Grau',
  'Colegio San Agustín',
];

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

export const DIAS_SEMANA: { key: DiaSemana; label: string; short: string }[] = [
  { key: 'LUNES', label: 'Lunes', short: 'Lun' },
  { key: 'MARTES', label: 'Martes', short: 'Mar' },
  { key: 'MIERCOLES', label: 'Miércoles', short: 'Mié' },
  { key: 'JUEVES', label: 'Jueves', short: 'Jue' },
  { key: 'VIERNES', label: 'Viernes', short: 'Vie' },
];

export function obtenerDiaActualSemana(): DiaSemana {
  const diaNum = new Date().getDay(); // 0 = Domingo, 1 = Lunes, ..., 5 = Viernes, 6 = Sábado
  switch (diaNum) {
    case 1: return 'LUNES';
    case 2: return 'MARTES';
    case 3: return 'MIERCOLES';
    case 4: return 'JUEVES';
    case 5: return 'VIERNES';
    default: return 'LUNES'; // Fines de semana muestran Lunes por defecto
  }
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
const listeners: (() => void)[] = [];

function notifyListeners() {
  listeners.forEach((listener) => listener());
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

  async obtenerPedidos(): Promise<Pedido[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((d) => ({
            id: d.id,
            codigoPedido: d.codigo_pedido,
            fecha: d.fecha,
            diaSemana: d.dia_semana,
            padreId: d.padre_id,
            hijoId: d.hijo_id,
            colegioNombre: d.colegio_nombre,
            gradoSeccion: d.grado_seccion,
            estudianteNombre: d.estudiante_nombre,
            telefonoContacto: d.telefono_contacto,
            entradaNombre: d.entrada_nombre,
            segundoNombre: d.segundo_nombre,
            observacion: d.observacion,
            metodoPago: d.metodo_pago,
            estadoPago: d.estado_pago,
            estadoPedido: d.estado_pedido,
            comprobanteUrl: d.comprobante_url,
            monto: Number(d.monto) || 12.0,
            createdAt: d.created_at,
          }));
        }
      } catch (err) {
        console.warn('Error leyendo pedidos de Supabase:', err);
      }
    }
    return [...pedidosMemoria];
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
      fecha: new Date().toISOString().split('T')[0],
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

  async cambiarEstadoPedido(id: string, nuevoEstado: EstadoPedido): Promise<void> {
    const index = pedidosMemoria.findIndex((p) => p.id === id);
    if (index !== -1) {
      pedidosMemoria[index] = { ...pedidosMemoria[index], estadoPedido: nuevoEstado };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pedidos').update({ estado_pedido: nuevoEstado }).eq('id', id);
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
};
