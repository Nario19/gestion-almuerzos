import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

test('Verificación de Pantalla Dedicada de Pedido Manual y Estructura Ordenada de Rutas', async (t) => {
  await t.test('1. Pantalla completa src/app/admin/pedido-manual/page.tsx existe y valida roles', () => {
    const pagePath = path.join(projectRoot, 'src/app/admin/pedido-manual/page.tsx');
    assert.ok(fs.existsSync(pagePath), 'src/app/admin/pedido-manual/page.tsx debe existir');
    const content = fs.readFileSync(pagePath, 'utf8');

    // Debe ser cliente
    assert.match(content, /'use client'/, 'Debe ser componente de cliente');

    // Debe verificar esAdmin y esSuperAdmin
    assert.match(content, /esAdmin/, 'Debe verificar rol esAdmin');
    assert.match(content, /esSuperAdmin/, 'Debe verificar rol esSuperAdmin');
    assert.match(content, /<AccesoRestringido/, 'Debe bloquear acceso a usuarios no administradores');

    // Debe cargar grados y platos por colegio
    assert.match(content, /dataService\.obtenerGrados\(/, 'Debe cargar grados según el colegio');
    assert.match(content, /dataService\.obtenerPlatosPorDia\(/, 'Debe cargar platos según el día escolar');

    // Formulario debe contener campos principales
    assert.match(content, /estudianteNombre/, 'Debe contener campo de estudiante');
    assert.match(content, /gradoSeccion/, 'Debe contener campo de grado y sección');
    assert.match(content, /segundoNombre/, 'Debe contener campo de plato principal');
    assert.match(content, /entradaNombre/, 'Debe contener selector de entrada o sopa');
    assert.match(content, /observacion/, 'Debe contener campo de observaciones de alergias');
    assert.match(content, /metodoPago/, 'Debe contener selector de método de pago');

    // Debe llamar a dataService.crearPedido
    assert.match(content, /dataService\.crearPedido\(/, 'Debe registrar el pedido con dataService.crearPedido');

    // Debe mostrar código del pedido creado y confeti
    assert.match(content, /pedidoCreado\.codigoPedido/, 'Debe mostrar el código del pedido generado');
  });

  await t.test('2. Estructura ordenada de subcarpetas en src/app/admin/', () => {
    const adminDespacho = path.join(projectRoot, 'src/app/admin/despacho/page.tsx');
    const adminFiado = path.join(projectRoot, 'src/app/admin/fiado/page.tsx');
    const adminCocina = path.join(projectRoot, 'src/app/admin/cocina/page.tsx');
    const adminManual = path.join(projectRoot, 'src/app/admin/pedido-manual/page.tsx');

    assert.ok(fs.existsSync(adminDespacho), 'src/app/admin/despacho/page.tsx debe existir');
    assert.ok(fs.existsSync(adminFiado), 'src/app/admin/fiado/page.tsx debe existir');
    assert.ok(fs.existsSync(adminCocina), 'src/app/admin/cocina/page.tsx debe existir');
    assert.ok(fs.existsSync(adminManual), 'src/app/admin/pedido-manual/page.tsx debe existir');
  });

  await t.test('3. Estructura ordenada de subcarpetas en src/app/superadmin/', () => {
    const superDespacho = path.join(projectRoot, 'src/app/superadmin/despacho/page.tsx');
    const superFiado = path.join(projectRoot, 'src/app/superadmin/fiado/page.tsx');
    const superCocina = path.join(projectRoot, 'src/app/superadmin/cocina/page.tsx');
    const superManual = path.join(projectRoot, 'src/app/superadmin/pedido-manual/page.tsx');

    assert.ok(fs.existsSync(superDespacho), 'src/app/superadmin/despacho/page.tsx debe existir');
    assert.ok(fs.existsSync(superFiado), 'src/app/superadmin/fiado/page.tsx debe existir');
    assert.ok(fs.existsSync(superCocina), 'src/app/superadmin/cocina/page.tsx debe existir');
    assert.ok(fs.existsSync(superManual), 'src/app/superadmin/pedido-manual/page.tsx debe existir');
  });

  await t.test('4. Estructura ordenada de subcarpetas en src/app/padres/', () => {
    const padresHome = path.join(projectRoot, 'src/app/padres/page.tsx');
    const padresPedidos = path.join(projectRoot, 'src/app/padres/pedidos/page.tsx');
    const padresHijos = path.join(projectRoot, 'src/app/padres/hijos/page.tsx');
    const padresPerfil = path.join(projectRoot, 'src/app/padres/perfil/page.tsx');

    assert.ok(fs.existsSync(padresHome), 'src/app/padres/page.tsx debe existir');
    assert.ok(fs.existsSync(padresPedidos), 'src/app/padres/pedidos/page.tsx debe existir');
    assert.ok(fs.existsSync(padresHijos), 'src/app/padres/hijos/page.tsx debe existir');
    assert.ok(fs.existsSync(padresPerfil), 'src/app/padres/perfil/page.tsx debe existir');
  });

  await t.test('5. En HeaderNav: Enlace a pantalla de Pedido Manual y supresión de título en admin/superadmin', () => {
    const headerPath = path.join(projectRoot, 'src/components/HeaderNav.tsx');
    const content = fs.readFileSync(headerPath, 'utf8');

    // Debe incluir item de Pedido Manual en barra de navegación de admin
    assert.match(
      content,
      /href:\s*['"]\/admin\/pedido-manual['"]/,
      'adminNavItems debe incluir el enlace a /admin/pedido-manual'
    );

    // Debe usar esRutaAdministrativa para discriminar
    assert.match(
      content,
      /esRutaAdministrativa/,
      'HeaderNav debe llamar a esRutaAdministrativa'
    );

    // En rutas administrativas mantiene navbar limpio sin títulos de pantalla
    assert.match(
      content,
      /esRutaAdmin\s*\?\s*null\s*:/,
      'En interfaz de admin y superadmin debe mantener un navbar limpio sin títulos'
    );
  });
});
