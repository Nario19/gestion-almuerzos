import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('División del Menú: Entrada (Sopa o Fruta), Segundo y Ensalada con Opciones Sin Entrada y Sin Ensalada a Un Solo Precio', () => {
  const rootDir = process.cwd();
  const typesPath = path.join(rootDir, 'src', 'types', 'index.ts');
  const dataServicePath = path.join(rootDir, 'src', 'lib', 'dataService.ts');
  const padresPagePath = path.join(rootDir, 'src', 'app', 'padres', 'page.tsx');
  const adminMenuTabPath = path.join(rootDir, 'src', 'app', 'admin', 'components', 'AdminMenuSemanalTab.tsx');
  const pedidoManualPath = path.join(rootDir, 'src', 'app', 'admin', 'pedido-manual', 'page.tsx');
  const despachoPath = path.join(rootDir, 'src', 'app', 'admin', 'despacho', 'page.tsx');
  const cocinaPath = path.join(rootDir, 'src', 'app', 'admin', 'cocina', 'page.tsx');

  const typesContent = fs.readFileSync(typesPath, 'utf-8');
  const dataServiceContent = fs.readFileSync(dataServicePath, 'utf-8');
  const padresContent = fs.readFileSync(padresPagePath, 'utf-8');
  const adminMenuContent = fs.readFileSync(adminMenuTabPath, 'utf-8');
  const pedidoManualContent = fs.readFileSync(pedidoManualPath, 'utf-8');
  const despachoContent = fs.readFileSync(despachoPath, 'utf-8');
  const cocinaContent = fs.readFileSync(cocinaPath, 'utf-8');

  test('1. Types: Define TipoPlato con ENSALADA y Pedido con ensaladaNombre', () => {
    assert.ok(
      typesContent.includes("'ENSALADA'"),
      'TipoPlato debe incluir el tipo explícito ENSALADA'
    );
    assert.ok(
      typesContent.includes('ensaladaNombre?: string;'),
      'Pedido debe incluir el campo ensaladaNombre?: string;'
    );
    assert.ok(
      typesContent.includes('ensaladas?: ResumenCocinaItem[];'),
      'ResumenCocina debe incluir la propiedad ensaladas?: ResumenCocinaItem[];'
    );
  });

  test('2. dataService: Mapea y persiste [Ensalada: ...] de forma transparente y calcula consolidado en cocina', () => {
    // Parser de Ensalada
    assert.ok(
      dataServiceContent.includes('[Ensalada:') &&
      dataServiceContent.includes('ensaladaNombre'),
      'mapearPedidoDesdeSupabase debe extraer [Ensalada: ...] de la observación'
    );

    // Persistencia en crearPedido
    assert.ok(
      dataServiceContent.includes('nuevo.ensaladaNombre') &&
      dataServiceContent.includes('[Ensalada: ${nuevo.ensaladaNombre}]'),
      'crearPedido debe almacenar [Ensalada: ...] para preservar la selección'
    );

    // Conteo en calcularResumenCocina
    assert.ok(
      dataServiceContent.includes('const esSinEnsalada =') &&
      dataServiceContent.includes('ensaladasMap'),
      'calcularResumenCocina debe contabilizar ensaladas excluyendo "Sin ensalada"'
    );
  });

  test('3. Vista de Padres: El formulario de pedido divide el almuerzo en 1. Entrada, 2. Segundo y 3. Ensalada', () => {
    // 1. Entrada
    assert.ok(
      padresContent.includes('1. Entrada (') || padresContent.includes('1. Entrada:'),
      'Debe contener sección claramente rotulada como 1. Entrada'
    );
    // Opción "Sin entrada / sopa"
    assert.ok(
      padresContent.includes("setEntradaSeleccionada('Sin entrada')"),
      'Debe permitir seleccionar la opción "Sin entrada"'
    );

    // 2. Segundo
    assert.ok(
      padresContent.includes('2. Segundo ('),
      'Debe contener sección rotulada como 2. Segundo'
    );

    // 3. Ensalada
    assert.ok(
      padresContent.includes('3. Ensalada ('),
      'Debe contener sección rotulada como 3. Ensalada'
    );
    // Opción "Sin ensalada"
    assert.ok(
      padresContent.includes("setEnsaladaSeleccionada('Sin ensalada')"),
      'Debe permitir seleccionar la opción "Sin ensalada"'
    );
  });

  test('4. Vista de Padres: El menú mantiene un solo precio global sin importar combinación elegida', () => {
    // El precio base del menú está asociado al segundo y no suma recargos por entrada o ensalada
    assert.ok(
      padresContent.includes('precioMenuBase') &&
      padresContent.includes('precioTotalPedido = precioMenuBase + totalExtras'),
      'El precio del menú es un solo precio base, solo añadiendo extras si el usuario los selecciona'
    );

    // Validación acepta "Sin ensalada"
    assert.ok(
      padresContent.includes('const esSinEnsalada =') &&
      padresContent.includes('const ensaladaValida = esSinEnsalada ||'),
      'Validación de orden debe aceptar válidamente "Sin ensalada"'
    );
  });

  test('5. Modal de Confirmación y WhatsApp: Muestran Entrada, Segundo y Ensalada desglosados', () => {
    // Modal de confirmación
    assert.ok(
      padresContent.includes('3. Ensalada:') &&
      padresContent.includes('ensaladaSeleccionada'),
      'Modal de confirmación debe mostrar la ensalada elegida o "Sin ensalada"'
    );

    // Mensaje de WhatsApp
    assert.ok(
      padresContent.includes('pedidoCompletado.ensaladaNombre'),
      'Mensaje de WhatsApp debe reflejar la ensalada si el usuario la seleccionó'
    );
  });

  test('6. Panel de Pedido Manual y Despacho: Muestran y gestionan la Ensalada seleccionada', () => {
    // Pedido manual
    assert.ok(
      pedidoManualContent.includes('3. Ensalada') &&
      pedidoManualContent.includes("setEnsaladaNombre('Sin ensalada')"),
      'Pedido manual debe ofrecer selector de ensalada con opción "Sin ensalada"'
    );

    // Despacho
    assert.ok(
      despachoContent.includes('p.ensaladaNombre') &&
      despachoContent.includes('Ensalada:'),
      'Pantalla de Despacho debe visualizar la Ensalada asignada al alumno'
    );

    // Cocina
    assert.ok(
      cocinaContent.includes('Consolidado de Ensaladas') || cocinaContent.includes('p.ensaladaNombre'),
      'Cocina debe reflejar las porciones de ensalada y el plato en las órdenes'
    );
  });
});
