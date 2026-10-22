import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Optimización Admin y Filtro de Colegio para Padres sin Hijos', () => {
  const rootDir = process.cwd();
  const dataServicePath = path.join(rootDir, 'src', 'lib', 'dataService.ts');
  const adminPagePath = path.join(rootDir, 'src', 'app', 'admin', 'page.tsx');
  const padresPagePath = path.join(rootDir, 'src', 'app', 'padres', 'page.tsx');

  const dataServiceContent = fs.readFileSync(dataServicePath, 'utf-8');
  const adminContent = fs.readFileSync(adminPagePath, 'utf-8');
  const padresContent = fs.readFileSync(padresPagePath, 'utf-8');

  test('1. dataService implementa precargarSemana para precargar en segundo plano la semana escolar', () => {
    assert.ok(
      dataServiceContent.includes('async precargarSemana(colegioNombre?: string)'),
      'dataService debe implementar el método precargarSemana'
    );
    assert.ok(
      dataServiceContent.includes('Promise.allSettled(dias.map'),
      'precargarSemana debe invocar los días de la semana con Promise.allSettled'
    );
  });

  test('2. Panel de Administración (/admin) implementa precarga automática de la semana escolar', () => {
    assert.ok(
      adminContent.includes('dataService.precargarSemana(colFiltro)'),
      'El panel de administración debe precargar la semana para el colegio filtrado'
    );
    assert.ok(
      adminContent.includes('// Precarga silenciosa (prefetch) de toda la semana escolar en el panel de administración'),
      'Debe incluir el efecto de prefetch en el panel de administración'
    );
  });

  test('3. Vista de Padres (/padres) precarga la semana escolar usando precargarSemana', () => {
    assert.ok(
      padresContent.includes('dataService.precargarSemana(colegioFiltro)'),
      'La vista de padres debe usar precargarSemana para llenar la memoria caché'
    );
  });

  test('4. Padre sin hijos registrados cuenta con selector de colegio para explorar la carta', () => {
    assert.ok(
      padresContent.includes('usuario && usuario.rol !== \'ADMIN\' && (!usuario.hijos || usuario.hijos.length === 0)'),
      'Debe evaluar la condición cuando el padre no tiene hijos registrados'
    );

    assert.ok(
      padresContent.includes('Ver carta del colegio:'),
      'Debe mostrar la etiqueta "Ver carta del colegio:" cuando el padre no tiene hijos registrados'
    );

    assert.ok(
      padresContent.includes('onChange={(e) => setColegio(e.target.value)}'),
      'Debe permitir cambiar el colegio activo con setColegio'
    );
  });

  test('5. Padre con hijos registrados oculta el selector libre y activa el selector de hijos vinculados', () => {
    assert.ok(
      padresContent.includes('usuario && usuario.rol !== \'ADMIN\' && usuario.hijos && usuario.hijos.length > 0'),
      'Debe evaluar la condición de tener hijos registrados para mostrar únicamente sus hijos'
    );

    assert.ok(
      padresContent.includes('seleccionarHijo(hijo)'),
      'Debe permitir seleccionar entre los hijos registrados'
    );
  });
});
