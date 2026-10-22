import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Logout Directo a Login y Visualización Robusta del Nombre del Colegio en Fiado', async (t) => {
  const rootDir = process.cwd();
  const authContextPath = path.join(rootDir, 'src/lib/authContext.tsx');
  const accesoPath = path.join(rootDir, 'src/components/AccesoRestringido.tsx');
  const fiadoPath = path.join(rootDir, 'src/app/admin/fiado/page.tsx');
  const dataServicePath = path.join(rootDir, 'src/lib/dataService.ts');

  const authContent = fs.readFileSync(authContextPath, 'utf8');
  const accesoContent = fs.readFileSync(accesoPath, 'utf8');
  const fiadoContent = fs.readFileSync(fiadoPath, 'utf8');
  const dataServiceContent = fs.readFileSync(dataServicePath, 'utf8');

  await t.test('1. logout() ejecuta redirección inmediata hacia /login', () => {
    assert.ok(
      authContent.includes("window.location.href = '/login'") ||
      authContent.includes("window.location.replace('/login')"),
      'logout() debe redirigir directamente hacia /login'
    );
  });

  await t.test('2. AccesoRestringido auto-redirige silenciosamente al login si el usuario no tiene sesión', () => {
    assert.ok(
      accesoContent.includes('window.location.replace(urlLogin)'),
      'AccesoRestringido debe redirigir al login si no hay sesión activa'
    );
    assert.ok(
      accesoContent.includes('!cargando && !usuario'),
      'AccesoRestringido debe comprobar si el usuario no tiene sesión activa'
    );
  });

  await t.test('3. En Fiado (/admin/fiado), la barra de selector muestra el nombre del colegio junto a "Colegio:"', () => {
    assert.ok(
      fiadoContent.includes('nombreColegioActivo'),
      'Fiado debe calcular nombreColegioActivo de forma reactiva'
    );
    assert.ok(
      fiadoContent.includes('Colegio: {usuario?.colegioNombre || nombreColegioActivo}') ||
      fiadoContent.includes('🏫 Colegio:'),
      'Cabecera de Fiado debe mostrar la insignia del colegio'
    );
    assert.ok(
      fiadoContent.includes('{nombreColegioActivo}'),
      'Selector de Colegio en Fiado debe renderizar el nombre del colegio activo junto al label'
    );
  });

  await t.test('4. En cada tarjeta de familia en Fiado, se muestra el badge del Colegio', () => {
    assert.ok(
      fiadoContent.includes('Colegio: {padre.colegioNombre || nombreColegioActivo}'),
      'Cada tarjeta de familia debe incluir el badge visible del colegio'
    );
  });

  await t.test('5. dataService.obtenerFiados y mapearPedido garantizan persistencia del colegioNombre', () => {
    assert.ok(
      dataServiceContent.includes("colegioNombre: p.colegioNombre || (colegioNombre && colegioNombre !== 'TODOS' ? colegioNombre : '')"),
      'obtenerFiados debe asegurar fallback para colegioNombre en cada grupo'
    );
    assert.ok(
      dataServiceContent.includes("[Colegio:"),
      'mapearPedidoDesdeSupabase debe extraer [Colegio: del texto de observación si viene vacío en columna'
    );
  });
});
