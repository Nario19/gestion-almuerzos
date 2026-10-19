import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const middlewarePath = path.join(rootDir, 'src/middleware.ts');
const errorPath = path.join(rootDir, 'src/app/error.tsx');
const accesoPath = path.join(rootDir, 'src/components/AccesoRestringido.tsx');
const dataServicePath = path.join(rootDir, 'src/lib/dataService.ts');
const authContextPath = path.join(rootDir, 'src/lib/authContext.tsx');
const loginPagePath = path.join(rootDir, 'src/app/login/page.tsx');

test('Verificación de Protección Middleware, Manejo de Acceso Restringido y Prevención de Errores', async (t) => {
  await t.test('1. Middleware de Next.js existe y protege rutas privadas', () => {
    assert.ok(fs.existsSync(middlewarePath), 'src/middleware.ts debe existir');
    const content = fs.readFileSync(middlewarePath, 'utf-8');
    assert.ok(content.includes('export function middleware'), 'Debe exportar función middleware');
    assert.ok(content.includes('/superadmin'), 'Debe evaluar rutas de /superadmin');
    assert.ok(content.includes('/admin'), 'Debe evaluar rutas de /admin');
    assert.ok(content.includes('/padres/pedidos'), 'Debe evaluar rutas privadas de padres');
    assert.ok(content.includes("'no_acceso'"), 'Debe redirigir con parámetro error=no_acceso');
    assert.ok(content.includes('sesion_rol'), 'Debe verificar cookies de sesión');
  });

  await t.test('2. Sincronización de cookies de sesión en authContext', () => {
    assert.ok(fs.existsSync(authContextPath), 'src/lib/authContext.tsx debe existir');
    const content = fs.readFileSync(authContextPath, 'utf-8');
    assert.ok(content.includes('sincronizarCookieSesion'), 'Debe implementar sincronizarCookieSesion');
    assert.ok(content.includes('sesion_rol='), 'Debe guardar sesion_rol en cookie para middleware');
    assert.ok(content.includes('sesion_activa='), 'Debe guardar sesion_activa en cookie');
  });

  await t.test('3. Login muestra banner explicativo ante acceso restringido y soporta redirección', () => {
    assert.ok(fs.existsSync(loginPagePath), 'src/app/login/page.tsx debe existir');
    const content = fs.readFileSync(loginPagePath, 'utf-8');
    assert.ok(
      content.includes("searchParams.get('error') === 'no_acceso'"),
      'Debe detectar el parámetro error=no_acceso'
    );
    assert.ok(
      content.includes('No tienes acceso a esa página'),
      'Debe mostrar mensaje claro indicando que no tiene acceso'
    );
    assert.ok(
      content.includes("searchParams.get('redirigir')"),
      'Debe capturar parámetro redirigir para devolver al usuario tras autenticarse'
    );
  });

  await t.test('4. AccesoRestringido ofrece navegación al login y a la carta', () => {
    assert.ok(fs.existsSync(accesoPath), 'src/components/AccesoRestringido.tsx debe existir');
    const content = fs.readFileSync(accesoPath, 'utf-8');
    assert.ok(content.includes('No tienes acceso a esta página'), 'Debe incluir título claro');
    assert.ok(content.includes('urlLogin') || content.includes('/login'), 'Debe incluir enlace para ir a iniciar sesión');
    assert.ok(content.includes('href="/"'), 'Debe incluir enlace para volver a la carta principal');
  });

  await t.test('5. Canal Realtime singleton en dataService para prevenir errores duplicate channel', () => {
    assert.ok(fs.existsSync(dataServicePath), 'src/lib/dataService.ts debe existir');
    const content = fs.readFileSync(dataServicePath, 'utf-8');
    assert.ok(
      content.includes('globalRealtimeChannel'),
      'Debe mantener referencia globalRealtimeChannel singleton'
    );
    assert.ok(
      content.includes('iniciarCanalRealtimeGlobal'),
      'Debe iniciar canal solo cuando se registra el primer listener'
    );
    assert.ok(
      content.includes('detenerCanalRealtimeGlobal'),
      'Debe cerrar canal cuando no quedan listeners'
    );
  });

  await t.test('6. error.tsx implementa Error Boundary con soporte en español', () => {
    assert.ok(fs.existsSync(errorPath), 'src/app/error.tsx debe existir');
    const content = fs.readFileSync(errorPath, 'utf-8');
    assert.ok(content.includes("'use client'"), 'error.tsx debe ser Client Component');
    assert.ok(content.includes('No se pudo cargar esta página'), 'Debe mostrar mensaje en español');
    assert.ok(content.includes('Intentar Nuevamente'), 'Debe incluir botón de reintento');
    assert.ok(content.includes('Volver a la Carta Principal'), 'Debe incluir botón para volver');
  });
});
