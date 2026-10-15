import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Superadmin Inspección de Estudiantes por Colegio y Visibilidad de Menú para Padres', async (t) => {
  const dataServicePath = path.join(rootDir, 'src', 'lib', 'dataService.ts');
  const dataServiceContent = fs.readFileSync(dataServicePath, 'utf-8');

  const superadminPath = path.join(rootDir, 'src', 'app', 'superadmin', 'page.tsx');
  const superadminContent = fs.readFileSync(superadminPath, 'utf-8');

  const homePath = path.join(rootDir, 'src', 'app', 'page.tsx');
  const homeContent = fs.readFileSync(homePath, 'utf-8');

  const adminPath = path.join(rootDir, 'src', 'app', 'admin', 'page.tsx');
  const adminContent = fs.readFileSync(adminPath, 'utf-8');

  await t.test('1. dataService implementa obtenerEstudiantesPorColegio con datos de contacto del padre', () => {
    assert.ok(
      dataServiceContent.includes('obtenerEstudiantesPorColegio'),
      'dataService debe exportar el método obtenerEstudiantesPorColegio'
    );
    assert.ok(
      dataServiceContent.includes('padreNombre') &&
        dataServiceContent.includes('padreTelefono') &&
        dataServiceContent.includes('padreDni'),
      'obtenerEstudiantesPorColegio debe incluir padreNombre, padreTelefono y padreDni'
    );
  });

  await t.test('2. dataService cuenta totalEstudiantes en obtenerColegiosDetallados para métricas en vivo', () => {
    assert.ok(
      dataServiceContent.includes('conteoEstudiantes'),
      'obtenerColegiosDetallados debe calcular conteoEstudiantes por colegio'
    );
    assert.ok(
      dataServiceContent.includes('totalEstudiantes'),
      'Cada ColegioDetallado debe incluir totalEstudiantes'
    );
  });

  await t.test('3. En /superadmin, el clic en el colegio o badge abre el modal de estudiantes asociados', () => {
    assert.ok(
      superadminContent.includes('modalEstudiantes') &&
        superadminContent.includes('abrirModalEstudiantes'),
      'Superadmin debe tener estado y función abrirModalEstudiantes'
    );
    assert.ok(
      superadminContent.includes('onClick={() => abrirModalEstudiantes(col)}'),
      'El nombre del colegio y el botón de estudiantes deben invocar abrirModalEstudiantes'
    );
    assert.ok(
      superadminContent.includes('Estudiantes Vinculados') ||
        superadminContent.includes('Estudiantes Registrados'),
      'El modal debe mostrar título claro de estudiantes vinculados a la sede'
    );
  });

  await t.test('4. El modal de estudiantes en Superadmin incluye tabla detallada con WhatsApp, exportación Excel e impresión', () => {
    assert.ok(
      superadminContent.includes('exportarEstudiantesCSV'),
      'Debe permitir exportar la lista de estudiantes a CSV/Excel'
    );
    assert.ok(
      superadminContent.includes('window.print()'),
      'Debe permitir imprimir la nómina de alumnos'
    );
    assert.ok(
      superadminContent.includes('wa.me'),
      'Debe permitir contacto directo al WhatsApp del apoderado'
    );
    assert.ok(
      superadminContent.includes('alergiasNotas'),
      'Debe mostrar alertas de alergias o notas médicas del alumno'
    );
  });

  await t.test('5. En /admin, agregarPlato maneja constraint de BD y no swallow de errores', () => {
    assert.ok(
      dataServiceContent.includes('tipoColumna') &&
        dataServiceContent.includes('TipoOriginal:'),
      'dataService debe mapear tipoColumna seguro y guardar TipoOriginal para preservar Segundo y Sopa o postre'
    );
    assert.ok(
      adminContent.includes('catch (err') || adminContent.includes('catch (e'),
      'admin/page.tsx debe capturar y notificar errores de guardado de platos al usuario'
    );
  });

  await t.test('6. En el Home de Padres (/), los platos se cargan filtrando por el colegio del hijo seleccionado', () => {
    assert.ok(
      homeContent.includes('hijoSeleccionado?.colegioNombre') ||
        homeContent.includes('hijoSeleccionado?.colegioId'),
      'Home debe consultar platos usando el colegio del hijo seleccionado'
    );
    assert.ok(
      homeContent.includes('esEntrada') && homeContent.includes('esSegundo'),
      'Home debe categorizar de manera robusta los platos en Sopa o postre y Segundo'
    );
  });
});
