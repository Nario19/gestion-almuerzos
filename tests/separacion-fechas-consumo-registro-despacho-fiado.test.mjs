import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  formatearDiaYFechaProgramadaPeru,
  formatearFechaHoraRegistroPeru,
  obtenerFechaParaDiaSemana,
  obtenerFechaHoyPeru,
} from '../src/lib/dateUtils.ts';

const rootDir = process.cwd();

test('Separación estricta de Fecha de Consumo vs Fecha de Emisión y Dos Columnas en Despacho y Fiado', async (t) => {
  await t.test('1. dateUtils: formatearDiaYFechaProgramadaPeru formatea con día en mayúsculas y fecha', () => {
    const res1 = formatearDiaYFechaProgramadaPeru('2026-10-26', 'LUNES');
    assert.strictEqual(res1, 'LUNES 26/10/2026');

    const res2 = formatearDiaYFechaProgramadaPeru('2026-10-27', 'MARTES');
    assert.strictEqual(res2, 'MARTES 27/10/2026');

    const res3 = formatearDiaYFechaProgramadaPeru('2026-10-28', 'MIÉRCOLES');
    assert.strictEqual(res3, 'MIÉRCOLES 28/10/2026');

    const res4 = formatearDiaYFechaProgramadaPeru('2026-10-29', 'JUEVES');
    assert.strictEqual(res4, 'JUEVES 29/10/2026');

    const res5 = formatearDiaYFechaProgramadaPeru('2026-10-30', 'VIERNES');
    assert.strictEqual(res5, 'VIERNES 30/10/2026');
  });

  await t.test('2. dateUtils: formatearFechaHoraRegistroPeru desglosa fecha, hora y texto en zona horaria America/Lima', () => {
    // 2026-10-25 a las 14:30:00 UTC = 09:30:00 AM en Perú (UTC-5)
    const isoString = '2026-10-25T14:30:00.000Z';
    const res = formatearFechaHoraRegistroPeru(isoString);
    assert.strictEqual(res.fecha, '25/10/2026');
    assert.ok(res.hora.includes('09:30') || res.hora.includes('9:30'));
    assert.ok(res.texto.includes('25/10/2026'));
  });

  await t.test('3. Padres y DataService: Asignación de fecha programada según el día seleccionado', () => {
    const padresPath = path.join(rootDir, 'src', 'app', 'padres', 'page.tsx');
    const padresContent = fs.readFileSync(padresPath, 'utf-8');

    assert.ok(
      padresContent.includes('obtenerFechaParaDiaSemana(diaSeleccionado)'),
      'src/app/padres/page.tsx debe calcular fechaProgramada con obtenerFechaParaDiaSemana'
    );
    assert.ok(
      padresContent.includes('fecha: fechaProgramada'),
      'src/app/padres/page.tsx debe enviar fecha: fechaProgramada a dataService.crearPedido'
    );

    const dataServicePath = path.join(rootDir, 'src', 'lib', 'dataService.ts');
    const dsContent = fs.readFileSync(dataServicePath, 'utf-8');

    assert.ok(
      dsContent.includes('d.fecha.slice(0, 10)'),
      'mapearPedidoDesdeSupabase debe respetar d.fecha como fecha programada de consumo'
    );
  });

  await t.test('4. Despacho: No muestra pedidos de martes si hoy es lunes, y cuenta con ambas columnas de fechas', () => {
    const despachoPath = path.join(rootDir, 'src', 'app', 'admin', 'despacho', 'page.tsx');
    const despachoContent = fs.readFileSync(despachoPath, 'utf-8');

    // Validación de lógica de filtrado por fecha
    assert.ok(
      despachoContent.includes("const fechaPedido = (p.fecha || '').slice(0, 10);"),
      'Despacho debe filtrar por p.fecha (fecha programada)'
    );

    // Cabecera con ambas columnas
    assert.ok(
      despachoContent.includes('Fecha de Pedido'),
      'Despacho debe tener cabecera Fecha de Pedido'
    );
    assert.ok(
      despachoContent.includes('Día Programado'),
      'Despacho debe tener cabecera Día Programado'
    );

    // Celdas con funciones de formato
    assert.ok(
      despachoContent.includes('formatearFechaHoraRegistroPeru'),
      'Despacho debe formatear la emisión con formatearFechaHoraRegistroPeru'
    );
    assert.ok(
      despachoContent.includes('formatearDiaYFechaProgramadaPeru'),
      'Despacho debe formatear el día con formatearDiaYFechaProgramadaPeru'
    );

    // Exportación Excel con ambas columnas
    assert.ok(
      despachoContent.includes('Fecha Pedido') && despachoContent.includes('Día Programado'),
      'Exportación Excel de Despacho debe incluir ambas columnas'
    );

    // Simulación de aislamiento de pedidos por fecha
    const fechaLunes = '2026-10-26';
    const fechaMartes = '2026-10-27';
    const pedidosMock = [
      { id: '1', fecha: fechaLunes, diaSemana: 'LUNES', estudianteNombre: 'Juan' },
      { id: '2', fecha: fechaMartes, diaSemana: 'MARTES', estudianteNombre: 'Pedro' },
    ];

    // Si hoy es lunes y fechaFiltro es lunes:
    const fechaFiltroHoy = fechaLunes;
    const pedidosMostradosHoy = pedidosMock.filter((p) => p.fecha === fechaFiltroHoy);
    assert.strictEqual(pedidosMostradosHoy.length, 1);
    assert.strictEqual(pedidosMostradosHoy[0].id, '1', 'Solo el pedido del lunes debe mostrarse hoy');
    assert.ok(
      !pedidosMostradosHoy.some((p) => p.id === '2'),
      'El pedido del martes NO debe mostrarse hoy'
    );
  });

  await t.test('5. Fiado: Contiene ambas columnas en la tabla principal y en el desglose de pedidos', () => {
    const fiadoPath = path.join(rootDir, 'src', 'app', 'admin', 'fiado', 'page.tsx');
    const fiadoContent = fs.readFileSync(fiadoPath, 'utf-8');

    // Cabecera de la tabla principal
    assert.ok(
      fiadoContent.includes('Fecha de Pedido'),
      'Tabla principal de Fiado debe tener cabecera Fecha de Pedido'
    );
    assert.ok(
      fiadoContent.includes('Día Programado'),
      'Tabla principal de Fiado debe tener cabecera Día Programado'
    );

    // Celdas de la tabla principal
    assert.ok(
      fiadoContent.includes('formatearFechaHoraRegistroPeru(padre.pedidos[0]?.createdAt).texto'),
      'Fila principal de Fiado debe mostrar fecha/hora de pedido'
    );
    assert.ok(
      fiadoContent.includes('formatearDiaYFechaProgramadaPeru('),
      'Fila principal de Fiado debe formatear Día Programado'
    );

    // Tabla de desglose de pedidos desplegable
    assert.ok(
      fiadoContent.includes('<th className="py-2.5 px-3">Fecha de Pedido</th>'),
      'Desglose desplegable de Fiado debe tener columna Fecha de Pedido'
    );
    assert.ok(
      fiadoContent.includes('<th className="py-2.5 px-3">Día Programado</th>'),
      'Desglose desplegable de Fiado debe tener columna Día Programado'
    );

    // Modal de reporte detallado
    assert.ok(
      fiadoContent.includes('formatearDiaYFechaProgramadaPeru(ped.fecha, ped.diaSemana)'),
      'Modal de reporte de Fiado debe mostrar Día Programado en mayúsculas'
    );
  });

  await t.test('6. Limpieza y diferenciación de colores de platos sin prefijos técnicos en Pedido', async () => {
    const { limpiarNombrePlato } = await import('../src/lib/dateUtils.ts');

    assert.strictEqual(
      limpiarNombrePlato('Entrada (Sopa o Postre): Entrada:Sopa o postre:SOPA DE POLLO'),
      'SOPA DE POLLO'
    );
    assert.strictEqual(limpiarNombrePlato('Segundo: LENTEJAS'), 'LENTEJAS');
    assert.strictEqual(
      limpiarNombrePlato('Ensalada (Acompañamiento): Ensalada:ENSALADA DE FRUTA'),
      'ENSALADA DE FRUTA'
    );

    const despachoPath = path.join(rootDir, 'src', 'app', 'admin', 'despacho', 'page.tsx');
    const despachoContent = fs.readFileSync(despachoPath, 'utf-8');

    // Despacho usa limpiarNombrePlato y clases de color diferenciadas sin etiquetas visibles
    assert.ok(
      despachoContent.includes('limpiarNombrePlato(p.entradaNombre)'),
      'Despacho debe limpiar entradaNombre'
    );
    assert.ok(
      despachoContent.includes('limpiarNombrePlato(p.segundoNombre)'),
      'Despacho debe limpiar segundoNombre'
    );
    assert.ok(
      despachoContent.includes('limpiarNombrePlato(p.ensaladaNombre)'),
      'Despacho debe limpiar ensaladaNombre'
    );
    assert.ok(
      despachoContent.includes('text-orange-700'),
      'Entrada debe tener color anaranjado'
    );
    assert.ok(
      despachoContent.includes('text-emerald-700'),
      'Ensalada debe tener color verde'
    );
  });

  await t.test('7. Eliminación absoluta del badge HOY en la columna de Día Programado', () => {
    const despachoPath = path.join(rootDir, 'src', 'app', 'admin', 'despacho', 'page.tsx');
    const despachoContent = fs.readFileSync(despachoPath, 'utf-8');

    // La celda de Día Programado NO debe tener ningún Badge con texto 'HOY'
    assert.ok(
      !despachoContent.includes('p.fecha === fechaHoy ? (\n                                <div className="flex items-center gap-1.5 whitespace-nowrap">\n                                  <Badge variant="success" className="px-1.5 py-0 text-[10px] font-bold bg-emerald-600 text-white">\n                                    HOY'),
      'Despacho no debe tener badge HOY en la celda de Día Programado'
    );
    assert.ok(
      despachoContent.includes('{formatearDiaYFechaProgramadaPeru(p.fecha, p.diaSemana)}'),
      'Despacho debe renderizar directamente formatearDiaYFechaProgramadaPeru'
    );
  });

  await t.test('8. Reconciliación defensiva de fecha según día de la semana escolar', () => {
    // Si se pasa fecha 2026-10-25 (domingo) pero día MARTES, la función debe alinear al martes (2026-10-27)
    const formateado = formatearDiaYFechaProgramadaPeru('2026-10-25', 'MARTES');
    assert.strictEqual(formateado, 'MARTES 27/10/2026');
    assert.ok(!formateado.includes('HOY'), 'Nunca debe contener la palabra HOY');

    // Si se pasa fecha 2026-10-26 (lunes) pero día MIERCOLES, debe alinear al miércoles (2026-10-28)
    const formateadoMiercoles = formatearDiaYFechaProgramadaPeru('2026-10-26', 'MIERCOLES');
    assert.strictEqual(formateadoMiercoles, 'MIÉRCOLES 28/10/2026');
  });

  await t.test('9. DataService reconcilia fecha con diaSemana al mapear y al crear pedido', () => {
    const dsPath = path.join(rootDir, 'src', 'lib', 'dataService.ts');
    const dsContent = fs.readFileSync(dsPath, 'utf-8');

    assert.ok(
      dsContent.includes('fechaNormalizada = obtenerFechaParaDiaSemana(diaSemanaNormalizado, fechaNormalizada)'),
      'mapearPedidoDesdeSupabase debe reconciliar defensivamente fechaNormalizada con el día de la semana'
    );
    assert.ok(
      dsContent.includes('obtenerFechaParaDiaSemana(diaSemanaFinal, fechaBase)'),
      'crearPedido debe sincronizar fechaFinal con el día escolar programado'
    );
  });
});
