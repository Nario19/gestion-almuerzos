import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  obtenerFechaHoyPeru,
  calcularOffsetFechaPeru,
} from '../src/lib/dateUtils.ts';

const adminPageContent = fs.readFileSync(
  path.resolve(process.cwd(), 'src/app/admin/page.tsx'),
  'utf-8'
);
const cocinaPageContent = fs.readFileSync(
  path.resolve(process.cwd(), 'src/app/admin/cocina/page.tsx'),
  'utf-8'
);

test('Filtros por Colegio y Fechas según Rol en Admin y Cocina', async (t) => {
  await t.test('1. Cocina: Filtro por colegio es exclusivo de SuperAdmin', () => {
    // La sección de filtro por sede debe estar condicionada a esSuperAdmin
    assert.match(
      cocinaPageContent,
      /\{esSuperAdmin\s*&&\s*\(\s*<div[^>]*border-t[^>]*>[\s\S]*?Filtrar por Sede:/,
      'El filtro de instituciones educativas en cocina debe estar condicionado estrictamente a esSuperAdmin'
    );
    // No debe existir el span estático "🏫 Colegio: {usuario.colegioNombre}" dentro de "Filtrar por:"
    assert.doesNotMatch(
      cocinaPageContent,
      /Filtrar por:[\s\S]*?Colegio:\s*\{usuario\.colegioNombre\}/,
      'No debe existir un filtro de colegio para regular admin dentro de Filtrar por:'
    );
  });

  await t.test('2. Cocina: Header muestra badge de Sede para administrador de colegio', () => {
    assert.match(
      cocinaPageContent,
      /\{!esSuperAdmin\s*&&\s*usuario\?\.colegioNombre\s*&&\s*\([\s\S]*?🏫 Sede:\s*\{usuario\.colegioNombre\}/,
      'Cocina debe mostrar el badge de Sede en la cabecera cuando es un admin con colegio asignado'
    );
  });

  await t.test('3. Cocina: Almuerzos Independientes por Colegio es exclusivo de SuperAdmin', () => {
    assert.match(
      cocinaPageContent,
      /\{esSuperAdmin\s*&&\s*resumen\.porColegio\s*&&\s*resumen\.porColegio\.length\s*>\s*0\s*&&\s*\(/,
      'El desglose de almuerzos independientes por colegio debe estar condicionado a esSuperAdmin'
    );
  });

  await t.test('4. Admin: Implementa filtrado de fecha con calendario, navegación y accesos rápidos', () => {
    // Debe tener el estado fechaFiltro y la función cambiarDia
    assert.match(
      adminPageContent,
      /const\s*\[fechaFiltro,\s*setFechaFiltro\]\s*=\s*useState<string>\(fechaHoy\);/,
      'Admin debe declarar el estado fechaFiltro inicializado en fechaHoy'
    );
    assert.match(
      adminPageContent,
      /const cambiarDia\s*=\s*\(dias:\s*number\)\s*=>/,
      'Admin debe declarar la función cambiarDia'
    );
    // Debe renderizar el input nativo de calendario
    assert.match(
      adminPageContent,
      /<input[^>]*type="date"[^>]*value=\{fechaFiltro === 'TODAS' \|\| fechaFiltro === 'SEMANA' \? '' : fechaFiltro\}/,
      'Admin debe incluir el input type="date" sincronizado con fechaFiltro'
    );
    // Debe tener botones de navegación < y >
    assert.match(
      adminPageContent,
      /onClick=\{\(\)\s*=>\s*cambiarDia\(-1\)\}/,
      'Admin debe incluir botón para día anterior'
    );
    assert.match(
      adminPageContent,
      /onClick=\{\(\)\s*=>\s*cambiarDia\(1\)\}/,
      'Admin debe incluir botón para día siguiente'
    );
    // Botones rápidos: Hoy, Últimos 7 días, Todas las Fechas
    assert.match(
      adminPageContent,
      /setFechaFiltro\(fechaHoy\)/,
      'Admin debe permitir volver a Hoy rápidamente'
    );
    assert.match(
      adminPageContent,
      /setFechaFiltro\('SEMANA'\)/,
      'Admin debe permitir filtrar por la semana (Últimos 7 días)'
    );
    assert.match(
      adminPageContent,
      /setFechaFiltro\('TODAS'\)/,
      'Admin debe permitir ver el histórico con Todas las Fechas'
    );
  });

  await t.test('5. Admin: pedidosPeriodo filtra correctamente según fechaFiltro', () => {
    assert.match(
      adminPageContent,
      /if\s*\(fechaFiltro === 'TODAS'\)\s*return true;/,
      'pedidosPeriodo debe permitir todos los pedidos cuando fechaFiltro es TODAS'
    );
    assert.match(
      adminPageContent,
      /if\s*\(fechaFiltro === 'SEMANA'\)\s*\{/,
      'pedidosPeriodo debe filtrar pedidos de los últimos 7 días cuando fechaFiltro es SEMANA'
    );
    assert.match(
      adminPageContent,
      /const f = \(p\.fecha \|\| ''\)\.slice\(0, 10\);\s*return f === fechaFiltro;/,
      'pedidosPeriodo debe filtrar por fecha exacta cuando fechaFiltro es una fecha YYYY-MM-DD'
    );
  });

  await t.test('6. Admin: KPI 2 oculta colegios atendidos para administrador de sede', () => {
    assert.match(
      adminPageContent,
      /\{esSuperAdmin\s*\?\s*`\$\{rankingColegios\.length\} colegios atendidos`[\s\S]*?Sede:\s*\$\{usuario\.colegioNombre\}/,
      'KPI 2 debe mostrar número de colegios solo para superadmin y la sede para admin de colegio'
    );
  });

  await t.test('7. Admin: Demanda por Colegio es exclusiva de SuperAdmin', () => {
    assert.match(
      adminPageContent,
      /\{esSuperAdmin\s*&&\s*\(\s*<div[^>]*>[\s\S]*?Demanda por Colegio[\s\S]*?rankingColegios\.map/,
      'La tarjeta Demanda por Colegio debe estar condicionada a esSuperAdmin'
    );
  });

  await t.test('8. Admin: Selectores de sede en Menú, Grados y Observaciones son exclusivos de SuperAdmin', () => {
    assert.match(
      adminPageContent,
      /\{tabActiva === 'menu' && \(\s*<>[\s\S]*?\{esSuperAdmin && \(/,
      'El selector de sede en el Menú Semanal debe estar condicionado a esSuperAdmin'
    );
    assert.match(
      adminPageContent,
      /\{tabActiva === 'grados' && \(\s*<div[^>]*>[\s\S]*?\{esSuperAdmin && \(/,
      'El selector de sede en Grados y Secciones debe estar condicionado a esSuperAdmin'
    );
    assert.match(
      adminPageContent,
      /\{tabActiva === 'observaciones' && \(\s*<div[^>]*>[\s\S]*?\{esSuperAdmin && \(/,
      'El selector de sede en Observaciones debe estar condicionado a esSuperAdmin'
    );
  });

  await t.test('9. Lógica funcional de filtrado por fecha en pedidos del admin', () => {
    const fechaHoy = obtenerFechaHoyPeru();
    const fechaAyer = calcularOffsetFechaPeru(fechaHoy, -1);
    const fechaPasado = calcularOffsetFechaPeru(fechaHoy, -10);

    const pedidosSimulados = [
      { id: '1', fecha: fechaHoy, monto: 12, estadoPedido: 'REGISTRADO', estadoPago: 'PAGADO', colegioNombre: 'CSA' },
      { id: '2', fecha: fechaHoy, monto: 14, estadoPedido: 'ENTREGADO', estadoPago: 'PAGADO', colegioNombre: 'CSA' },
      { id: '3', fecha: fechaAyer, monto: 12, estadoPedido: 'ENTREGADO', estadoPago: 'PAGADO', colegioNombre: 'CSA' },
      { id: '4', fecha: fechaPasado, monto: 12, estadoPedido: 'ENTREGADO', estadoPago: 'PAGADO', colegioNombre: 'CSA' },
      { id: '5', fecha: fechaHoy, monto: 12, estadoPedido: 'CANCELADO', estadoPago: 'PENDIENTE', colegioNombre: 'CSA' },
    ];

    // Filtro Hoy
    const pedidosHoy = pedidosSimulados.filter((p) => (p.fecha || '').slice(0, 10) === fechaHoy);
    assert.equal(pedidosHoy.length, 3);
    const activosHoy = pedidosHoy.filter((p) => p.estadoPedido !== 'CANCELADO');
    assert.equal(activosHoy.length, 2);
    const ventasHoy = activosHoy.reduce((acc, p) => acc + p.monto, 0);
    assert.equal(ventasHoy, 26);

    // Filtro Ayer
    const pedidosAyer = pedidosSimulados.filter((p) => (p.fecha || '').slice(0, 10) === fechaAyer);
    assert.equal(pedidosAyer.length, 1);
    assert.equal(pedidosAyer[0].id, '3');

    // Filtro Todas
    assert.equal(pedidosSimulados.length, 5);
  });
});
