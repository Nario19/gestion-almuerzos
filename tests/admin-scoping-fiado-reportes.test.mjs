import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Scoping de Colegios, Reportes de Fiado, Despacho Auto-Refresh y Tipos de Platos Editables', async (t) => {
  await t.test('1. Admin de Colegio no ve pestaña de Colegios ni "Mi Sede" para agregar o eliminar colegios', () => {
    const adminPath = path.join(rootDir, 'src', 'app', 'admin', 'page.tsx');
    const adminContent = fs.readFileSync(adminPath, 'utf-8');

    // Comprobar que tabActiva no incluye 'colegios'
    assert.ok(
      !adminContent.includes("setTabActiva('colegios')"),
      'Los administradores de colegio no deben tener botón ni pestaña de colegios'
    );
    assert.ok(
      !adminContent.includes('Mi Sede ('),
      'El panel de admin no debe mostrar texto ni pestaña "Mi Sede (...)"'
    );
    assert.ok(
      !adminContent.includes('Colegios Disponibles ('),
      'El panel de admin de colegio no debe mostrar listado de colegios disponibles'
    );
  });

  await t.test('2. Superadmin crea colegios sólo con Nombre del Colegio (sin campo Sede)', () => {
    const superadminPath = path.join(rootDir, 'src', 'app', 'superadmin', 'page.tsx');
    const superadminContent = fs.readFileSync(superadminPath, 'utf-8');

    // No debe pedir "Sede" en el formulario de creación
    assert.ok(
      !superadminContent.includes('Sede / Ubicación'),
      'El modal de Superadmin no debe solicitar campo Sede / Ubicación'
    );
    assert.ok(
      superadminContent.includes('Nombre del Colegio *'),
      'El modal de Superadmin debe pedir Nombre del Colegio'
    );
  });

  await t.test('3. Fiado cuenta con Reporte Global y Reporte por Padre detallado por cada hijo', () => {
    const fiadoPath = path.join(rootDir, 'src', 'app', 'admin', 'fiado', 'page.tsx');
    const fiadoContent = fs.readFileSync(fiadoPath, 'utf-8');

    // Botón de Reporte Global y Excel
    assert.ok(
      fiadoContent.includes('Reporte Global') && fiadoContent.includes('setMostrarReporteGlobal(true)'),
      'Debe incluir botón y modal de Reporte Global'
    );
    assert.ok(
      fiadoContent.includes('exportarReporteGlobalExcel'),
      'Debe incluir exportación de Reporte Global a Excel'
    );

    // En reporte del padre: debe decir "Padre de Familia" y no "Apoderado / Padre"
    assert.ok(
      fiadoContent.includes('Padre de Familia:'),
      'Debe decir Padre de Familia'
    );
    assert.ok(
      !fiadoContent.includes('Apoderado / Padre:'),
      'No debe decir Apoderado / Padre'
    );

    // Detalle agrupado por estudiante
    assert.ok(
      fiadoContent.includes('Detalle Cronológico por Estudiante:') || fiadoContent.includes('porHijo'),
      'Debe desglosar los consumos agrupados por cada hijo'
    );
  });

  await t.test('4. Despacho cuenta con auto-actualización continua y nomenclatura Padre', () => {
    const despachoPath = path.join(rootDir, 'src', 'app', 'admin', 'despacho', 'page.tsx');
    const despachoContent = fs.readFileSync(despachoPath, 'utf-8');

    // Auto-actualización periódica
    assert.ok(
      despachoContent.includes('setInterval') && despachoContent.includes('clearInterval'),
      'Despacho debe tener un intervalo de auto-actualización periódica continua'
    );

    // Muestra "Padre:"
    assert.ok(
      despachoContent.includes('Padre:'),
      'Despacho debe mostrar Padre: en la columna de nombres'
    );
  });

  await t.test('5. En hijos y en el flujo, se erradica el término Tutor por Padre', () => {
    const hijosPath = path.join(rootDir, 'src', 'app', 'padres', 'hijos', 'page.tsx');
    const hijosContent = fs.readFileSync(hijosPath, 'utf-8');

    assert.ok(
      !hijosContent.includes('Tutor:'),
      'La pantalla de hijos no debe usar el término Tutor'
    );
    assert.ok(
      hijosContent.includes('Padre:'),
      'La pantalla de hijos debe usar el término Padre'
    );
  });

  await t.test('6. Menú semanal permite tipos de platos configurables y editables (+ Otro tipo)', () => {
    const adminPath = path.join(rootDir, 'src', 'app', 'admin', 'page.tsx');
    const adminContent = fs.readFileSync(adminPath, 'utf-8');

    assert.ok(
      adminContent.includes('tiposDisponibles') && adminContent.includes('handleAgregarTipoPersonalizado'),
      'Admin debe permitir agregar tipos de platos personalizados como refrigerios'
    );
    assert.ok(
      adminContent.includes('+ Otro tipo...'),
      'Admin debe mostrar botón "+ Otro tipo..." para tipos dinámicos'
    );
    assert.ok(
      adminContent.includes('platosPorCategoria'),
      'Admin debe agrupar los platos dinámicamente por categoría'
    );
  });

  await t.test('7. Menús 100% independientes por colegio: no hay fallback a platos de otros colegios', () => {
    const dataServicePath = path.join(rootDir, 'src', 'lib', 'dataService.ts');
    const dataServiceContent = fs.readFileSync(dataServicePath, 'utf-8');

    assert.ok(
      dataServiceContent.includes('colegioIdONombre'),
      'dataService debe soportar colegioId o colegioNombre para filtrado estricto'
    );
    assert.ok(
      !dataServiceContent.includes('platosColegio.length === 0 ? platos.filter((p) => !p.colegioNombre) : platosColegio'),
      'dataService NO debe retornar platos genéricos si el colegio no tiene platos'
    );
  });
});
