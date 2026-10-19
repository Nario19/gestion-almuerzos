import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { obtenerInfoPantalla } from '../src/lib/navUtils.ts';

const projectRoot = process.cwd();

test('Verificación de Títulos Dinámicos en el Navbar Superior (HeaderNav)', async (t) => {
  await t.test('1. Lógica pura navUtils: Pantallas de Padres y Visitantes', () => {
    // 1. Home sin autenticar (Visitante)
    const visitanteHome = obtenerInfoPantalla('/', false);
    assert.strictEqual(visitanteHome.titulo, 'Carta Semanal');
    assert.strictEqual(visitanteHome.iconoNombre, 'UtensilsCrossed');

    // 2. Home autenticado (Padre)
    const padreHome = obtenerInfoPantalla('/', true);
    assert.strictEqual(padreHome.titulo, 'Pedir Menú');
    assert.strictEqual(padreHome.iconoNombre, 'UtensilsCrossed');

    // 3. Mis Pedidos
    const pedidos = obtenerInfoPantalla('/pedidos', true);
    assert.strictEqual(pedidos.titulo, 'Mis Pedidos');
    assert.strictEqual(pedidos.iconoNombre, 'ShoppingBag');

    // 4. Mis Hijos
    const hijos = obtenerInfoPantalla('/hijos', true);
    assert.strictEqual(hijos.titulo, 'Mis Hijos');
    assert.strictEqual(hijos.iconoNombre, 'GraduationCap');

    // 5. Mi Perfil
    const perfil = obtenerInfoPantalla('/perfil', true);
    assert.strictEqual(perfil.titulo, 'Mi Perfil');
    assert.strictEqual(perfil.iconoNombre, 'User');

    // 6. Iniciar Sesión / Registro
    const login = obtenerInfoPantalla('/login', false);
    assert.strictEqual(login.titulo, 'Iniciar Sesión');
    assert.strictEqual(login.iconoNombre, 'LogIn');
  });

  await t.test('2. Lógica pura navUtils: Paneles Operativos y Administrativos', () => {
    assert.strictEqual(obtenerInfoPantalla('/admin', true).titulo, 'Panel Admin');
    assert.strictEqual(obtenerInfoPantalla('/cocina', true).titulo, 'Cocina');
    assert.strictEqual(obtenerInfoPantalla('/fiado', true).titulo, 'Control de Fiados');
    assert.strictEqual(obtenerInfoPantalla('/despacho', true).titulo, 'Despacho');
    assert.strictEqual(obtenerInfoPantalla('/superadmin', true).titulo, 'Super Admin');
  });

  await t.test('3. HeaderNav.tsx: Integra títulos dinámicos y retira texto estático Placeres Culinarios de la marca', () => {
    const headerPath = path.join(projectRoot, 'src/components/HeaderNav.tsx');
    assert.ok(fs.existsSync(headerPath), 'src/components/HeaderNav.tsx debe existir');
    const headerContent = fs.readFileSync(headerPath, 'utf8');

    // Debe importar obtenerInfoPantalla
    assert.match(headerContent, /import\s*\{\s*obtenerInfoPantalla\s*\}\s*from\s*['"]@\/lib\/navUtils['"]/, 'HeaderNav debe importar obtenerInfoPantalla de navUtils');

    // Debe renderizar el título dinámico
    assert.match(headerContent, /\{infoPantalla\.titulo\}/, 'HeaderNav debe renderizar infoPantalla.titulo');

    // Debe renderizar el icono dinámico
    assert.match(headerContent, /<IconoPantalla/, 'HeaderNav debe renderizar IconoPantalla dinámico');

    // No debe contener el span con texto fijo 'Placeres Culinarios' en la marca
    assert.doesNotMatch(headerContent, />\s*Placeres Culinarios\s*<\/span>/, 'HeaderNav ya NO debe contener el texto fijo "Placeres Culinarios" en el título');
  });
});
