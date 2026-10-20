import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Menú Separado: Sopas, Ensaladas y Segundos con Añadir Rápido (+)', () => {
  const adminMenuTabPath = path.resolve(process.cwd(), 'src/app/admin/components/AdminMenuSemanalTab.tsx');
  const padresPagePath = path.resolve(process.cwd(), 'src/app/padres/page.tsx');
  const dataServicePath = path.resolve(process.cwd(), 'src/lib/dataService.ts');

  test('1. AdminMenuSemanalTab incluye selector de tipo (Sopa, Ensalada, Segundo) en el formulario de menú', () => {
    const tabContent = fs.readFileSync(adminMenuTabPath, 'utf-8');

    // Selector de tipo individual
    assert.ok(
      tabContent.includes('tipoSeleccionadoMenu') || tabContent.includes('setTipoSeleccionadoMenu'),
      'Debe incluir estado o selector tipoSeleccionadoMenu en el formulario'
    );

    assert.ok(
      tabContent.includes('setTipoSeleccionadoMenu(\'Sopa\')') &&
      tabContent.includes('setTipoSeleccionadoMenu(\'Ensalada\')') &&
      tabContent.includes('setTipoSeleccionadoMenu(\'Segundo\')'),
      'El formulario debe permitir seleccionar directamente si se agrega Sopa, Ensalada o Segundo'
    );
  });

  test('2. Listado del menú escolar está separado en bloques independientes: Sopas, Ensaladas y Segundos', () => {
    const tabContent = fs.readFileSync(adminMenuTabPath, 'utf-8');

    // Bloque 1: Sopas
    assert.ok(
      tabContent.includes('Sopas ({platosSopa.length})') || tabContent.includes('platosSopa.map'),
      'Debe existir un bloque claramente dedicado y filtrado para Sopas'
    );

    // Bloque 2: Ensaladas
    assert.ok(
      tabContent.includes('Ensaladas ({platosEnsalada.length})') || tabContent.includes('platosEnsalada.map'),
      'Debe existir un bloque claramente dedicado y filtrado para Ensaladas'
    );

    // Bloque 3: Segundos
    assert.ok(
      tabContent.includes('Segundos (Platos de Fondo) ({platosSegundo.length})') || tabContent.includes('platosSegundo.map'),
      'Debe existir un bloque claramente dedicado para Segundos (Platos de Fondo)'
    );
  });

  test('3. Cada bloque del menú cuenta con su opción de más (+) para añadir directamente', () => {
    const tabContent = fs.readFileSync(adminMenuTabPath, 'utf-8');

    // Botón + Añadir Sopa
    assert.ok(
      tabContent.includes('Añadir Sopa') && tabContent.includes('setTipoSeleccionadoMenu(\'Sopa\')'),
      'El bloque de Sopas debe tener botón para añadir sopa que active ese tipo en el formulario'
    );

    // Botón + Añadir Ensalada
    assert.ok(
      tabContent.includes('Añadir Ensalada') && tabContent.includes('setTipoSeleccionadoMenu(\'Ensalada\')'),
      'El bloque de Ensaladas debe tener botón para añadir ensalada que active ese tipo en el formulario'
    );

    // Botón + Añadir Segundo
    assert.ok(
      tabContent.includes('Añadir Segundo') && tabContent.includes('setTipoSeleccionadoMenu(\'Segundo\')'),
      'El bloque de Segundos debe tener botón para añadir segundo que active ese tipo en el formulario'
    );
  });

  test('4. dataService mapea y almacena Ensaladas y Sopas con clasificación consistente', () => {
    const dataServiceContent = fs.readFileSync(dataServicePath, 'utf-8');

    assert.ok(
      dataServiceContent.includes('matchSubtipo') ||
      (dataServiceContent.includes('ENSALADA') && dataServiceContent.includes('SOPA')),
      'dataService debe manejar y distinguir la clasificación técnica de Sopas y Ensaladas'
    );

    assert.ok(
      dataServiceContent.includes('tipoNormalizado.includes(\'ENSALADA\')'),
      'agregarPlato debe clasificar ENSALADA como ENTRADA en la base de datos para respetar constraint'
    );
  });

  test('5. En la vista de Padres (Ver Menú), Sopas y Ensaladas se presentan en secciones separadas', () => {
    const padresContent = fs.readFileSync(padresPagePath, 'utf-8');

    assert.ok(
      padresContent.includes('1. Sopas (') &&
      padresContent.includes('2. Ensaladas ('),
      'La carta de los padres debe desglosar las Sopas y las Ensaladas en secciones separadas'
    );

    assert.ok(
      padresContent.includes('2. Segundo (Plato de Fondo)'),
      'La carta de los padres debe incluir los Segundos de forma diferenciada'
    );
  });
});
