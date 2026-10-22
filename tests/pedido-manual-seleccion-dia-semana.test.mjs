import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { obtenerFechaParaDiaSemana, obtenerDiaActualSemanaPeru } from '../src/lib/dateUtils.ts';

test('Selección de Día de la Semana en Toma de Pedidos Manuales', async (t) => {
  const adminPagePath = path.resolve(process.cwd(), 'src/app/admin/pedido-manual/page.tsx');
  const modalPath = path.resolve(process.cwd(), 'src/components/ModalPedidoManual.tsx');
  const dateUtilsPath = path.resolve(process.cwd(), 'src/lib/dateUtils.ts');

  const adminContent = fs.readFileSync(adminPagePath, 'utf-8');
  const modalContent = fs.readFileSync(modalPath, 'utf-8');
  const dateUtilsContent = fs.readFileSync(dateUtilsPath, 'utf-8');

  await t.test('1. dateUtils implementa obtenerFechaParaDiaSemana con precisión de calendario en Perú', () => {
    assert.ok(
      dateUtilsContent.includes('export function obtenerFechaParaDiaSemana('),
      'obtenerFechaParaDiaSemana debe estar exportada en dateUtils.ts'
    );

    // Miércoles 21 de Octubre de 2026
    const fechaRefMiercoles = '2026-10-21';
    assert.equal(obtenerFechaParaDiaSemana('LUNES', fechaRefMiercoles), '2026-10-19');
    assert.equal(obtenerFechaParaDiaSemana('MARTES', fechaRefMiercoles), '2026-10-20');
    assert.equal(obtenerFechaParaDiaSemana('MIERCOLES', fechaRefMiercoles), '2026-10-21');
    assert.equal(obtenerFechaParaDiaSemana('JUEVES', fechaRefMiercoles), '2026-10-22');
    assert.equal(obtenerFechaParaDiaSemana('VIERNES', fechaRefMiercoles), '2026-10-23');

    // Sábado 24 de Octubre de 2026 -> apunto a la semana escolar entrante (Lunes 26)
    const fechaRefSabado = '2026-10-24';
    assert.equal(obtenerFechaParaDiaSemana('LUNES', fechaRefSabado), '2026-10-26');
    assert.equal(obtenerFechaParaDiaSemana('VIERNES', fechaRefSabado), '2026-10-30');
  });

  await t.test('2. Pantalla de Pedido Manual (admin/pedido-manual) integra selector de días y sincronización reactiva', () => {
    assert.ok(
      adminContent.includes('DIAS_SEMANA'),
      'Debe importar y usar DIAS_SEMANA para renderizar los botones de la semana'
    );
    assert.ok(
      adminContent.includes('diaSeleccionado'),
      'Debe gestionar el estado diaSeleccionado'
    );
    assert.ok(
      adminContent.includes('handleSeleccionarDia'),
      'Debe contar con manejador handleSeleccionarDia'
    );
    assert.ok(
      adminContent.includes('obtenerFechaParaDiaSemana'),
      'Debe usar obtenerFechaParaDiaSemana para sincronizar la fecha al elegir un día'
    );
    assert.ok(
      adminContent.includes('dataService.obtenerPlatosPorDia(diaSemanaCalculado') ||
      adminContent.includes('dataService.obtenerPlatosPorDia(diaSeleccionado'),
      'Debe consultar los platos del colegio según el día seleccionado'
    );
    assert.ok(
      adminContent.includes('Seleccionar Día de la Semana'),
      'Debe renderizar la etiqueta accesible para selección de día'
    );
  });

  await t.test('3. Modal de Pedido Manual (ModalPedidoManual.tsx) integra selector de días y sincronización reactiva', () => {
    assert.ok(
      modalContent.includes('DIAS_SEMANA'),
      'Debe importar y usar DIAS_SEMANA en el modal'
    );
    assert.ok(
      modalContent.includes('diaSeleccionado'),
      'Debe gestionar el estado diaSeleccionado en el modal'
    );
    assert.ok(
      modalContent.includes('handleSeleccionarDia'),
      'Debe contar con manejador handleSeleccionarDia en el modal'
    );
    assert.ok(
      modalContent.includes('obtenerFechaParaDiaSemana'),
      'Debe sincronizar la fecha en el modal al elegir el día'
    );
    assert.ok(
      modalContent.includes('Seleccionar Día de la Semana'),
      'Debe renderizar selector de días en el modal'
    );
  });
});
