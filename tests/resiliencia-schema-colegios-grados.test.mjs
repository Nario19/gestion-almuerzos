import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Resiliencia de Esquema en Supabase: Tabla Colegios sin Columnas Extendidas (grados, observaciones, sigla)', async (t) => {
  const dataServicePath = path.resolve(process.cwd(), 'src/lib/dataService.ts');
  const fileContent = fs.readFileSync(dataServicePath, 'utf8');

  await t.test('1. dataService define banderas de capacidad para tolerancia de esquema', () => {
    assert.ok(
      fileContent.includes('colegiosSoportaGrados'),
      'dataService debe definir la bandera colegiosSoportaGrados'
    );
    assert.ok(
      fileContent.includes('colegiosSoportaObservaciones'),
      'dataService debe definir la bandera colegiosSoportaObservaciones'
    );
    assert.ok(
      fileContent.includes('colegiosSoportaSigla'),
      'dataService debe definir la bandera colegiosSoportaSigla'
    );
  });

  await t.test('2. obtenerColegiosDetallados inspecciona las columnas reales de colegios dinámicamente', () => {
    assert.ok(
      fileContent.includes("colegiosSoportaGrados = 'grados' in primero;"),
      'obtenerColegiosDetallados debe detectar si colegios tiene columna grados'
    );
    assert.ok(
      fileContent.includes("colegiosSoportaObservaciones = 'observaciones' in primero;"),
      'obtenerColegiosDetallados debe detectar si colegios tiene columna observaciones'
    );
    assert.ok(
      fileContent.includes("colegiosSoportaSigla = 'sigla' in primero;"),
      'obtenerColegiosDetallados debe detectar si colegios tiene columna sigla'
    );
  });

  await t.test('3. crearColegioConAdmin no fuerza grados ni observaciones en el insert si no están soportados', () => {
    // Verificar que en crearColegioConAdmin el payload base sólo incluye nombre, sede y activo
    const crearSnippetMatch = fileContent.match(/async crearColegioConAdmin[\s\S]*?let colPayload: Record<string, unknown> = \{[\s\S]*?\};/);
    assert.ok(crearSnippetMatch, 'Debe encontrarse la inicialización de colPayload en crearColegioConAdmin');
    const snippet = crearSnippetMatch[0];
    assert.ok(snippet.includes('nombre: nombreLimpio'), 'colPayload base debe incluir nombre');
    assert.ok(snippet.includes('sede: sedeConAdmin'), 'colPayload base debe incluir sede');
    assert.ok(snippet.includes('activo: colegio.activo !== false'), 'colPayload base debe incluir activo');
    assert.ok(!snippet.includes('grados: GRADOS_DEFAULT,'), 'colPayload base no debe forzar grados incondicionalmente');
    assert.ok(!snippet.includes('observaciones: OBSERVACIONES_DEFAULT,'), 'colPayload base no debe forzar observaciones incondicionalmente');
  });

  await t.test('4. crearColegioConAdmin implementa auto-recuperación ante PGRST204 / schema cache errors', () => {
    assert.ok(
      fileContent.includes("errCol.code === 'PGRST204'"),
      'Debe capturar específicamente el código de error PGRST204'
    );
    assert.ok(
      fileContent.includes("String(errCol.message || '').includes('schema cache')"),
      'Debe detectar mensajes de error de schema cache de PostgREST'
    );
    assert.ok(
      fileContent.includes("reintentando con payload base"),
      'Debe reintentar la inserción con el payload base garantizado'
    );
  });

  await t.test('5. obtenerGrados y guardarGradosColegio protegen llamadas a Supabase evitando error 42703', () => {
    assert.ok(
      fileContent.includes("if (colegiosSoportaGrados) {\n        try {\n          const esUuid"),
      'obtenerGrados debe verificar colegiosSoportaGrados antes de consultar la columna'
    );
    assert.ok(
      fileContent.includes("if (colegiosSoportaGrados) {\n        try {\n          const esUuid = colKey.length === 36 && colKey.includes('-');\n          let query = supabase.from('colegios').update({ grados: nuevosGrados });"),
      'guardarGradosColegio debe verificar colegiosSoportaGrados antes de intentar actualizar la columna'
    );
  });

  await t.test('6. obtenerObservaciones y guardarObservacionesColegio protegen llamadas a Supabase evitando error 42703', () => {
    assert.ok(
      fileContent.includes("if (colegiosSoportaObservaciones) {\n        try {\n          const esUuid"),
      'obtenerObservaciones debe verificar colegiosSoportaObservaciones antes de consultar la columna'
    );
    assert.ok(
      fileContent.includes("if (colegiosSoportaObservaciones) {\n        try {\n          const esUuid = colKey.length === 36 && colKey.includes('-');\n          let query = supabase.from('colegios').update({ observaciones: nuevasObs });"),
      'guardarObservacionesColegio debe verificar colegiosSoportaObservaciones antes de intentar actualizar la columna'
    );
  });

  await t.test('7. Menus_dia (SABADO) garantiza la persistencia integral de grados, observaciones, siglas y admins', () => {
    assert.ok(
      fileContent.includes("cfgObj.gradosPorColegio[nombreLimpio] = [...GRADOS_DEFAULT];"),
      'menus_dia SABADO debe respaldar gradosPorColegio'
    );
    assert.ok(
      fileContent.includes("cfgObj.observacionesPorColegio[nombreLimpio] = [...OBSERVACIONES_DEFAULT];"),
      'menus_dia SABADO debe respaldar observacionesPorColegio'
    );
    assert.ok(
      fileContent.includes("cfgObj.adminsColegio[nombreLimpio] = {"),
      'menus_dia SABADO debe respaldar adminsColegio'
    );
  });

  await t.test('8. Migración SQL consolidada existe con NOTIFY pgrst, reload schema', () => {
    const migPath = path.resolve(process.cwd(), 'supabase/migrations/202610190002_colegios_columnas_compatibilidad.sql');
    assert.ok(fs.existsSync(migPath), 'Debe existir el archivo de migración');
    const migContent = fs.readFileSync(migPath, 'utf8');
    assert.ok(migContent.includes('ALTER TABLE public.colegios'), 'Migración debe alterar tabla colegios');
    assert.ok(migContent.includes("ADD COLUMN IF NOT EXISTS grados jsonb"), 'Migración debe añadir grados');
    assert.ok(migContent.includes("ADD COLUMN IF NOT EXISTS observaciones jsonb"), 'Migración debe añadir observaciones');
    assert.ok(migContent.includes("ADD COLUMN IF NOT EXISTS sigla varchar(10)"), 'Migración debe añadir sigla');
    assert.ok(migContent.includes("NOTIFY pgrst, 'reload schema'"), 'Migración debe recargar el schema cache de PostgREST');
  });
});
