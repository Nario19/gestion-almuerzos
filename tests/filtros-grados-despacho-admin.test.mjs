import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

test('Verificación Integral de Filtros Personalizados de Grados en Admin y Despacho', async (t) => {
  await t.test('1. En types/index.ts: Debe existir la interfaz FiltroGrados con tipado estricto', () => {
    const typesPath = path.join(projectRoot, 'src/types/index.ts');
    const content = fs.readFileSync(typesPath, 'utf8');

    assert.match(
      content,
      /export\s+interface\s+FiltroGrados\s*\{/,
      'Debe exportar la interfaz FiltroGrados'
    );
    assert.match(content, /id:\s*string;/, 'FiltroGrados debe contener id');
    assert.match(content, /colegioNombre:\s*string;/, 'FiltroGrados debe contener colegioNombre');
    assert.match(content, /nombre:\s*string;/, 'FiltroGrados debe contener nombre');
    assert.match(content, /grados:\s*string\[\];/, 'FiltroGrados debe contener grados como string[]');
    assert.match(content, /createdAt\?:\s*string;/, 'FiltroGrados debe contener createdAt opcional');
  });

  await t.test('2. En dataService.ts: Métodos de obtención, guardado y eliminación con persistencia y reactividad', () => {
    const dsPath = path.join(projectRoot, 'src/lib/dataService.ts');
    const content = fs.readFileSync(dsPath, 'utf8');

    // Debe importar FiltroGrados
    assert.match(
      content,
      /import\s+(?:type\s+)?\{[^}]*FiltroGrados[^}]*\}\s+from\s+['"]@\/types['"]/,
      'dataService debe importar FiltroGrados'
    );

    // Debe definir obtenerFiltrosGrados
    assert.match(
      content,
      /async\s+obtenerFiltrosGrados\s*\(\s*colegioNombreOId\?:\s*string\s*\):\s*Promise<FiltroGrados\[\]>/,
      'dataService debe implementar obtenerFiltrosGrados'
    );

    // Debe definir guardarFiltroGrados
    assert.match(
      content,
      /async\s+guardarFiltroGrados\s*\(/,
      'dataService debe implementar guardarFiltroGrados'
    );

    // Debe definir eliminarFiltroGrados
    assert.match(
      content,
      /async\s+eliminarFiltroGrados\s*\(/,
      'dataService debe implementar eliminarFiltroGrados'
    );

    // Debe usar localStorage y notificar listeners
    assert.match(
      content,
      /config_filtros_grados_/,
      'Debe almacenar en localStorage bajo clave config_filtros_grados_'
    );
    assert.match(
      content,
      /notifyListeners\(\)/,
      'Debe emitir notifyListeners() para actualización reactiva en tiempo real'
    );
  });

  await t.test('3. En admin/page.tsx: Panel interactivo de Filtros de Grados debajo de Grados y Secciones Activas', () => {
    const adminPath = path.join(projectRoot, 'src/app/admin/page.tsx');
    const content = fs.readFileSync(adminPath, 'utf8');

    // Debe importar FiltroGrados
    assert.match(
      content,
      /FiltroGrados/,
      'admin/page.tsx debe importar y utilizar FiltroGrados'
    );

    // Debe contener el título del panel de filtros
    assert.match(
      content,
      /Filtros de Grados para Despacho/,
      'admin/page.tsx debe mostrar la sección "Filtros de Grados para Despacho"'
    );

    // Debe permitir crear o editar filtros con nombre
    assert.match(
      content,
      /nombreFiltroGrados/,
      'admin/page.tsx debe gestionar el estado del nombre del filtro'
    );

    // Debe permitir seleccionar grados mediante checkboxes
    assert.match(
      content,
      /toggleGradoEnFiltro/,
      'admin/page.tsx debe permitir alternar grados en el filtro'
    );

    // Debe permitir seleccionar todos y deseleccionar todos
    assert.match(
      content,
      /handleSeleccionarTodosGrados/,
      'admin/page.tsx debe tener botón para seleccionar todos los grados'
    );
    assert.match(
      content,
      /handleDeseleccionarTodosGrados/,
      'admin/page.tsx debe tener botón para deseleccionar todos los grados'
    );

    // Debe guardar y permitir editar o eliminar
    assert.match(
      content,
      /handleGuardarFiltroGrados/,
      'admin/page.tsx debe tener handler para guardar filtro'
    );
    assert.match(
      content,
      /handleIniciarEditarFiltro/,
      'admin/page.tsx debe tener handler para editar filtro'
    );
    assert.match(
      content,
      /handleSolicitarEliminarFiltro/,
      'admin/page.tsx debe tener handler para eliminar filtro'
    );
  });

  await t.test('4. En despacho/page.tsx: Integración de filtros de grupos de grados, conteo y exportación', () => {
    const despachoPath = path.join(projectRoot, 'src/app/despacho/page.tsx');
    const content = fs.readFileSync(despachoPath, 'utf8');

    // Debe importar FiltroGrados y GraduationCap
    assert.match(
      content,
      /FiltroGrados/,
      'despacho/page.tsx debe importar FiltroGrados'
    );
    assert.match(
      content,
      /GraduationCap/,
      'despacho/page.tsx debe importar GraduationCap'
    );

    // Debe manejar los estados filtrosGrados y filtroGradosSeleccionado
    assert.match(
      content,
      /const\s*\[filtrosGrados,\s*setFiltrosGrados\]\s*=\s*useState<FiltroGrados\[\]>\(\[\]\);/,
      'despacho/page.tsx debe declarar estado filtrosGrados'
    );
    assert.match(
      content,
      /const\s*\[filtroGradosSeleccionado,\s*setFiltroGradosSeleccionado\]\s*=\s*useState<string>\(['"]TODOS['"]\);/,
      'despacho/page.tsx debe declarar estado filtroGradosSeleccionado'
    );

    // Debe cargar los filtros de grados con dataService.obtenerFiltrosGrados
    assert.match(
      content,
      /dataService\.obtenerFiltrosGrados\(/,
      'despacho/page.tsx debe llamar a dataService.obtenerFiltrosGrados'
    );

    // Debe aplicar el filtro en pedidosBase
    assert.match(
      content,
      /gradosSet\.has\(gPed\)/,
      'despacho/page.tsx debe filtrar pedidos por el conjunto de grados seleccionado'
    );

    // Debe renderizar la barra de chips de Filtro de Grados
    assert.match(
      content,
      /Filtro de Grados:/,
      'despacho/page.tsx debe renderizar la etiqueta "Filtro de Grados:"'
    );
    assert.match(
      content,
      /Todos los Grados/,
      'despacho/page.tsx debe tener el botón "Todos los Grados"'
    );

    // Debe calcular el conteo reactivo de pedidos por filtro de grados
    assert.match(
      content,
      /conteoPorFiltroGrado/,
      'despacho/page.tsx debe calcular conteo de pedidos por filtro de grado'
    );

    // Debe actualizar exportarExcel y la impresión física
    assert.match(
      content,
      /nombreGradoFiltro/,
      'despacho/page.tsx debe incluir el grupo de grados en el nombre de exportación a Excel'
    );
    assert.match(
      content,
      /filtroGradoActivo\s*\?\s*`\|\s*Grupo:\s*\$\{filtroGradoActivo\.nombre\}`\s*:\s*['"]['"]/,
      'despacho/page.tsx debe incluir el grupo en la cabecera de impresión física'
    );
  });
});
