import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

function leerArchivo(relPath) {
  return fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');
}

test('Verificación de Menú Escolar: ENTRADA (SOPA o POSTRE), SEGUNDOS y ENSALADA SOLO SE MUESTRA', async (t) => {
  const padresPage = leerArchivo('src/app/padres/page.tsx');
  const adminMenuTab = leerArchivo('src/app/admin/components/AdminMenuSemanalTab.tsx');
  const pedidoManualPage = leerArchivo('src/app/admin/pedido-manual/page.tsx');
  const modalPedidoManual = leerArchivo('src/components/ModalPedidoManual.tsx');
  const cocinaPage = leerArchivo('src/app/admin/cocina/page.tsx');
  const despachoPage = leerArchivo('src/app/admin/despacho/page.tsx');
  const fiadoPage = leerArchivo('src/app/admin/fiado/page.tsx');
  const padresPedidosPage = leerArchivo('src/app/padres/pedidos/page.tsx');
  const dashboardTab = leerArchivo('src/app/admin/components/AdminDashboardTab.tsx');

  await t.test('1. Carta de Padres: ENTRADA (SOPA o POSTRE), SEGUNDOS y ENSALADA SOLO SE MUESTRA', () => {
    // Ver Menú y Pedir Menú
    assert.ok(
      padresPage.includes('1. ENTRADA (SOPA o POSTRE)'),
      'La carta de padres debe rotular 1. ENTRADA (SOPA o POSTRE)'
    );
    assert.ok(
      padresPage.includes('Acompañamiento Incluido • Solo se muestra'),
      'La ensalada en la carta de padres debe indicar Acompañamiento Incluido • Solo se muestra'
    );
    assert.ok(
      padresPage.includes('Entrada (Sopa o Postre):'),
      'El modal o resumen de confirmación debe rotular Entrada (Sopa o Postre):'
    );
    assert.ok(
      padresPage.includes('Ensalada (Acompañamiento):'),
      'El modal o resumen de confirmación debe rotular Ensalada (Acompañamiento):'
    );
  });

  await t.test('2. Panel Admin Menú Semanal: Entrada (Sopa o Postre) y Ensalada solo se muestra', () => {
    assert.ok(
      adminMenuTab.includes('ENTRADA (SOPA o POSTRE)'),
      'El panel del menú semanal debe incluir la sección ENTRADA (SOPA o POSTRE)'
    );
    assert.ok(
      adminMenuTab.includes('Ensalada (Acompañamiento - Solo se muestra)'),
      'El panel de registro debe indicar que la ensalada es acompañamiento que solo se muestra'
    );
  });

  await t.test('3. Pedido Manual (Página y Modal): Entrada (Sopa o Postre) y Ensalada Informativa', () => {
    assert.ok(
      pedidoManualPage.includes('1. ENTRADA (SOPA o POSTRE)'),
      'Pedido manual debe titular 1. ENTRADA (SOPA o POSTRE)'
    );
    assert.ok(
      pedidoManualPage.includes('Acompañamiento Incluido • Solo se muestra'),
      'Pedido manual debe mostrar la ensalada como acompañamiento incluido'
    );
    assert.ok(
      modalPedidoManual.includes('1. ENTRADA (SOPA o POSTRE)'),
      'Modal de pedido manual debe titular 1. ENTRADA (SOPA o POSTRE)'
    );
    assert.ok(
      modalPedidoManual.includes('3. ENSALADA (Acompañamiento Incluido):'),
      'Modal de pedido manual debe mostrar 3. ENSALADA como acompañamiento incluido'
    );
  });

  await t.test('4. Cocina: Consolidado de Entradas (Sopa o Postre)', () => {
    assert.ok(
      cocinaPage.includes('Consolidado de Entradas (Sopa o Postre)'),
      'Cocina debe titular Consolidado de Entradas (Sopa o Postre)'
    );
    assert.ok(
      cocinaPage.includes('Entradas (Sopa o Postre):'),
      'Cocina debe desglosar Entradas (Sopa o Postre): por colegio'
    );
  });

  await t.test('5. Despacho y Fiados: Entrada (Sopa o Postre) y Ensalada (Acompañamiento)', () => {
    assert.ok(
      despachoPage.includes('Entrada (Sopa o Postre):'),
      'Despacho debe mostrar Entrada (Sopa o Postre): en cada fila'
    );
    assert.ok(
      despachoPage.includes('Ensalada (Acompañamiento):'),
      'Despacho debe mostrar Ensalada (Acompañamiento): en cada fila'
    );
    assert.ok(
      fiadoPage.includes('Entrada (Sopa o Postre):'),
      'Control de fiados debe detallar Entrada (Sopa o Postre):'
    );
    assert.ok(
      fiadoPage.includes('Ensalada (Acompañamiento):'),
      'Control de fiados debe detallar Ensalada (Acompañamiento):'
    );
  });

  await t.test('6. Historial de Padres y Dashboard: Entrada (Sopa o Postre)', () => {
    assert.ok(
      padresPedidosPage.includes('1. Entrada (Sopa o Postre):'),
      'Historial de pedidos de padres debe mostrar 1. Entrada (Sopa o Postre):'
    );
    assert.ok(
      dashboardTab.includes('Entradas (Sopa o Postre)'),
      'Dashboard debe titular Entradas (Sopa o Postre) en métricas de demanda'
    );
  });
});
