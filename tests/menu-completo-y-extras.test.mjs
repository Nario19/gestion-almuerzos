import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

test('Configuración de Menú Completo (Sopa o ensalada + Segundo) y Extras Independientes', async (t) => {
  await t.test('1. Admin cuenta con selectores de modo "Agregar Menú" y "Agregar Extras"', () => {
    const adminPath = path.join(rootDir, 'src', 'app', 'admin', 'page.tsx');
    const menuTabPath = path.join(rootDir, 'src', 'app', 'admin', 'components', 'AdminMenuSemanalTab.tsx');
    const adminContent = fs.readFileSync(adminPath, 'utf-8');
    const menuTabContent = fs.readFileSync(menuTabPath, 'utf-8');

    assert.ok(
      adminContent.includes('modoRegistroMenu') && adminContent.includes('handleCrearMenuCompleto') && adminContent.includes('handleCrearExtra'),
      'Admin debe manejar el estado de modoRegistroMenu y las funciones handleCrearMenuCompleto y handleCrearExtra'
    );

    assert.ok(
      menuTabContent.includes('Agregar Menú') && menuTabContent.includes('Agregar Extras'),
      'AdminMenuSemanalTab debe contener botones visibles para alternar entre "Agregar Menú" y "Agregar Extras"'
    );
  });

  await t.test('2. "Agregar Menú" une Sopa o Ensalada con Segundo y precio conjunto configurable', () => {
    const adminPath = path.join(rootDir, 'src', 'app', 'admin', 'page.tsx');
    const menuTabPath = path.join(rootDir, 'src', 'app', 'admin', 'components', 'AdminMenuSemanalTab.tsx');
    const adminContent = fs.readFileSync(adminPath, 'utf-8');
    const menuTabContent = fs.readFileSync(menuTabPath, 'utf-8');

    assert.ok(
      menuTabContent.includes('subtipoEntradaMenu') && menuTabContent.includes('Sopa') && menuTabContent.includes('Ensalada'),
      'Debe permitir elegir si la entrada es Sopa o Ensalada'
    );

    assert.ok(
      menuTabContent.includes('nombreEntradaMenu') && menuTabContent.includes('nombreSegundoMenu'),
      'Debe incluir campos para ingresar tanto la sopa/ensalada como el segundo plato'
    );

    assert.ok(
      menuTabContent.includes('precioMenuCompleto'),
      'Debe incluir campo para configurar el precio del menú completo de forma conjunta'
    );

    assert.ok(
      adminContent.includes("tipo: 'ENTRADA'") && adminContent.includes("tipo: 'SEGUNDO'"),
      'handleCrearMenuCompleto debe registrar la entrada y el segundo con sus tipos canónicos correspondientes'
    );
  });

  await t.test('3. "Agregar Extras" permite registrar Bebida, Postre, Refrigerio con precio individual', () => {
    const menuTabPath = path.join(rootDir, 'src', 'app', 'admin', 'components', 'AdminMenuSemanalTab.tsx');
    const menuTabContent = fs.readFileSync(menuTabPath, 'utf-8');

    assert.ok(
      menuTabContent.includes('tipoExtra') && menuTabContent.includes('nombreExtra') && menuTabContent.includes('precioExtra'),
      'Debe contener inputs para tipo de extra, nombre y precio individual'
    );

    assert.ok(
      menuTabContent.includes('Bebida') && menuTabContent.includes('Postre') && menuTabContent.includes('Refrigerio') && menuTabContent.includes('Snack'),
      'Debe contar con botones de categorías para bebidas, postres, refrigerios y snacks'
    );
  });

  await t.test('4. Cero imágenes falsas hardcodeadas: fallback a iconos limpios sin Unsplash', () => {
    const adminPath = path.join(rootDir, 'src', 'app', 'admin', 'page.tsx');
    const menuTabPath = path.join(rootDir, 'src', 'app', 'admin', 'components', 'AdminMenuSemanalTab.tsx');
    const padresPath = path.join(rootDir, 'src', 'app', 'padres', 'page.tsx');

    const adminContent = fs.readFileSync(adminPath, 'utf-8');
    const menuTabContent = fs.readFileSync(menuTabPath, 'utf-8');
    const padresContent = fs.readFileSync(padresPath, 'utf-8');

    assert.ok(
      !adminContent.includes('images.unsplash.com'),
      'src/app/admin/page.tsx no debe tener imágenes de Unsplash hardcodeadas'
    );

    assert.ok(
      !menuTabContent.includes('images.unsplash.com'),
      'AdminMenuSemanalTab no debe inyectar URLs de Unsplash'
    );

    assert.ok(
      padresContent.includes('renderIconoPlato'),
      'src/app/padres/page.tsx debe tener renderIconoPlato para mostrar iconos cuando un plato no tiene foto'
    );
  });

  await t.test('5. En Home público y Vista de Padres: Menú del día y Extras se listan con precios dinámicos', () => {
    const padresPath = path.join(rootDir, 'src', 'app', 'padres', 'page.tsx');
    const padresContent = fs.readFileSync(padresPath, 'utf-8');

    assert.ok(
      padresContent.includes('1. Sopa o Ensalada') && padresContent.includes('2. Segundo'),
      'Debe presentar claramente la Sopa o Ensalada y el Segundo'
    );

    assert.ok(
      padresContent.includes('3. Extras y Adicionales'),
      'Debe renderizar la sección 3 de Extras y Adicionales cuando existen extras en el día'
    );

    assert.ok(
      padresContent.includes('precioMenuBase') && padresContent.includes('totalExtras') && padresContent.includes('precioTotalPedido'),
      'Debe calcular dinámicamente el precio del pedido sumando el menú base y los extras seleccionados'
    );

    assert.ok(
      padresContent.includes('refrigerioNombre'),
      'Debe transferir los extras seleccionados en refrigerioNombre a crearPedido'
    );
  });

  await t.test('6. Base de datos limpia y seeder de package.json apunta a seed-superadmin', () => {
    const pkgPath = path.join(rootDir, 'package.json');
    const pkgContent = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    assert.strictEqual(
      pkgContent.scripts.seed,
      'node scripts/seed-superadmin.mjs',
      'El script npm run seed debe apuntar exclusivamente a seed-superadmin.mjs'
    );
  });
});
