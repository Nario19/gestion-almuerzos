import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('Verificación de Navbar Móvil y Nomenclatura de Hijos para Padres', async (t) => {
  await t.test('1. En /hijos: Formulario dice "Registrar Nuevo Hijo", input en mayúsculas y botón "+ Agregar Hijo"', () => {
    const hijosPagePath = path.join(projectRoot, 'src/app/padres/hijos/page.tsx');
    const content = fs.readFileSync(hijosPagePath, 'utf8');

    // Verificar que dice "Mis Hijos"
    assert.match(content, /Mis Hijos/, 'Debe titularse Mis Hijos');
    // Verificar que dice "Registrar Nuevo Hijo"
    assert.match(content, /Registrar Nuevo Hijo/, 'Debe titularse Registrar Nuevo Hijo');
    // Verificar que el input aplica toUpperCase()
    assert.match(content, /setNombreHijo\(e\.target\.value\.toUpperCase\(\)\)/, 'El input de hijo debe convertir a mayúsculas con toUpperCase()');
    // Verificar que el input incluye la clase CSS uppercase
    assert.match(content, /uppercase font-medium/, 'El input debe incluir la clase uppercase');
    // Verificar que el botón dice "+ Agregar Hijo"
    assert.match(content, /\+ Agregar Hijo/, 'El botón debe decir estrictamente + Agregar Hijo');
    // Verificar que dice "Hijos Registrados"
    assert.match(content, /Hijos Registrados/, 'Debe decir Hijos Registrados');
    // No debe decir "Registrar Nuevo Estudiante" ni "+ Guardar Hijo"
    assert.doesNotMatch(content, /Registrar Nuevo Estudiante/, 'No debe decir Registrar Nuevo Estudiante');
  });

  await t.test('2. En / (Home): Modal rápido de hijo usa "Agrega a tu Hijo", input en mayúsculas y corroboración "Hijo:"', () => {
    const homePagePath = path.join(projectRoot, 'src/app/padres/page.tsx');
    const content = fs.readFileSync(homePagePath, 'utf8');

    // Modal rápido para padres
    assert.match(content, /Agrega a tu Hijo/, 'El modal rápido debe decir Agrega a tu Hijo');
    assert.match(content, /Nombre y Apellidos del Hijo \*/, 'El label debe ser Nombre y Apellidos del Hijo *');
    assert.match(content, /setNombreNuevoHijo\(e\.target\.value\.toUpperCase\(\)\)/, 'El input modal debe convertir a mayúsculas');
    assert.match(content, /Guardando hijo\.\.\./, 'El estado de carga del botón debe ser Guardando hijo...');
    
    // Modal de corroboración
    assert.match(content, /Hijo y Destino/, 'La sección de corroboración debe decir Hijo y Destino');
    assert.match(content, /<span className="font-medium text-slate-500">Hijo:<\/span>/, 'El campo debe decir Hijo:');
  });

  await t.test('3. BottomNav: Barra inferior móvil con Pedidos, Hijos, Pedir Menú central y Perfil', () => {
    const bottomNavPath = path.join(projectRoot, 'src/components/BottomNav.tsx');
    assert.ok(fs.existsSync(bottomNavPath), 'src/components/BottomNav.tsx debe existir');
    const content = fs.readFileSync(bottomNavPath, 'utf8');

    // Debe ser exclusivo para padres logueados: se oculta si no hay usuario, si es admin/superadmin, o si no es rol PADRE
    assert.match(content, /if\s*\(\s*!usuario\s*\|\|\s*esAdmin\s*\|\|\s*esSuperAdmin\s*\|\|\s*usuario\.rol\s*!==\s*['"]PADRE['"]\s*\)\s*\{?\s*return\s*null;?\s*\}?/, 'Debe ocultarse para visitantes no logueados, administradores y no-padres');

    // Destinos solicitados
    assert.match(content, /href="\/(?:padres\/)?pedidos"/, 'Debe incluir enlace a /pedidos o /padres/pedidos');
    assert.match(content, />Pedidos<\/span>/, 'Debe tener label Pedidos');

    assert.match(content, /href="\/(?:padres\/)?hijos"/, 'Debe incluir enlace a /hijos o /padres/hijos');
    assert.match(content, />Hijos<\/span>/, 'Debe tener label Hijos');

    assert.match(content, /href="\/(?:padres)?"/, 'Debe incluir enlace a / o /padres');
    assert.match(content, /Pedir Menú/, 'Debe tener botón central Pedir Menú');

    assert.match(content, /href="\/(?:padres\/)?perfil"/, 'Debe incluir enlace a /perfil o /padres/perfil');
    assert.match(content, />Perfil<\/span>/, 'Debe tener label Perfil');

    // Botón central flotante
    assert.match(content, /-mt-6|rounded-full/, 'El botón central debe ser un botón circular destacado');
  });

  await t.test('4. Perfil: Página /perfil implementada para apoderados y gestión de cuenta', () => {
    const perfilPath = path.join(projectRoot, 'src/app/padres/perfil/page.tsx');
    assert.ok(fs.existsSync(perfilPath), 'src/app/padres/perfil/page.tsx debe existir');
    const content = fs.readFileSync(perfilPath, 'utf8');

    // Verificación de datos de apoderado
    assert.match(content, /Apoderado/, 'Debe mostrar badge o etiqueta de Apoderado');
    assert.match(content, /usuario\.dni/, 'Debe mostrar el DNI del usuario');
    assert.match(content, /usuario\.telefono/, 'Debe mostrar el teléfono del usuario');
    assert.match(content, /Mis Hijos/, 'Debe mostrar sección de Mis Hijos');
    assert.match(content, /Cerrar Sesión/, 'Debe tener botón de Cerrar Sesión');
  });

  await t.test('5. Layout: BottomNav integrado y padding bottom preventivo en <main>', () => {
    const layoutPath = path.join(projectRoot, 'src/app/layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf8');

    assert.match(content, /import BottomNav from ['"]@\/components\/BottomNav['"]/, 'Debe importar BottomNav');
    assert.match(content, /<BottomNav\s*\/>/, 'Debe renderizar <BottomNav />');
    assert.match(content, /pb-24|pb-20/, 'main debe contar con padding bottom para evitar solapamiento con el nav fijo');
  });

  await t.test('6. Visitantes: HeaderNav con Iniciar Sesión y Registrarme, LoginPage maneja modo=registro, y Carta Semanal con filtro de colegio', () => {
    // 1. HeaderNav
    const headerNavPath = path.join(projectRoot, 'src/components/HeaderNav.tsx');
    const headerContent = fs.readFileSync(headerNavPath, 'utf8');
    assert.match(headerContent, /href="\/login"/, 'HeaderNav debe tener enlace a /login');
    assert.match(headerContent, /Iniciar Sesión/, 'HeaderNav debe tener texto Iniciar Sesión');
    assert.match(headerContent, /href="\/login\?modo=registro"/, 'HeaderNav debe tener enlace a /login?modo=registro');
    assert.match(headerContent, /Registrarme/, 'HeaderNav debe tener botón Registrarme');

    // 2. LoginPage
    const loginPagePath = path.join(projectRoot, 'src/app/login/page.tsx');
    const loginContent = fs.readFileSync(loginPagePath, 'utf8');
    assert.match(loginContent, /useSearchParams\(\)/, 'LoginPage debe utilizar useSearchParams()');
    assert.match(loginContent, /modoParam === ['"]registro['"]/, 'LoginPage debe activar modo registro cuando el query param es registro');
    assert.match(loginContent, /<Suspense/, 'LoginPage debe envolver el contenido en Suspense para Next.js App Router');

    // 3. Carta Semanal para no logueados en Home
    const homePagePath = path.join(projectRoot, 'src/app/padres/page.tsx');
    const homeContent = fs.readFileSync(homePagePath, 'utf8');
    assert.match(homeContent, /FILTRO POR COLEGIO PARA VISITANTES/, 'Home debe contener sección de filtro por colegio para visitantes');
    assert.match(homeContent, /value=\{colegio\}\s*onChange=\{\(e\)\s*=>\s*setColegio\(e\.target\.value\)\}/, 'Debe permitir cambiar el colegio seleccionado en la carta semanal');
  });
});

