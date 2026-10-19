import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('Verificación de Edición de Perfil y Supresión de Títulos Duplicados en Pantalla', async (t) => {
  await t.test('1. En /perfil: Soporte para editar datos del apoderado y actualizar perfil', () => {
    const perfilPath = path.join(projectRoot, 'src/app/padres/perfil/page.tsx');
    assert.ok(fs.existsSync(perfilPath), 'src/app/padres/perfil/page.tsx debe existir');
    const content = fs.readFileSync(perfilPath, 'utf8');

    // Debe incluir botón para abrir modal de edición
    assert.match(content, /title="Editar mis datos"/, 'Debe incluir botón para editar datos');
    assert.match(content, /Editar Mis Datos/, 'Debe titular el modal de edición');

    // Debe incluir inputs de edición
    assert.match(content, /value=\{nombreForm\}/, 'Debe incluir input para nombre');
    assert.match(content, /value=\{telefonoForm\}/, 'Debe incluir input para teléfono');
    assert.match(content, /value=\{dniForm\}/, 'Debe incluir input para DNI');

    // Debe invocar actualizarPerfil
    assert.match(content, /actualizarPerfil\(\{/, 'Debe llamar a actualizarPerfil');

    // authContext debe implementar actualizarPerfil
    const authPath = path.join(projectRoot, 'src/lib/authContext.tsx');
    const authContent = fs.readFileSync(authPath, 'utf8');
    assert.match(authContent, /const actualizarPerfil = async/, 'authContext debe implementar actualizarPerfil');
  });

  await t.test('2. En /perfil, /pedidos, /hijos y / (Home): Títulos visibles suprimidos para evitar duplicación con el Navbar', () => {
    // 1. /perfil
    const perfilContent = fs.readFileSync(path.join(projectRoot, 'src/app/padres/perfil/page.tsx'), 'utf8');
    assert.match(perfilContent, /<h1 className="sr-only">Mi Perfil<\/h1>/, 'En /perfil el h1 debe ser sr-only');

    // 2. /pedidos
    const pedidosContent = fs.readFileSync(path.join(projectRoot, 'src/app/padres/pedidos/page.tsx'), 'utf8');
    assert.match(pedidosContent, /<h1 className="sr-only">Historial de Pedidos<\/h1>/, 'En /pedidos el h1 debe ser sr-only');

    // 3. /hijos
    const hijosContent = fs.readFileSync(path.join(projectRoot, 'src/app/padres/hijos/page.tsx'), 'utf8');
    assert.match(hijosContent, /<h1 className="sr-only">Mis Hijos<\/h1>/, 'En /hijos el h1 debe ser sr-only');

    // 4. / (Home)
    const homeContent = fs.readFileSync(path.join(projectRoot, 'src/app/padres/page.tsx'), 'utf8');
    assert.match(homeContent, /<h1 className="sr-only">Carta Semanal<\/h1>/, 'En / para visitantes el h1 debe ser sr-only');
    assert.match(homeContent, /<h1 className="sr-only">Menú Escolar<\/h1>/, 'En / para padres el h1 debe ser sr-only');
  });
});
