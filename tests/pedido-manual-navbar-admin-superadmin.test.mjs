import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

test('Verificación de Opción de Pedido Manual en Navbar Superior para Superadmin y Admins', async (t) => {
  await t.test('1. En HeaderNav: Existe el enlace canónico a Pedido Manual y no existe botón duplicado de modal', () => {
    const headerPath = path.join(projectRoot, 'src/components/HeaderNav.tsx');
    const content = fs.readFileSync(headerPath, 'utf8');

    // Debe contener el item canónico de Pedido Manual en la barra de navegación de administración
    assert.match(
      content,
      /label:\s*['"]Pedido Manual['"]/,
      'HeaderNav debe contener el enlace canónico a "Pedido Manual"'
    );

    // Debe apuntar a la pantalla dedicada de pedido-manual
    assert.match(
      content,
      /pedido-manual/,
      'HeaderNav debe dirigir a la ruta de pedido manual'
    );

    // No debe existir el botón duplicado ni el modal según la orden explícita del usuario
    assert.doesNotMatch(
      content,
      /\+ Pedido Manual/,
      'HeaderNav no debe tener el botón duplicado "+ Pedido Manual"'
    );
  });

  await t.test('2. En ModalPedidoManual: Distinción entre SuperAdmin (selector de colegio) y Admin (sede fija)', () => {
    const modalPath = path.join(projectRoot, 'src/components/ModalPedidoManual.tsx');
    const content = fs.readFileSync(modalPath, 'utf8');

    // Debe verificar esSuperAdmin
    assert.match(
      content,
      /esSuperAdmin/,
      'ModalPedidoManual debe evaluar esSuperAdmin'
    );

    // Si es SuperAdmin, debe cargar la lista de colegios y ofrecer <select>
    assert.match(
      content,
      /dataService\.obtenerColegios\(\)/,
      'SuperAdmin debe obtener la lista de colegios con dataService.obtenerColegios()'
    );

    // Si no es SuperAdmin, debe fijar el colegioNombre del usuario asignado
    assert.match(
      content,
      /usuario\?\.colegioNombre/,
      'Admin de sede debe restringirse a usuario.colegioNombre'
    );
  });

  await t.test('3. En ModalPedidoManual: Carga reactiva de Grados y Almuerzos según el Colegio seleccionado', () => {
    const modalPath = path.join(projectRoot, 'src/components/ModalPedidoManual.tsx');
    const content = fs.readFileSync(modalPath, 'utf8');

    // Debe llamar a dataService.obtenerGrados con el colegio seleccionado
    assert.match(
      content,
      /dataService\.obtenerGrados\(colegioSeleccionado\)/,
      'Debe obtener los grados correspondientes al colegio seleccionado'
    );

    // Debe llamar a dataService.obtenerPlatosPorDia con el colegio seleccionado
    assert.match(
      content,
      /dataService\.obtenerPlatosPorDia\(diaSemanaCalculado,\s*colegioSeleccionado\)/,
      'Debe obtener los almuerzos/platos correspondientes al colegio seleccionado y día'
    );
  });

  await t.test('4. En ModalPedidoManual: Registro de la Alumna/o y llamada a dataService.crearPedido', () => {
    const modalPath = path.join(projectRoot, 'src/components/ModalPedidoManual.tsx');
    const content = fs.readFileSync(modalPath, 'utf8');

    // Debe transformar el nombre del estudiante a mayúsculas
    assert.match(
      content,
      /setEstudianteNombre\(e\.target\.value\.toUpperCase\(\)\)/,
      'El nombre del estudiante debe transformarse reactivamente a mayúsculas'
    );

    // Debe invocar dataService.crearPedido
    assert.match(
      content,
      /dataService\.crearPedido\(\{/,
      'Debe llamar a dataService.crearPedido con los datos del pedido'
    );

    // Debe soportar métodos de pago Efectivo, Yape, Plin y Pagar luego
    assert.match(content, /Efectivo/, 'Debe soportar método Efectivo');
    assert.match(content, /Yape/, 'Debe soportar método Yape');
    assert.match(content, /Plin/, 'Debe soportar método Plin');
    assert.match(content, /Pagar luego/, 'Debe soportar método Pagar luego');
  });

  await t.test('5. En dataService: crearPedido acepta parámetro opcional fecha para pedidos manuales', () => {
    const dataServicePath = path.join(projectRoot, 'src/lib/dataService.ts');
    const content = fs.readFileSync(dataServicePath, 'utf8');

    assert.match(
      content,
      /fecha\?:\s*string;/,
      'crearPedido debe aceptar parámetro opcional fecha'
    );
    assert.match(
      content,
      /fecha:\s*pedidoData\.fecha\s*\|\|\s*obtenerFechaHoyPeru\(\)/,
      'crearPedido debe utilizar pedidoData.fecha o por defecto fecha de hoy en Perú'
    );
  });
});
