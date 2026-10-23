import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Distribución Estricta del Menú: Entrada -> Segundo -> Ensalada', () => {
  const rootDir = process.cwd();
  const adminMenuTabPath = path.join(rootDir, 'src/app/admin/components/AdminMenuSemanalTab.tsx');
  const padresPagePath = path.join(rootDir, 'src/app/padres/page.tsx');
  const pedidoManualPath = path.join(rootDir, 'src/app/admin/pedido-manual/page.tsx');
  const modalPedidoManualPath = path.join(rootDir, 'src/components/ModalPedidoManual.tsx');
  const cocinaPath = path.join(rootDir, 'src/app/admin/cocina/page.tsx');
  const despachoPath = path.join(rootDir, 'src/app/admin/despacho/page.tsx');
  const dataServicePath = path.join(rootDir, 'src/lib/dataService.ts');

  const adminMenuContent = fs.readFileSync(adminMenuTabPath, 'utf-8');
  const padresContent = fs.readFileSync(padresPagePath, 'utf-8');
  const pedidoManualContent = fs.readFileSync(pedidoManualPath, 'utf-8');
  const modalPedidoManualContent = fs.readFileSync(modalPedidoManualPath, 'utf-8');
  const cocinaContent = fs.readFileSync(cocinaPath, 'utf-8');
  const despachoContent = fs.readFileSync(despachoPath, 'utf-8');
  const dataServiceContent = fs.readFileSync(dataServicePath, 'utf-8');

  test('1. AdminMenuSemanalTab: "Tipo de opción a agregar" tiene el orden estricto Entrada -> Segundo -> Ensalada', () => {
    // Verificar que en el selector los botones aparecen en orden Entrada, Segundo, Ensalada
    const idxTipo = adminMenuContent.indexOf('Tipo de opción a agregar:');
    assert.ok(idxTipo !== -1, 'Debe existir la etiqueta "Tipo de opción a agregar:"');

    const idxBtnEntrada = adminMenuContent.indexOf("setTipoSeleccionadoMenu('Entrada')", idxTipo);
    const idxBtnSegundo = adminMenuContent.indexOf("setTipoSeleccionadoMenu('Segundo')", idxTipo);
    const idxBtnEnsalada = adminMenuContent.indexOf("setTipoSeleccionadoMenu('Ensalada')", idxTipo);

    assert.ok(idxBtnEntrada !== -1, 'Debe existir botón para seleccionar Entrada');
    assert.ok(idxBtnSegundo !== -1, 'Debe existir botón para seleccionar Segundo');
    assert.ok(idxBtnEnsalada !== -1, 'Debe existir botón para seleccionar Ensalada');

    assert.ok(
      idxBtnEntrada < idxBtnSegundo && idxBtnSegundo < idxBtnEnsalada,
      'Los botones deben estar ordenados estrictamente: Entrada -> Segundo -> Ensalada'
    );
  });

  test('2. AdminMenuSemanalTab: Los bloques del menú escolar listan en orden Entrada -> Segundo -> Ensalada', () => {
    const idxBloqueEntradas = adminMenuContent.indexOf('Entradas ({platosEntrada.length})');
    const idxBloqueSegundos = adminMenuContent.indexOf('Segundos (Platos de Fondo) ({platosSegundo.length})');
    const idxBloqueEnsaladas = adminMenuContent.indexOf('Ensaladas ({platosEnsalada.length})');

    assert.ok(idxBloqueEntradas !== -1, 'Debe existir el bloque de Entradas');
    assert.ok(idxBloqueSegundos !== -1, 'Debe existir el bloque de Segundos');
    assert.ok(idxBloqueEnsaladas !== -1, 'Debe existir el bloque de Ensaladas');

    assert.ok(
      idxBloqueEntradas < idxBloqueSegundos && idxBloqueSegundos < idxBloqueEnsaladas,
      'Los bloques en el listado deben estar distribuidos estrictamente: 1. Entradas -> 2. Segundos -> 3. Ensaladas'
    );

    // Acciones de añadir rápido
    assert.ok(adminMenuContent.includes('Añadir Entrada'), 'Debe incluir botón Añadir Entrada');
    assert.ok(adminMenuContent.includes('Añadir Segundo'), 'Debe incluir botón Añadir Segundo');
    assert.ok(adminMenuContent.includes('Añadir Ensalada'), 'Debe incluir botón Añadir Ensalada');
  });

  test('3. Vista Pública y Padres (Carta Semanal): Orden estricto 1. Entradas, 2. Segundo, 3. Ensaladas, 4. Extras', () => {
    const idxSeccEntradas = padresContent.indexOf('1. Entradas (');
    const idxSeccSegundos = padresContent.indexOf('2. Segundo (Plato de Fondo) (');
    const idxSeccEnsaladas = padresContent.indexOf('3. Ensaladas (');
    const idxSeccExtras = padresContent.indexOf('4. Extras y Adicionales (');

    assert.ok(idxSeccEntradas !== -1, 'Debe existir la sección 1. Entradas en la carta pública');
    assert.ok(idxSeccSegundos !== -1, 'Debe existir la sección 2. Segundo en la carta pública');
    assert.ok(idxSeccEnsaladas !== -1, 'Debe existir la sección 3. Ensaladas en la carta pública');
    assert.ok(idxSeccExtras !== -1, 'Debe existir la sección 4. Extras y Adicionales');

    assert.ok(
      idxSeccEntradas < idxSeccSegundos && idxSeccSegundos < idxSeccEnsaladas && idxSeccEnsaladas < idxSeccExtras,
      'La carta debe estar ordenada estrictamente: 1. Entradas -> 2. Segundo -> 3. Ensaladas -> 4. Extras'
    );
  });

  test('4. Flujo de Pedido de Padres: Formulario ordenado en 1. Entrada, 2. Segundo, 3. Ensalada', () => {
    const idxFormulario = padresContent.indexOf('{/* FORMULARIO */}');
    assert.ok(idxFormulario !== -1, 'Debe existir el formulario de pedido de padres');

    const idxFormEntrada = padresContent.indexOf('1. Entrada (', idxFormulario);
    const idxFormSegundo = padresContent.indexOf('2. Segundo (', idxFormulario);
    const idxFormEnsalada = padresContent.indexOf('3. Ensalada (', idxFormulario);

    assert.ok(idxFormEntrada !== -1, 'El formulario debe iniciar con 1. Entrada');
    assert.ok(idxFormSegundo !== -1, 'El formulario debe continuar con 2. Segundo');
    assert.ok(idxFormEnsalada !== -1, 'El formulario debe seguir con 3. Ensalada');

    assert.ok(
      idxFormEntrada < idxFormSegundo && idxFormSegundo < idxFormEnsalada,
      'El formulario de pedido debe seguir estrictamente: Entrada -> Segundo -> Ensalada'
    );

    // Opciones sin entrada y sin ensalada
    assert.ok(padresContent.includes("setEntradaSeleccionada('Sin entrada')"), 'Debe permitir Sin entrada');
    assert.ok(padresContent.includes("setEnsaladaSeleccionada('Sin ensalada')"), 'Debe permitir Sin ensalada');
  });

  test('5. Pedido Manual (Página y Modal): Ordenados estrictamente Entrada -> Segundo -> Ensalada', () => {
    // En src/app/admin/pedido-manual/page.tsx
    const idxPmEntrada = pedidoManualContent.indexOf('1. Entrada');
    const idxPmSegundo = pedidoManualContent.indexOf('2. Plato de Fondo (Segundo)');
    const idxPmEnsalada = pedidoManualContent.indexOf('3. Ensalada');

    assert.ok(idxPmEntrada !== -1, 'Pedido manual debe incluir 1. Entrada');
    assert.ok(idxPmSegundo !== -1, 'Pedido manual debe incluir 2. Plato de Fondo (Segundo)');
    assert.ok(idxPmEnsalada !== -1, 'Pedido manual debe incluir 3. Ensalada');

    assert.ok(
      idxPmEntrada < idxPmSegundo && idxPmSegundo < idxPmEnsalada,
      'Pedido manual debe desplegarse en orden: 1. Entrada -> 2. Segundo -> 3. Ensalada'
    );

    // En src/components/ModalPedidoManual.tsx
    const idxModalEntrada = modalPedidoManualContent.indexOf('1. Entrada (Opcional):');
    const idxModalSegundo = modalPedidoManualContent.indexOf('2. Segundo / Plato Principal');
    const idxModalEnsalada = modalPedidoManualContent.indexOf('3. Ensalada (Opcional):');

    assert.ok(idxModalEntrada !== -1, 'Modal debe incluir 1. Entrada (Opcional):');
    assert.ok(idxModalSegundo !== -1, 'Modal debe incluir 2. Segundo / Plato Principal');
    assert.ok(idxModalEnsalada !== -1, 'Modal debe incluir 3. Ensalada (Opcional):');

    assert.ok(
      idxModalEntrada < idxModalSegundo && idxModalSegundo < idxModalEnsalada,
      'Modal de pedido manual debe ordenar campos: 1. Entrada -> 2. Segundo -> 3. Ensalada'
    );
  });

  test('6. Cocina y Despacho: Nomenclatura clara y orden Entrada -> Segundo -> Ensalada', () => {
    assert.ok(
      cocinaContent.includes('Consolidado de Entradas'),
      'Cocina debe titular Consolidado de Entradas'
    );
    assert.ok(
      despachoContent.includes('Entrada:'),
      'Despacho debe rotular Entrada: para la opción de entrada'
    );
    assert.ok(
      dataServiceContent.includes("tipoFinal = 'Entrada';"),
      'dataService debe normalizar entradas a tipo Entrada'
    );
  });
});
