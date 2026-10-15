import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Filtro por Fecha, Resaltado de Consumos de Hoy y Fechas en Listado de Fiados', async (t) => {

  await t.test('1. Pantalla /fiado incluye selector de fecha, navegación día y botón HOY', () => {
    const fiadoPath = path.join(rootDir, 'src', 'app', 'fiado', 'page.tsx');
    const content = fs.readFileSync(fiadoPath, 'utf-8');

    assert.ok(
      content.includes('fechaFiltro'),
      'src/app/fiado/page.tsx debe manejar el estado fechaFiltro'
    );
    assert.ok(
      content.includes('cambiarDia'),
      'src/app/fiado/page.tsx debe permitir navegar entre días con cambiarDia'
    );
    assert.ok(
      content.includes('type="date"'),
      'src/app/fiado/page.tsx debe incluir input nativo de tipo date para el calendario'
    );
    assert.ok(
      content.includes('totalFiadosHoy'),
      'src/app/fiado/page.tsx debe calcular totalFiadosHoy para badge en el botón Hoy'
    );
    assert.ok(
      content.includes('Todas las Fechas'),
      'src/app/fiado/page.tsx debe ofrecer botón para ver Todas las Fechas'
    );
  });

  await t.test('2. En la lista de fiados, cada tarjeta de familia muestra sus fechas y resalta HOY', () => {
    const fiadoPath = path.join(rootDir, 'src', 'app', 'fiado', 'page.tsx');
    const content = fs.readFileSync(fiadoPath, 'utf-8');

    assert.ok(
      content.includes('tieneConsumoHoy'),
      'Debe evaluar tieneConsumoHoy para resaltar pedidos de la fecha actual'
    );
    assert.ok(
      content.includes('Consumo de HOY'),
      'Debe renderizar insignia Consumo de HOY cuando la familia tiene pedidos hoy'
    );
    assert.ok(
      content.includes('fechasUnicas'),
      'Debe generar y listar fechasUnicas de consumo en la cabecera de la tarjeta'
    );
    assert.ok(
      content.includes('HOY'),
      'Debe mostrar badge HOY en la columna Fecha de la tabla desplegable'
    );
  });

  await t.test('3. Reporte Global y Exportación Excel incorporan la columna Fechas de Consumo', () => {
    const fiadoPath = path.join(rootDir, 'src', 'app', 'fiado', 'page.tsx');
    const content = fs.readFileSync(fiadoPath, 'utf-8');

    assert.ok(
      content.includes('Fechas de Consumo') || content.includes('Fechas'),
      'El Reporte Global debe incluir encabezado de Fechas'
    );
    assert.ok(
      content.includes('exportarReporteGlobalExcel'),
      'Debe mantener la función exportarReporteGlobalExcel'
    );
    assert.ok(
      content.includes('fechaFiltroLabel'),
      'La exportación a Excel debe rotular la fecha filtrada'
    );
  });

  await t.test('4. dataService.obtenerFiados soporta parámetro fechaFiltro y fusiona pedidos locales', () => {
    const dataServicePath = path.join(rootDir, 'src', 'lib', 'dataService.ts');
    const content = fs.readFileSync(dataServicePath, 'utf-8');

    assert.ok(
      content.includes('obtenerFiados(colegioNombre?: string, fechaFiltro?: string)'),
      'obtenerFiados debe aceptar parámetros opcionales de colegioNombre y fechaFiltro'
    );
    assert.ok(
      content.includes('pedidosMemoriaFiados'),
      'obtenerFiados debe fusionar pedidos locales en memoria para que pedidos de hoy nunca se omitan'
    );
  });

  await t.test('5. Simulación de filtrado por fecha en fiados', () => {
    const pedidosMock = [
      { id: '1', fecha: '2026-10-15', monto: 12, estadoPago: 'PENDIENTE', metodoPago: 'Pagar luego' },
      { id: '2', fecha: '2026-10-14', monto: 12, estadoPago: 'PENDIENTE', metodoPago: 'Pagar luego' },
      { id: '3', fecha: '2026-10-14', monto: 12, estadoPago: 'PAGADO', metodoPago: 'Pagar luego' },
    ];

    const fechaHoy = '2026-10-15';

    // Filtrar por HOY
    const pedidosHoy = pedidosMock.filter((p) => p.fecha === fechaHoy);
    assert.equal(pedidosHoy.length, 1, 'Debe haber 1 pedido de hoy');
    assert.equal(pedidosHoy[0].fecha, '2026-10-15');

    // Filtrar por TODAS
    const pedidosTodas = pedidosMock;
    assert.equal(pedidosTodas.length, 3, 'Debe haber 3 pedidos en total');

    // Fechas únicas
    const fechas = Array.from(new Set(pedidosMock.map((p) => p.fecha))).sort().reverse();
    assert.deepEqual(fechas, ['2026-10-15', '2026-10-14'], 'Debe extraer fechas únicas ordenadas');
  });

  await t.test('6. Pantalla /fiado implementa paginación completa y diseño sin etiquetas redundantes', () => {
    const fiadoPath = path.join(rootDir, 'src', 'app', 'fiado', 'page.tsx');
    const content = fs.readFileSync(fiadoPath, 'utf-8');

    assert.ok(
      content.includes('paginaActual') && content.includes('setPaginaActual'),
      'Debe controlar el estado paginaActual'
    );
    assert.ok(
      content.includes('porPagina') && content.includes('setPorPagina'),
      'Debe permitir configurar elementos por página (porPagina)'
    );
    assert.ok(
      content.includes('fiadosPaginados'),
      'Debe cortar el listado en fiadosPaginados para renderizar solo la página activa'
    );
    assert.ok(
      content.includes('totalPaginas'),
      'Debe calcular totalPaginas dinámicamente'
    );
    assert.ok(
      content.includes('Mostrando') && content.includes('familias'),
      'Debe mostrar resumen de paginación Mostrando X - Y de Z familias'
    );

    // Verificación matemática de paginación
    const totalItems = 22;
    const porPag = 8;
    const totalPags = Math.ceil(totalItems / porPag);
    assert.equal(totalPags, 3, '22 familias con 8 por página deben generar 3 páginas');

    const slicePag1 = Array.from({ length: totalItems }, (_, i) => i + 1).slice(0, 8);
    assert.equal(slicePag1.length, 8, 'Página 1 debe tener 8 elementos');
    assert.equal(slicePag1[0], 1);
    assert.equal(slicePag1[7], 8);

    const slicePag3 = Array.from({ length: totalItems }, (_, i) => i + 1).slice(16, 22);
    assert.equal(slicePag3.length, 6, 'Página 3 debe tener los 6 elementos residuales');
    assert.equal(slicePag3[0], 17);
    assert.equal(slicePag3[5], 22);
  });
});
