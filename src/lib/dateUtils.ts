import type { DiaSemana } from '../types/index.ts';

/**
 * Zona horaria oficial de Perú: America/Lima (UTC-5 sin horario de verano)
 */
export const ZONA_HORARIA_PERU = 'America/Lima';

/**
 * Retorna la fecha actual en Perú en formato estándar 'YYYY-MM-DD'
 * Funciona de manera idéntica en el navegador del cliente y en servidores UTC (Vercel/Node).
 */
export function obtenerFechaHoyPeru(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA_PERU,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Convierte un timestamp ISO (o Date) a la fecha correspondiente en Perú en formato 'YYYY-MM-DD'.
 * Esencial para registrar pedidos que ocurren cerca de la medianoche UTC.
 */
export function obtenerFechaPeruDeIso(fechaIsoOFecha?: string | Date): string {
  if (!fechaIsoOFecha) return obtenerFechaHoyPeru();
  const d = typeof fechaIsoOFecha === 'string' ? new Date(fechaIsoOFecha) : fechaIsoOFecha;
  if (isNaN(d.getTime())) return obtenerFechaHoyPeru();
  return obtenerFechaHoyPeru(d);
}

/**
 * Retorna el día de la semana correspondiente a Perú ('LUNES' a 'VIERNES').
 * Si es fin de semana (sábado/domingo), por defecto retorna 'LUNES'.
 */
export function obtenerDiaActualSemanaPeru(date: Date = new Date()): DiaSemana {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: ZONA_HORARIA_PERU,
    weekday: 'long',
  });
  const weekday = formatter.format(date).toLowerCase();

  switch (weekday) {
    case 'monday':
      return 'LUNES';
    case 'tuesday':
      return 'MARTES';
    case 'wednesday':
      return 'MIERCOLES';
    case 'thursday':
      return 'JUEVES';
    case 'friday':
      return 'VIERNES';
    case 'saturday':
    case 'sunday':
    default:
      return 'LUNES';
  }
}

/**
 * Retorna la hora actual en Perú formateada en español (ej. '12:45 p. m.' o '08:30 a. m.').
 */
