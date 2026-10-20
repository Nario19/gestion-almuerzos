import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Navegación Admin desde Login y Visualización Limpia del Menú Público', async (t) => {
  const dataServicePath = path.resolve(process.cwd(), 'src/lib/dataService.ts');
  const authContextPath = path.resolve(process.cwd(), 'src/lib/authContext.tsx');
  const loginPagePath = path.resolve(process.cwd(), 'src/app/login/page.tsx');
  const middlewarePath = path.resolve(process.cwd(), 'src/middleware.ts');

  const dsContent = fs.readFileSync(dataServicePath, 'utf8');
  const authContent = fs.readFileSync(authContextPath, 'utf8');
  const loginContent = fs.readFileSync(loginPagePath, 'utf8');
  const mwContent = fs.readFileSync(middlewarePath, 'utf8');

  await t.test('1. dataService.obtenerPlatosPorDia maneja de forma tolerante el esquema de platos sin error', () => {
    const fnSnippet = dsContent.match(/async obtenerPlatosPorDia[\s\S]*?async agregarPlato/)?.[0] || '';
    assert.ok(
      fnSnippet.includes('error.code === \'42703\''),
      'obtenerPlatosPorDia debe capturar el error 42703 (columna inexistente en postgres)'
    );
    assert.ok(
      fnSnippet.includes('const fallbackQuery = supabase'),
      'obtenerPlatosPorDia debe tener fallback para traer platos del día'
    );
    assert.ok(
      fnSnippet.includes('const platosColegio = platos.filter((p) => {'),
      'Debe filtrar en memoria por colegioNombre o colegioId preservando aislamiento'
    );
  });

  await t.test('2. mapearPlatoDesdeSupabase limpia tags técnicos ([TipoOriginal], [Colegio], [Sopa], [Ensalada])', () => {
    assert.ok(
      dsContent.includes("descLimpia = descLimpia.replace(/\\[(Sopa|Ensalada)\\]\\s*/gi, '').trim();"),
      'Debe limpiar tags [Sopa] y [Ensalada] de descLimpia'
    );
    assert.ok(
      dsContent.includes("TipoOriginal:"),
      'Debe procesar y limpiar TipoOriginal de descLimpia'
    );
    assert.ok(
      dsContent.includes("Colegio:"),
      'Debe procesar y limpiar Colegio de descLimpia'
    );
  });

  await t.test('3. authContext sincroniza cookies de sesión de forma sincrónica e inmediata en login', () => {
    assert.ok(
      authContent.includes('export function sincronizarCookieSesion('),
      'sincronizarCookieSesion debe estar exportada y disponible'
    );
    assert.ok(
      authContent.includes('sincronizarCookieSesion(u);'),
      'login debe ejecutar sincronizarCookieSesion(u) inmediatamente'
    );
    assert.ok(
      authContent.includes('sincronizarCookieSesion(usuarioVerificado);'),
      'inicializarSesion debe ejecutar sincronizarCookieSesion(usuarioVerificado) inmediatamente'
    );
  });

  await t.test('4. resolverColegioAsignadoAdmin cuenta con fallback inteligente para admin de colegio', () => {
    assert.ok(
      authContent.includes('if (cols && cols.length === 1 && cols[0].nombre)'),
      'Debe asociar al colegio existente si sólo hay uno en la base de datos'
    );
    assert.ok(
      authContent.includes('matchId || matchDni || matchEmail'),
      'Debe comparar por id, dni o email en adminsColegio de SABADO'
    );
  });

  await t.test('5. En /login, los botones hacia /admin realizan navegación limpia enviando cookies al servidor', () => {
    assert.ok(
      loginContent.includes('href="/admin"'),
      'El enlace al panel de administración debe apuntar a /admin'
    );
    assert.ok(
      loginContent.includes("window.location.href = '/superadmin'"),
      'La redirección tras login exitoso debe usar window.location.href para garantizar cookies en HTTP'
    );
    assert.ok(
      loginContent.includes('href="/admin/despacho"'),
      'El enlace a despacho debe ser /admin/despacho y no /despacho'
    );
  });

  await t.test('6. middleware.ts valida sesión de administrador permitiendo el acceso si sesionRol es ADMIN', () => {
    assert.ok(
      mwContent.includes("const esAdmin = esSuperAdmin || sesionRol === 'ADMIN';"),
      'middleware debe calcular esAdmin considerando sesionRol === ADMIN'
    );
    assert.ok(
      mwContent.includes('if (!estaAutenticado || !esAdmin) {'),
      'middleware sólo debe redirigir si no está autenticado o no es admin'
    );
  });
});
