import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatearHoraLimiteLegible, haPasadoHoraLimite } from '../src/lib/dateUtils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

test('Verificación de Login sin Navbar, Botón Ver Menú, Pantalla Pública y Configuración de Hora Límite', async (t) => {
  await t.test('1. En /login: Se eliminó el mensaje de administración y se añadió el botón Ver Menú', () => {
    const loginPath = path.join(projectRoot, 'src/app/login/page.tsx');
    assert.ok(fs.existsSync(loginPath), 'src/app/login/page.tsx debe existir');
    const content = fs.readFileSync(loginPath, 'utf8');

    // Mensaje suprimido
    assert.strictEqual(
      content.includes('¿Eres del personal de cocina o administración? Ingresa con tu cuenta de administrador.'),
      false,
      'No debe existir el mensaje para personal de cocina o administración en login'
    );

    // Botón Ver Menú
    assert.ok(
      content.includes('Ver Menú'),
      'Debe incluir el botón Ver Menú en la pantalla de login'
    );
    assert.ok(
      content.includes('href="/"'),
      'El botón Ver Menú debe enlazar a la pantalla pública principal (/)'
    );
  });

  await t.test('2. En HeaderNav: Navbar completamente oculto en /login y título Placeres Culinarios para visitantes', () => {
    const headerPath = path.join(projectRoot, 'src/components/HeaderNav.tsx');
    assert.ok(fs.existsSync(headerPath), 'src/components/HeaderNav.tsx debe existir');
    const content = fs.readFileSync(headerPath, 'utf8');

    // Ocultar en /login
    assert.ok(
      content.includes("if (pathname === '/login')"),
      'HeaderNav debe comprobar si pathname === "/login"'
    );
    assert.ok(
      content.includes('return null;'),
      'HeaderNav debe retornar null en /login para suprimir el navbar'
    );

    // Título Placeres Culinarios para no autenticados
    assert.ok(
      content.includes("!usuario ? 'Placeres Culinarios'"),
      'HeaderNav debe mostrar el título Placeres Culinarios cuando no hay usuario'
    );

    // Botones de Iniciar Sesión y Registrarme para visitantes
    assert.ok(
      content.includes('Iniciar Sesión') && content.includes('Registrarme'),
      'HeaderNav debe incluir botones de Iniciar Sesión y Registrarme para visitantes'
    );
  });

  await t.test('3. Utilidades dateUtils: formatearHoraLimiteLegible y haPasadoHoraLimite', () => {
    assert.strictEqual(formatearHoraLimiteLegible('09:30'), '09:30 AM');
    assert.strictEqual(formatearHoraLimiteLegible('08:00'), '08:00 AM');
    assert.strictEqual(formatearHoraLimiteLegible('12:00'), '12:00 PM');
    assert.strictEqual(formatearHoraLimiteLegible('13:30'), '01:30 PM');
    assert.strictEqual(formatearHoraLimiteLegible('21:45'), '09:45 PM');
    assert.strictEqual(formatearHoraLimiteLegible(''), '09:30 AM');

    // Fecha fija a las 10:00 AM UTC (que es 05:00 AM en Perú UTC-5)
    const fecha5AM = new Date('2026-10-19T10:00:00Z');
    assert.strictEqual(haPasadoHoraLimite('09:30', fecha5AM), false, '5:00 AM en Perú no debe superar 09:30 AM');

    // Fecha fija a las 15:30 UTC (que es 10:30 AM en Perú UTC-5)
    const fecha1030AM = new Date('2026-10-19T15:30:00Z');
    assert.strictEqual(haPasadoHoraLimite('09:30', fecha1030AM), true, '10:30 AM en Perú debe superar 09:30 AM');
  });

  await t.test('4. En dataService: Implementa HORA_LIMITE_DEFAULT, obtenerHoraLimite y guardarHoraLimite', () => {
    const dsPath = path.join(projectRoot, 'src/lib/dataService.ts');
    assert.ok(fs.existsSync(dsPath), 'src/lib/dataService.ts debe existir');
    const content = fs.readFileSync(dsPath, 'utf8');

    assert.ok(content.includes("HORA_LIMITE_DEFAULT = '09:30'"), 'Debe definir HORA_LIMITE_DEFAULT como 09:30');
    assert.ok(content.includes('obtenerHoraLimite(): Promise<string>'), 'dataService debe incluir obtenerHoraLimite');
    assert.ok(content.includes('guardarHoraLimite(nuevaHora: string)'), 'dataService debe incluir guardarHoraLimite');
    assert.ok(content.includes('horaLimitePedidos'), 'Debe persistir horaLimitePedidos');
  });

  await t.test('5. En /superadmin: Incluye tarjeta visual y modal para configurar hora límite de pedidos', () => {
    const superadminPath = path.join(projectRoot, 'src/app/superadmin/page.tsx');
    assert.ok(fs.existsSync(superadminPath), 'src/app/superadmin/page.tsx debe existir');
    const content = fs.readFileSync(superadminPath, 'utf8');

    assert.ok(
      content.includes('Hora Límite para Pedidos del Día'),
      'Debe contener la sección de Hora Límite para Pedidos del Día'
    );
    assert.ok(
      content.includes('Configurar Hora Límite'),
      'Debe contener el botón de Configurar Hora Límite'
    );
    assert.ok(
      content.includes('modalHoraLimiteAbierto'),
      'Debe gestionar el modal para editar la hora límite'
    );
    assert.ok(
      content.includes('dataService.guardarHoraLimite'),
      'Debe invocar guardarHoraLimite de dataService al guardar'
    );
  });

  await t.test('6. En /padres: Muestra dinámicamente la hora límite y avisa sin bloquear pedidos tardíos', () => {
    const padresPath = path.join(projectRoot, 'src/app/padres/page.tsx');
    assert.ok(fs.existsSync(padresPath), 'src/app/padres/page.tsx debe existir');
    const content = fs.readFileSync(padresPath, 'utf8');

    assert.ok(
      content.includes('formatearHoraLimiteLegible(horaLimite)'),
      'Debe renderizar la hora límite formateada dinámicamente'
    );
    assert.ok(
      content.includes('fueraDeHorarioHoy'),
      'Debe evaluar la condición fueraDeHorarioHoy'
    );
    assert.ok(
      content.includes('Aviso de Horario de Pedidos:'),
      'Debe mostrar aviso informativo cuando ha culminado la hora límite'
    );
  });
});
