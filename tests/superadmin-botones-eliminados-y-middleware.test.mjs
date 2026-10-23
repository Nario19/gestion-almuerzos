import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const superadminPagePath = path.join(rootDir, 'src/app/superadmin/page.tsx');
const headerNavPath = path.join(rootDir, 'src/components/HeaderNav.tsx');
const middlewarePath = path.join(rootDir, 'src/middleware.ts');
const pedidoManualPath = path.join(rootDir, 'src/app/admin/pedido-manual/page.tsx');
const loginPagePath = path.join(rootDir, 'src/app/login/page.tsx');

test('SuperAdmin: Eliminación de Botones a /admin, Segregación de Menús y Blindaje de Middleware', async (t) => {
  await t.test('1. En /superadmin, los botones Panel Operativo y Despacho fueron completamente eliminados', () => {
    assert.ok(fs.existsSync(superadminPagePath), 'src/app/superadmin/page.tsx debe existir');
    const content = fs.readFileSync(superadminPagePath, 'utf-8');

    // Comprobar que en PageHeader no hay prop actions con botones a /admin
    assert.ok(!content.includes('Panel Operativo'), 'No debe contener texto "Panel Operativo"');
    assert.ok(!content.includes('href="/admin"'), 'No debe contener enlaces hacia "/admin"');
    assert.ok(!content.includes('href="/admin/despacho"'), 'No debe contener enlaces hacia "/admin/despacho"');

    // Comprobar que PageHeader se renderiza limpio sin acciones
    assert.ok(
      content.includes('<PageHeader\n        title="Gestión de Colegios & Cuentas"\n        subtitle="Control central de instituciones educativas, administradores de sede y configuración global."\n        isSuperAdmin={true}\n      />') ||
      content.includes('title="Gestión de Colegios & Cuentas"'),
      'PageHeader debe existir con título y subtítulo de superadmin'
    );
  });

  await t.test('2. HeaderNav segrega estrictamente los ítems de navegación entre SuperAdmin y Admin', () => {
    assert.ok(fs.existsSync(headerNavPath), 'src/components/HeaderNav.tsx debe existir');
    const content = fs.readFileSync(headerNavPath, 'utf-8');

    // Debe existir la discriminación por esSuperAdmin
    assert.ok(content.includes('const adminNavItems = esSuperAdmin'), 'adminNavItems debe discriminar por esSuperAdmin');
    assert.ok(content.includes("{ href: '/superadmin', label: 'Colegios'"), 'SuperAdmin debe tener ítem Colegios');
    assert.ok(content.includes("{ href: '/superadmin/cocina', label: 'Cocina'"), 'SuperAdmin debe tener Cocina en /superadmin/cocina');
    assert.ok(content.includes("{ href: '/superadmin/fiado', label: 'Fiado'"), 'SuperAdmin debe tener Fiado en /superadmin/fiado');
    assert.ok(content.includes("{ href: '/superadmin/despacho', label: 'Despacho'"), 'SuperAdmin debe tener Despacho en /superadmin/despacho');
    assert.ok(content.includes("{ href: '/superadmin/pedido-manual', label: 'Pedido Manual'"), 'SuperAdmin debe tener Pedido Manual en /superadmin/pedido-manual');
    assert.ok(content.includes("{ href: '/superadmin/analytics', label: 'Analítica'"), 'SuperAdmin debe tener Analítica en /superadmin/analytics');

    // Admin de colegio debe tener sus rutas bajo /admin
    assert.ok(content.includes("{ href: '/admin', label: 'Admin'"), 'Admin de sede debe tener ruta /admin');
    assert.ok(content.includes("{ href: '/admin/cocina', label: 'Cocina'"), 'Admin de sede debe tener ruta /admin/cocina');
    assert.ok(content.includes("{ href: '/admin/despacho', label: 'Despacho'"), 'Admin de sede debe tener ruta /admin/despacho');
  });

  await t.test('3. middleware.ts redirige a SuperAdmin que acceda a /admin/* hacia /superadmin/*', () => {
    assert.ok(fs.existsSync(middlewarePath), 'src/middleware.ts debe existir');
    const content = fs.readFileSync(middlewarePath, 'utf-8');

    assert.ok(content.includes("pathname.startsWith('/admin')"), 'Debe interceptar /admin');
    assert.ok(content.includes('if (esSuperAdmin) {'), 'Debe evaluar si esSuperAdmin dentro de /admin');
    assert.ok(
      content.includes("pathname === '/admin' ? '/superadmin' : pathname.replace(/^\\/admin/, '/superadmin')"),
      'Debe redirigir a la ruta equivalente de /superadmin'
    );
  });

  await t.test('4. middleware.ts protege /superadmin contra usuarios sin rol SUPER_ADMIN', () => {
    const content = fs.readFileSync(middlewarePath, 'utf-8');
    assert.ok(content.includes("pathname.startsWith('/superadmin')"), 'Debe evaluar /superadmin');
    assert.ok(content.includes('if (!estaAutenticado || !esSuperAdmin) {'), 'Debe exigir que sea superadmin autenticado');
  });

  await t.test('5. En Pedido Manual, botones de éxito respetan el contexto de SuperAdmin', () => {
    assert.ok(fs.existsSync(pedidoManualPath), 'src/app/admin/pedido-manual/page.tsx debe existir');
    const content = fs.readFileSync(pedidoManualPath, 'utf-8');

    assert.ok(
      content.includes("href={esSuperAdmin ? '/superadmin/despacho' : '/admin/despacho'}"),
      'Debe redirigir a /superadmin/despacho para superadmin'
    );
    assert.ok(
      content.includes("href={esSuperAdmin ? '/superadmin/cocina' : '/admin/cocina'}"),
      'Debe redirigir a /superadmin/cocina para superadmin'
    );
  });

  await t.test('6. En /login, redirección para SuperAdmin siempre aterriza en /superadmin', () => {
    assert.ok(fs.existsSync(loginPagePath), 'src/app/login/page.tsx debe existir');
    const content = fs.readFileSync(loginPagePath, 'utf-8');

    assert.ok(
      content.includes("if (esSuperAdmin && redir.startsWith('/admin')) {"),
      'Debe convertir cualquier redir previo a /admin en /superadmin para superadministradores'
    );
  });
});
