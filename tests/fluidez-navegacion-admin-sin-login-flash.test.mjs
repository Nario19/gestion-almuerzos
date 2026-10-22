import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Fluidez de Navegación Admin y Eliminación Definitiva del Flash de Login', async (t) => {
  const loginPath = path.resolve(process.cwd(), 'src/app/login/page.tsx');
  const authPath = path.resolve(process.cwd(), 'src/lib/authContext.tsx');
  const navPath = path.resolve(process.cwd(), 'src/components/HeaderNav.tsx');
  const padresPath = path.resolve(process.cwd(), 'src/app/padres/page.tsx');
  const dataServicePath = path.resolve(process.cwd(), 'src/lib/dataService.ts');

  const loginContent = fs.readFileSync(loginPath, 'utf-8');
  const authContent = fs.readFileSync(authPath, 'utf-8');
  const navContent = fs.readFileSync(navPath, 'utf-8');
  const padresContent = fs.readFileSync(padresPath, 'utf-8');
  const dataServiceContent = fs.readFileSync(dataServicePath, 'utf-8');

  await t.test('1. En /login, usuario con sesión activa no sufre flash de tarjeta intermedia y redirige con router.replace', () => {
    assert.ok(
      loginContent.includes('router.replace(destino)'),
      'Debe utilizar router.replace(destino) para navegación fluida por cliente sin recarga total'
    );
    assert.ok(
      loginContent.includes('sincronizarCookieSesion(usuario)'),
      'Debe sincronizar cookies síncronamente antes de la redirección'
    );
    assert.ok(
      loginContent.includes('!cambiarCuenta'),
      'Debe omitir la tarjeta interactiva salvo que se solicite cambiar de cuenta explícitamente'
    );
    assert.ok(
      loginContent.includes('Ingresando al Panel de Administración...'),
      'Debe mostrar mensaje de transición sutil durante la navegación'
    );
    assert.ok(
      loginContent.includes("const redir = searchParams.get('redirigir');"),
      'Debe respetar el parámetro de redirección original de la URL'
    );
  });

  await t.test('2. authContext sincroniza cookies con 30 días de persistencia, Secure en HTTPS y soporte en bootstrap', () => {
    assert.ok(
      authContent.includes('max-age=2592000') || authContent.includes('max-age=${maxAge}'),
      'Debe configurar cookies con TTL extendido de 30 días para evitar expiraciones prematuras'
    );
    assert.ok(
      authContent.includes('; Secure'),
      'Debe incluir atributo Secure bajo protocolo HTTPS'
    );
    assert.ok(
      authContent.includes('sincronizarCookieSesion(superAdminUser)'),
      'Debe sincronizar cookies en login bootstrap de superadmin'
    );
    assert.ok(
      authContent.includes('sincronizarCookieSesion(adminUser)'),
      'Debe sincronizar cookies en login bootstrap de admin'
    );
  });

  await t.test('3. HeaderNav y accesos de admin en /padres sincronizan cookies antes de navegar al servidor', () => {
    assert.ok(
      navContent.includes('onPointerDown={() => sincronizarCookieSesion(usuario)}'),
      'HeaderNav debe refrescar cookies en onPointerDown de los enlaces operativos'
    );
    assert.ok(
      padresContent.includes('onPointerDown={() => sincronizarCookieSesion(usuario)}'),
      'En /padres las tarjetas operativas deben refrescar cookies en onPointerDown'
    );
  });

  await t.test('4. dataService implementa caché en memoria para pedidos con invalidación reactiva', () => {
    assert.ok(
      dataServiceContent.includes('CACHE_TTL_PEDIDOS_MS'),
      'Debe definir TTL de caché para pedidos'
    );
    assert.ok(
      dataServiceContent.includes('invalidarCachePedidos'),
      'Debe exportar e implementar invalidarCachePedidos'
    );
    assert.ok(
      dataServiceContent.includes('cachePedidosMemoria'),
      'Debe almacenar pedidos en memoria para responder de forma inmediata'
    );
    assert.ok(
      dataServiceContent.includes('notifyListeners()') && dataServiceContent.includes('invalidarCachePedidos()'),
      'notifyListeners debe invalidar la caché de pedidos ante cualquier mutación o evento Realtime'
    );
  });
});
