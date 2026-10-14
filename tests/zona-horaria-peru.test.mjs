import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  ZONA_HORARIA_PERU,
  obtenerFechaHoyPeru,
  obtenerFechaPeruDeIso,
  obtenerDiaActualSemanaPeru,
  obtenerHoraActualPeru,
  formatearHoraPeru,
  formatearFechaLegiblePeru,
  formatearFechaCortaPeru,
  calcularOffsetFechaPeru,
  formatearFechaEmisionPeru,
} from '../src/lib/dateUtils.ts';

describe('Blindaje de Zona Horaria Oficial de Perú (America/Lima / UTC-5)', () => {
  test('1. Constante de zona horaria está fijada estrictamente en America/Lima', () => {
    assert.strictEqual(ZONA_HORARIA_PERU, 'America/Lima');
  });

  test('2. obtenerFechaHoyPeru: Retorna formato YYYY-MM-DD y respeta UTC-5 en el cruce de medianoche', () => {
    const hoyStr = obtenerFechaHoyPeru();
    assert.match(hoyStr, /^\d{4}-\d{2}-\d{2}$/, 'Debe cumplir con formato YYYY-MM-DD');

    // Simular 2026-10-14 a las 02:30:00 UTC (en Perú UTC-5 son las 21:30 del 2026-10-13)
    const fechaUtcMedianoche = new Date('2026-10-14T02:30:00.000Z');
    const fechaPeru = obtenerFechaHoyPeru(fechaUtcMedianoche);
    assert.strictEqual(fechaPeru, '2026-10-13', 'A las 02:30 UTC del día 14, en Perú todavía es el día 13');
  });

  test('3. obtenerFechaPeruDeIso: Convierte timestamps UTC de Supabase a fecha exacta en Perú', () => {
    // Pedido registrado a las 11:30 PM de Perú (04:30 UTC del día siguiente)
    const timestampNoche = '2026-10-15T04:30:00.000Z';
    const fechaEnPeru = obtenerFechaPeruDeIso(timestampNoche);
    assert.strictEqual(fechaEnPeru, '2026-10-14', 'Debe atribuirse a la fecha de Perú (14 de octubre)');

    // Pedido registrado a las 7:00 AM de Perú (12:00 UTC del mismo día)
    const timestampManana = '2026-10-14T12:00:00.000Z';
    assert.strictEqual(obtenerFechaPeruDeIso(timestampManana), '2026-10-14');
  });

  test('4. obtenerDiaActualSemanaPeru: Discrimina el día de la semana según la hora de Perú, no UTC', () => {
    // Lunes 19 de Octubre a las 22:00 en Perú (Martes 20 a las 03:00 UTC)
    const lunesNoche = new Date('2026-10-20T03:00:00.000Z');
    assert.strictEqual(
      obtenerDiaActualSemanaPeru(lunesNoche),
      'LUNES',
      'Debe ser LUNES en Perú aunque en el servidor UTC ya sea martes'
    );

    // Viernes 23 de Octubre a las 23:59 en Perú (Sábado 24 a las 04:59 UTC)
    const viernesNoche = new Date('2026-10-24T04:59:00.000Z');
    assert.strictEqual(obtenerDiaActualSemanaPeru(viernesNoche), 'VIERNES');

    // Domingo en Perú debe abrir con LUNES por defecto para la carta escolar
    const domingoTarde = new Date('2026-10-18T20:00:00.000Z');
    assert.strictEqual(obtenerDiaActualSemanaPeru(domingoTarde), 'LUNES');
  });

  test('5. formatearHoraPeru: Convierte a formato de 12 horas peruano (hh:mm a. m. / p. m.)', () => {
    // 17:15 UTC = 12:15 p. m. en Perú
    const horaMediodia = formatearHoraPeru('2026-10-14T17:15:00.000Z');
    assert.ok(
      horaMediodia.includes('12:15') && (horaMediodia.includes('p. m.') || horaMediodia.includes('pm')),
      `Hora formateada esperada 12:15 p. m., obtenida: ${horaMediodia}`
    );

    // 13:40 UTC = 08:40 a. m. en Perú
    const horaManana = formatearHoraPeru('2026-10-14T13:40:00.000Z');
    assert.ok(
      horaManana.includes('08:40') && (horaManana.includes('a. m.') || horaManana.includes('am')),
      `Hora formateada esperada 08:40 a. m., obtenida: ${horaManana}`
    );

    // Hora actual en Perú
    const horaActual = obtenerHoraActualPeru();
    assert.ok(
      horaActual.includes('m.') || horaActual.includes('M'),
      `Hora actual debe tener sufijo horario de 12h: ${horaActual}`
    );
  });

  test('6. formatearFechaLegiblePeru: Sin desfasajes de día ni problemas de medianoche', () => {
    const legible = formatearFechaLegiblePeru('2026-10-14');
    assert.ok(
      legible.includes('14') && (legible.toLowerCase().includes('oct') || legible.toLowerCase().includes('mié')),
      `Fecha legible debe contener día 14 y mes oct: ${legible}`
    );

    // Fin de año y cambio de año
    const finAnio = formatearFechaLegiblePeru('2026-12-31');
    assert.ok(finAnio.includes('31') && finAnio.toLowerCase().includes('dic'));

    const inicioAnio = formatearFechaLegiblePeru('2027-01-01');
    assert.ok(inicioAnio.includes('1') && inicioAnio.toLowerCase().includes('ene'));
  });

  test('7. formatearFechaCortaPeru: Incluye día de la semana y formato compacto día/mes', () => {
    const corta = formatearFechaCortaPeru('2026-10-14', 'MIERCOLES');
    assert.ok(corta.includes('MIERCOLES'));
    assert.ok(corta.includes('14/10'));
  });

  test('8. calcularOffsetFechaPeru: Navegación de ayer, hoy y saltos de mes/año', () => {
    // Ayer
    const ayer = calcularOffsetFechaPeru('2026-10-14', -1);
    assert.strictEqual(ayer, '2026-10-13');

    // Mañana
    const manana = calcularOffsetFechaPeru('2026-10-14', +1);
    assert.strictEqual(manana, '2026-10-15');

    // Retroceder de primer día de mes (1 de octubre -> 30 de setiembre)
    const finSetiembre = calcularOffsetFechaPeru('2026-10-01', -1);
    assert.strictEqual(finSetiembre, '2026-09-30');

    // Retroceder de primer día de año (1 de enero -> 31 de diciembre)
    const finAnio = calcularOffsetFechaPeru('2027-01-01', -1);
    assert.strictEqual(finAnio, '2026-12-31');
  });

  test('9. formatearFechaEmisionPeru: Emisión de reportes de despacho con formato local', () => {
    const emision = formatearFechaEmisionPeru(new Date('2026-10-14T15:00:00.000Z'));
    assert.strictEqual(emision, '14/10/2026');
  });

  test('10. Caso Regresión #ALM-334: Pedido creado a las 7:34 PM en Perú se atribuye a Ayer (2026-10-12) y no a Hoy (2026-10-13)', () => {
    // Timestamp exacto registrado en Supabase para #ALM-334: 2026-10-13T00:34:54.69449+00:00
    const createdUtc = '2026-10-13T00:34:54.69449+00:00';

    // 1. La fecha en Perú debe ser el 12 de Octubre de 2026
    const fechaPeru = obtenerFechaPeruDeIso(createdUtc);
    assert.strictEqual(fechaPeru, '2026-10-12', 'El pedido pertenece al 12 de octubre en Perú');

    // 2. La hora en Perú debe ser 07:34 p. m.
    const horaPeru = formatearHoraPeru(createdUtc);
    assert.ok(horaPeru.includes('07:34') || horaPeru.includes('7:34'), `Hora debe ser 07:34: ${horaPeru}`);
    assert.ok(horaPeru.toLowerCase().includes('p. m.') || horaPeru.toLowerCase().includes('pm'), `Debe ser p. m.: ${horaPeru}`);

    // 3. Cuando el filtro es HOY (2026-10-13), el pedido no debe aparecer
    const fechaFiltroHoy = '2026-10-13';
    assert.notStrictEqual(fechaPeru, fechaFiltroHoy, 'No debe coincidir con el filtro de Hoy');

    // 4. Cuando el filtro es AYER (2026-10-12), el pedido sí coincide
    const fechaFiltroAyer = '2026-10-12';
    assert.strictEqual(fechaPeru, fechaFiltroAyer, 'Debe coincidir con el filtro de Ayer');
  });
});
