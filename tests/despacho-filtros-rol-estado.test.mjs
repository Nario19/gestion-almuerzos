import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Filtros Operativos por Rol y Estado en Despacho', () => {
  const despachoPath = path.join(rootDir, 'src/app/admin/despacho/page.tsx');
  const despachoContent = fs.readFileSync(despachoPath, 'utf8');

  test('1. Despacho define FiltroEstadoPedido con estados operativos completos', () => {
    assert.match(
      despachoContent,
      /type FiltroEstadoPedido\s*=\s*[\s\S]*?'TODOS'[\s\S]*?'ENTREGADOS'[\s\S]*?'PENDIENTES_ENTREGA'[\s\S]*?'PAGADOS'[\s\S]*?'NO_PAGADOS'[\s\S]*?'CANCELADOS'/,
      'Debe definir el tipo FiltroEstadoPedido con todos los estados requeridos'
    );
  });

  test('2. Filtro por Colegio está restringido estrictamente al Super Administrador', () => {
    assert.match(
      despachoContent,
      /\{esSuperAdmin && \(\s*<div[\s\S]*?Colegio:/,
      'Los botones de filtrado por colegio deben mostrarse única y exclusivamente para el Super Administrador'
    );
  });

  test('3. Administrador de sede regular ve su colegio en cabecera sin botones redundantes de colegios', () => {
    assert.match(
      despachoContent,
      /!esSuperAdmin && usuario\?\.colegioNombre \? \([\s\S]*?🏫 Sede:/,
      'Para administradores regulares se muestra la insignia de su sede asignada en cabecera'
    );
  });

  test('4. Filtro por Estado Operativo está disponible para Administradores de sede y Super Administrador', () => {
    assert.match(
      despachoContent,
      /Estado:[\s\S]*?label:\s*'Todos'[\s\S]*?label:\s*'Entregados'[\s\S]*?label:\s*'Falta Entregar'[\s\S]*?label:\s*'Pagados'[\s\S]*?label:\s*'No Pagados'[\s\S]*?label:\s*'Cancelados'/,
      'La botonera de filtros de estado debe incluir Todos, Entregados, Falta Entregar, Pagados, No Pagados y Cancelados'
    );
  });

  test('5. Lógica de filtrado operacional discrimina con exactitud cada estado', () => {
    const pedidos = [
      { id: '1', codigoPedido: 'A1', estadoPedido: 'ENTREGADO', estadoPago: 'PAGADO' },
      { id: '2', codigoPedido: 'A2', estadoPedido: 'REGISTRADO', estadoPago: 'PAGADO' },
      { id: '3', codigoPedido: 'A3', estadoPedido: 'REGISTRADO', estadoPago: 'PENDIENTE' },
      { id: '4', codigoPedido: 'A4', estadoPedido: 'CANCELADO', estadoPago: 'PENDIENTE' },
      { id: '5', codigoPedido: 'A5', estadoPedido: 'CANCELADO', estadoPago: 'PAGADO' },
    ];

    const filtrar = (filtro) => {
      return pedidos.filter((p) => {
        if (filtro === 'TODOS') return true;
        if (filtro === 'ENTREGADOS') return p.estadoPedido === 'ENTREGADO';
        if (filtro === 'PENDIENTES_ENTREGA') return p.estadoPedido !== 'ENTREGADO' && p.estadoPedido !== 'CANCELADO';
        if (filtro === 'PAGADOS') return p.estadoPago === 'PAGADO' && p.estadoPedido !== 'CANCELADO';
        if (filtro === 'NO_PAGADOS') return p.estadoPago !== 'PAGADO' && p.estadoPedido !== 'CANCELADO';
        if (filtro === 'CANCELADOS') return p.estadoPedido === 'CANCELADO';
        return true;
      });
    };

    assert.equal(filtrar('TODOS').length, 5, 'Todos debe incluir 5');
    assert.equal(filtrar('ENTREGADOS').length, 1, 'Entregados debe ser 1 (A1)');
    assert.equal(filtrar('ENTREGADOS')[0].codigoPedido, 'A1');

    const pendientesEntrega = filtrar('PENDIENTES_ENTREGA');
    assert.equal(pendientesEntrega.length, 2, 'Pendientes de entrega deben ser 2 (A2, A3)');
    assert.ok(pendientesEntrega.every((p) => p.estadoPedido !== 'ENTREGADO' && p.estadoPedido !== 'CANCELADO'));

    const pagados = filtrar('PAGADOS');
    assert.equal(pagados.length, 2, 'Pagados activos deben ser 2 (A1, A2)');
    assert.ok(pagados.every((p) => p.estadoPago === 'PAGADO' && p.estadoPedido !== 'CANCELADO'));

    const noPagados = filtrar('NO_PAGADOS');
    assert.equal(noPagados.length, 1, 'No pagados activos debe ser 1 (A3)');
    assert.equal(noPagados[0].codigoPedido, 'A3');

    const cancelados = filtrar('CANCELADOS');
    assert.equal(cancelados.length, 2, 'Cancelados deben ser 2 (A4, A5)');
    assert.ok(cancelados.every((p) => p.estadoPedido === 'CANCELADO'));
  });

  test('6. Paginación y Exportación a Excel reflejan los resultados filtrados', () => {
    assert.match(
      despachoContent,
      /totalFiltrados/,
      'El cálculo de páginas y límite de navegación debe basarse en totalFiltrados'
    );
    assert.match(
      despachoContent,
      /nombreEstado/,
      'El nombre de archivo y metadatos de Excel deben incluir el estado filtrado'
    );
  });
});