export function obtenerHoraActualPeru(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: ZONA_HORARIA_PERU,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Formatea un timestamp ISO o Date a la hora en Perú con formato de 12 horas ('hh:mm a. m./p. m.').
 */
export function formatearHoraPeru(fechaIso?: string | Date): string {
  if (!fechaIso) return '';
  try {
    const d = typeof fechaIso === 'string' ? new Date(fechaIso) : fechaIso;
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('es-PE', {
      timeZone: ZONA_HORARIA_PERU,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

/**
 * Formatea una fecha 'YYYY-MM-DD' a formato legible en Perú (ej. 'mié, 14 oct').
 * Utiliza Date.UTC a las 12:00 para blindar la fecha contra desfasajes de medianoche.
 */
export function formatearFechaLegiblePeru(fechaStr: string): string {
  if (!fechaStr || fechaStr === 'TODAS') return fechaStr || '';
  try {
    const [y, m, d] = fechaStr.split('-').map(Number);
    if (!y || !m || !d) return fechaStr;
    const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    return date.toLocaleDateString('es-PE', {
      timeZone: ZONA_HORARIA_PERU,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return fechaStr;
  }
}

/**
 * Formato corto con día de la semana y fecha (ej. 'MIÉRCOLES 14/10' o '14/10').
 */
export function formatearFechaCortaPeru(fechaStr?: string, diaSemana?: string): string {
  if (!fechaStr) return diaSemana || 'Menú Escolar';
  try {
    const [y, m, d] = fechaStr.split('-').map(Number);
    if (!y || !m || !d) return diaSemana || fechaStr;
    const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const fechaFormateada = date.toLocaleDateString('es-PE', {
      timeZone: ZONA_HORARIA_PERU,
      day: '2-digit',
      month: '2-digit',
    });
    return diaSemana ? `${diaSemana} ${fechaFormateada}` : fechaFormateada;
  } catch {
    return diaSemana || fechaStr;
  }
}

/**
 * Calcula una fecha con un offset de días (ej. -1 para ayer, +1 para mañana)
 * respetando la zona horaria de Perú y devolviendo 'YYYY-MM-DD'.
 */
export function calcularOffsetFechaPeru(fechaBaseStr: string, offsetDias: number): string {
  try {
    const [y, m, d] = fechaBaseStr.split('-').map(Number);
    if (!y || !m || !d) return fechaBaseStr;
    const date = new Date(Date.UTC(y, m - 1, d + offsetDias, 12, 0, 0));
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: ZONA_HORARIA_PERU,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    return fechaBaseStr;
  }
}

/**
 * Formatea la fecha de emisión de documentos y tickets en Perú (ej. '13/10/2026').
 */
export function formatearFechaEmisionPeru(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: ZONA_HORARIA_PERU,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Convierte una hora en formato 'HH:MM' (24h) a formato legible de 12h con AM/PM (ej. '09:30' -> '09:30 AM').
 */
export function formatearHoraLimiteLegible(hora24?: string): string {
  if (!hora24 || !hora24.includes(':')) return '09:30 AM';
  try {
    const [hRaw, mRaw] = hora24.split(':').map(Number);
    if (isNaN(hRaw) || isNaN(mRaw)) return '09:30 AM';
    const ampm = hRaw >= 12 ? 'PM' : 'AM';
    const h12 = hRaw % 12 === 0 ? 12 : hRaw % 12;
    const hStr = h12.toString().padStart(2, '0');
    const mStr = mRaw.toString().padStart(2, '0');
    return `${hStr}:${mStr} ${ampm}`;
  } catch {
    return '09:30 AM';
  }
}

/**
 * Determina si la hora actual en Perú (America/Lima) ha superado la hora límite especificada en formato 'HH:MM'.
 */
export function haPasadoHoraLimite(horaLimite24: string, date: Date = new Date()): boolean {
  if (!horaLimite24 || !horaLimite24.includes(':')) return false;
  try {
    const [limiteH, limiteM] = horaLimite24.split(':').map(Number);
    if (isNaN(limiteH) || isNaN(limiteM)) return false;

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ZONA_HORARIA_PERU,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    let curH = 0;
    let curM = 0;
    for (const p of parts) {
      if (p.type === 'hour') curH = Number(p.value);
      if (p.type === 'minute') curM = Number(p.value);
    }
    // Caso especial medianoche 24h
    if (curH === 24) curH = 0;

    const curTotalMin = curH * 60 + curM;
    const limiteTotalMin = limiteH * 60 + limiteM;
    return curTotalMin > limiteTotalMin;
  } catch {
    return false;
  }
}

/**
 * Dada una fecha de referencia 'YYYY-MM-DD' y un día escolar ('LUNES' a 'VIERNES'),
 * retorna la fecha correspondiente 'YYYY-MM-DD' en la misma semana escolar de Perú.
 * Si la fecha de referencia cae en fin de semana, apunta a la semana escolar entrante.
 */
export function obtenerFechaParaDiaSemana(dia: DiaSemana, fechaReferencia: string = obtenerFechaHoyPeru()): string {
  try {
    const [y, m, d] = fechaReferencia.split('-').map(Number);
    if (!y || !m || !d) return fechaReferencia;
    const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const diaActualSemana = date.getUTCDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

    const MAPA_DIAS: Record<DiaSemana, number> = {
      LUNES: 1,
      MARTES: 2,
      MIERCOLES: 3,
      JUEVES: 4,
      VIERNES: 5,
    };
    const diaDestinoSemana = MAPA_DIAS[dia] || 1;

    let diffDias = 0;
    if (diaActualSemana === 0) {
      // Domingo -> Lunes entrante está a +1 día
      diffDias = diaDestinoSemana;
    } else if (diaActualSemana === 6) {
      // Sábado -> Lunes entrante está a +2 días
      diffDias = diaDestinoSemana + 1;
    } else {
      // Lunes a Viernes -> Moverse dentro de la misma semana
      diffDias = diaDestinoSemana - diaActualSemana;
    }

    return calcularOffsetFechaPeru(fechaReferencia, diffDias);
  } catch {
    return fechaReferencia;
  }
}

/**
 * Limpia prefijos técnicos como 'Entrada (Sopa o Postre):', 'Entrada:', 'Sopa o postre:', 'Segundo:', 'Ensalada:', etc.
 * dejando únicamente el nombre limpio del plato para su presentación visual con colores diferenciados.
 */
export function limpiarNombrePlato(nombre?: string): string {
  if (!nombre) return '';
  let res = String(nombre).trim();
  let prev = '';
  while (res !== prev) {
    prev = res;
    res = res
      .replace(/^(Entrada\s*\([^)]*\)|Entrada|Sopa\s*o\s*postre|Sopa|Postre|Segundo|Ensalada\s*\([^)]*\)|Ensalada|Extras?|Refrigerio)\s*:\s*/gi, '')
      .trim();
  }
  return res;
}

/**
 * Retorna el día de la semana escolar y la fecha programada del almuerzo en formato legible:
 * Ej. 'LUNES 26/10/2026', 'MARTES 27/10/2026', 'MIÉRCOLES 28/10/2026', 'JUEVES 29/10/2026', 'VIERNES 30/10/2026'
 * Garantiza que NUNCA retorne 'HOY [fecha]' en lugar del día de la semana.
 */
export function formatearDiaYFechaProgramadaPeru(fechaStr?: string, diaSemana?: string): string {
  if (!fechaStr) {
    const dia = (diaSemana || '').toUpperCase();
    if (!dia || dia === 'HOY') return 'Fecha no definida';
    return dia === 'MIERCOLES' ? 'MIÉRCOLES' : dia;
  }
  try {
    const [y, m, d] = fechaStr.split('-').map(Number);
    if (!y || !m || !d) {
      let dia = (diaSemana || '').toUpperCase();
      if (!dia || dia === 'HOY') return fechaStr;
      return `${dia === 'MIERCOLES' ? 'MIÉRCOLES' : dia} ${fechaStr}`;
    }
    const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));

    // Determinar día de la semana real (si diaSemana es 'HOY' o no es un día válido, se calcula de la fecha)
    let dia = (diaSemana || '').toUpperCase();
    const esDiaSemanaValido = dia && ['LUNES', 'MARTES', 'MIERCOLES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'].includes(dia);
    if (!esDiaSemanaValido) {
      const dayIndex = date.getUTCDay();
      const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
      dia = dias[dayIndex] || 'LUNES';
    } else {
      if (dia === 'MIERCOLES') dia = 'MIÉRCOLES';
    }

    const dd = String(d).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const yyyy = String(y);
    return `${dia} ${dd}/${mm}/${yyyy}`;
  } catch {
    return diaSemana && diaSemana !== 'HOY' ? `${diaSemana} ${fechaStr}` : (fechaStr || '');
  }
}

/**
 * Retorna la fecha y hora de emisión/registro del pedido en formato peruano.
 * Ej. '25/10/2026, 08:30 a. m.'
 */
export function formatearFechaHoraRegistroPeru(fechaIso?: string): { fecha: string; hora: string; texto: string } {
  if (!fechaIso) return { fecha: '--/--/----', hora: '--:--', texto: '--/--/----' };
  try {
    const d = new Date(fechaIso);
    if (isNaN(d.getTime())) return { fecha: '--/--/----', hora: '--:--', texto: '--/--/----' };
    const fecha = d.toLocaleDateString('es-PE', {
      timeZone: ZONA_HORARIA_PERU,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const hora = d.toLocaleTimeString('es-PE', {
      timeZone: ZONA_HORARIA_PERU,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return { fecha, hora, texto: `${fecha}, ${hora}` };
  } catch {
    return { fecha: '--/--/----', hora: '--:--', texto: '--/--/----' };
  }
}



