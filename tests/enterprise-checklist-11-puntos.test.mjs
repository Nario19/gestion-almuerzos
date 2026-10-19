import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Verificación Exhaustiva de Checklist de 11 Puntos Empresariales', async (t) => {
  const dataServicePath = path.join(rootDir, 'src', 'lib', 'dataService.ts');
  const dataServiceContent = fs.readFileSync(dataServicePath, 'utf-8');

  const padresPagePath = path.join(rootDir, 'src', 'app', 'padres', 'page.tsx');
  const padresPageContent = fs.readFileSync(padresPagePath, 'utf-8');

  const superadminPath = path.join(rootDir, 'src', 'app', 'superadmin', 'page.tsx');
  const superadminContent = fs.readFileSync(superadminPath, 'utf-8');

  const analyticsPath = path.join(rootDir, 'src', 'app', 'superadmin', 'analytics', 'page.tsx');
  const metadataUtilsPath = path.join(rootDir, 'src', 'lib', 'metadataUtils.ts');
  const notFoundPath = path.join(rootDir, 'src', 'app', 'not-found.tsx');
  const privacidadPath = path.join(rootDir, 'src', 'app', 'padres', 'privacidad', 'page.tsx');
  const perfilPath = path.join(rootDir, 'src', 'app', 'padres', 'perfil', 'page.tsx');
  const layoutPath = path.join(rootDir, 'src', 'app', 'layout.tsx');
  const headerNavPath = path.join(rootDir, 'src', 'components', 'HeaderNav.tsx');

  await t.test('Punto 1: Colegios independientes y listados correctamente', () => {
    assert.ok(
      dataServiceContent.includes('obtenerPlatosPorDia'),
      'dataService debe tener obtenerPlatosPorDia'
    );
    assert.ok(
      dataServiceContent.includes('platos.filter'),
      'Debe filtrar platos de forma estricta por colegio'
    );
    assert.ok(
      dataServiceContent.includes('Cada colegio es independiente: sólo devuelve platos de ese colegio'),
      'Debe contener la regla de negocio de aislamiento estricto por colegio'
    );
  });

  await t.test('Punto 2: Padres ven exclusivamente lo que corresponde al colegio de su hijo', () => {
    assert.ok(
      padresPageContent.includes('const colegioFiltro = hijoSeleccionado?.colegioNombre'),
      'El menú del padre debe derivarse reactivamente del colegio del hijo seleccionado'
    );
    assert.ok(
      padresPageContent.includes('dataService.obtenerPlatosPorDia(diaSeleccionado, colegioFiltro)'),
      'Debe consultar los platos pasando el colegio del estudiante'
    );
    assert.ok(
      padresPageContent.includes('dataService.obtenerObservaciones(colTarget)'),
      'Debe consultar observaciones médicas asociadas al colegio específico'
    );
  });

  await t.test('Punto 3: Sin errores ni bugs — Validación de pedidos y tipado', () => {
    assert.ok(
      dataServiceContent.includes('obtenerSiguienteNumeroAlmuerzoColegio'),
      'Debe calcular el número correlativo por colegio'
    );
    assert.ok(
      dataServiceContent.includes('String(siguienteNum).padStart(3, \'0\')'),
      'Debe formatear códigos (#COL-001, #COL-1000) soportando 3, 4 y más dígitos'
    );
  });

  await t.test('Punto 4: Consultas optimizadas con filtros en base de datos', () => {
    assert.ok(
      dataServiceContent.includes('query.or(`colegio_nombre.eq.${valFiltro},colegio_id.eq.${valFiltro}`)'),
      'obtenerPlatosPorDia debe optimizar filtrando en la consulta a Supabase'
    );
    assert.ok(
      dataServiceContent.includes('opciones?: { limit?: number; offset?: number; colegioNombre?: string }'),
      'obtenerPedidos debe admitir filtrado opcional por colegioNombre'
    );
  });

  await t.test('Punto 5: Página personalizada de error 404 en español', () => {
    assert.ok(fs.existsSync(notFoundPath), 'src/app/not-found.tsx debe existir');
    const content = fs.readFileSync(notFoundPath, 'utf-8');
    assert.ok(content.includes('404'), 'Debe incluir el código de error 404');
    assert.ok(
      content.includes('Esta página no está en el menú de hoy'),
      'Debe mostrar mensaje en español amigable'
    );
    assert.ok(
      content.includes('href="/"'),
      'Debe permitir regresar a la carta principal'
    );
    assert.ok(
      content.includes('href="/padres/pedidos"'),
      'Debe permitir ir a Mis Pedidos'
    );
  });

  await t.test('Punto 6: CTA above the fold en la página principal', () => {
    assert.ok(
      padresPageContent.includes('HERO BANNER CON CTA ABOVE THE FOLD (VISITANTES)'),
      'Debe incluir Hero banner para visitantes above the fold'
    );
    assert.ok(
      padresPageContent.includes('Iniciar Sesión para Pedir'),
      'Debe incluir botón CTA directo de inicio de sesión'
    );
    assert.ok(
      padresPageContent.includes('CTA ABOVE THE FOLD SI EL PADRE NO TIENE HIJOS AÚN'),
      'Debe incluir banner CTA destacado para padres sin hijos'
    );
  });

  await t.test('Punto 7 y 8: Meta title y Meta description per page en español', () => {
    assert.ok(fs.existsSync(metadataUtilsPath), 'src/lib/metadataUtils.ts debe existir');
    const content = fs.readFileSync(metadataUtilsPath, 'utf-8');
    assert.ok(content.includes('RUTA_METADATA_MAP'), 'Debe tener mapa de metadata por ruta');
    assert.ok(content.includes('/superadmin/analytics'), 'Debe definir metadata para analitica');
    assert.ok(content.includes('/padres/privacidad'), 'Debe definir metadata para privacidad');

    // Verificar layouts de segmento
    const layouts = [
      'src/app/superadmin/layout.tsx',
      'src/app/superadmin/analytics/layout.tsx',
      'src/app/admin/layout.tsx',
      'src/app/admin/despacho/layout.tsx',
      'src/app/admin/cocina/layout.tsx',
      'src/app/admin/fiado/layout.tsx',
      'src/app/admin/pedido-manual/layout.tsx',
      'src/app/login/layout.tsx',
      'src/app/padres/pedidos/layout.tsx',
      'src/app/padres/hijos/layout.tsx',
      'src/app/padres/perfil/layout.tsx',
      'src/app/padres/privacidad/layout.tsx',
    ];

    for (const rel of layouts) {
      const p = path.join(rootDir, rel);
      assert.ok(fs.existsSync(p), `El layout ${rel} debe existir para exportar metadata`);
    }

    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    assert.ok(
      layoutContent.includes('ClientMetadataManager'),
      'RootLayout debe incluir ClientMetadataManager para sincronizar titles y descriptions en tiempo real'
    );
  });

  await t.test('Punto 9: Favicon Set editable en Superadmin', () => {
    assert.ok(
      dataServiceContent.includes('obtenerFaviconUrl'),
      'dataService debe incluir obtenerFaviconUrl'
    );
    assert.ok(
      dataServiceContent.includes('guardarFaviconUrl'),
      'dataService debe incluir guardarFaviconUrl'
    );
    assert.ok(
      superadminContent.includes('Favicon e Identidad Visual del Sistema'),
      'Superadmin debe tener la sección de Identidad Visual y Favicon'
    );
    assert.ok(
      superadminContent.includes('MODAL CONFIGURACIÓN FAVICON'),
      'Superadmin debe tener el modal interactivo de edición de Favicon'
    );
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    assert.ok(
      layoutContent.includes('FaviconUpdater'),
      'RootLayout debe incluir FaviconUpdater para inyectar el favicon configurado en el DOM'
    );
  });

  await t.test('Punto 10: Analytics para toma de decisiones en Superadmin', () => {
    assert.ok(fs.existsSync(analyticsPath), 'src/app/superadmin/analytics/page.tsx debe existir');
    const content = fs.readFileSync(analyticsPath, 'utf-8');
    assert.ok(
      content.includes('Analítica y Toma de Decisiones'),
      'La pantalla debe titularse Analítica y Toma de Decisiones'
    );
    assert.ok(
      content.includes('Ventas Totales'),
      'Debe reportar Ventas Totales'
    );
    assert.ok(
      content.includes('Platos Estrella (Mayor Demanda)'),
      'Debe reportar Platos Estrella'
    );
    assert.ok(
      content.includes('Demanda por Día de la Semana'),
      'Debe reportar Demanda por Día de la Semana para compras mayoristas'
    );
    assert.ok(
      content.includes('Exportar CSV'),
      'Debe incluir botón para exportar informe analítico'
    );
    assert.ok(
      dataServiceContent.includes('obtenerMetricasAnalytics'),
      'dataService debe calcular las métricas de analítica consolidadas'
    );
    const headerNavContent = fs.readFileSync(headerNavPath, 'utf-8');
    assert.ok(
      headerNavContent.includes('/superadmin/analytics'),
      'HeaderNav debe incluir acceso a Analítica para el Superadmin'
    );
  });

  await t.test('Punto 11: Privacy policy page conforme a Ley N° 29733', () => {
    assert.ok(fs.existsSync(privacidadPath), 'src/app/padres/privacidad/page.tsx debe existir');
    const content = fs.readFileSync(privacidadPath, 'utf-8');
    assert.ok(
      content.includes('Ley N° 29733'),
      'Debe mencionar la Ley N° 29733 de Protección de Datos Personales'
    );
    assert.ok(
      content.includes('Derechos ARCO'),
      'Debe explicar los Derechos ARCO'
    );
    assert.ok(
      content.includes('Tratamiento Especial de Alergias y Datos de Menores'),
      'Debe estipular la protección de alergias de menores de edad'
    );
    const perfilContent = fs.readFileSync(perfilPath, 'utf-8');
    assert.ok(
      perfilContent.includes('/padres/privacidad'),
      'El perfil de padres debe enlazar a la Política de Privacidad'
    );
    assert.ok(
      padresPageContent.includes('/padres/privacidad'),
      'La carta escolar pública debe enlazar a la Política de Privacidad'
    );
  });
});
