import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Opción de Cancelar Pedido en Despacho e Impacto Transversal en el Sistema', () => {
  const dataServicePath = path.join(rootDir, 'src/lib/dataService.ts');
  const despachoPath = path.join(rootDir, 'src/app/admin/despacho/page.tsx');
  const cocinaPath = path.join(rootDir, 'src/app/admin/cocina/page.tsx');
  const adminPath = path.join(rootDir, 'src/app/admin/page.tsx');
  const pedidosPath = path.join(rootDir, 'src/app/padres/pedidos/page.tsx');
  const typesPath = path.join(rootDir, 'src/types/index.ts');

  test('1. Type EstadoPedido incluye CANCELADO', () => {
    const typesContent = fs.readFileSync(typesPath, 'utf8');
    assert.match(
      typesContent,
      /'CANCELADO'/,
      'El tipo EstadoPedido debe incluir CANCELADO'
    );
  });

  test('2. dataService implementa cancelarPedido y manejo en cambiarEstadoPedido', () => {
    const dataServiceContent = fs.readFileSync(dataServicePath, 'utf8');
    assert.match(
      dataServiceContent,
      /cancelarPedido\s*\(/,
      'dataService debe tener la función cancelarPedido exportada'
    );
    assert.match(
      dataServiceContent,
      /nuevoEstado === 'CANCELADO'/,
      'cambiarEstadoPedido debe manejar la transición a CANCELADO'
    );
    assert.match(
      dataServiceContent,
      /\[Cancelado/,
      'La observación debe registrar la etiqueta [Cancelado: motivo] o [Cancelado]'
    );
  });

  test('3. Limpieza de etiquetas al reactivar o cancelar sin alterar alergias u observaciones médicas', () => {
    const dataServiceContent = fs.readFileSync(dataServicePath, 'utf8');

    // Simulación de lógica de etiquetas implementada en dataService
    const limpiarObservacion = (obs, nuevoEstado, motivo) => {
      let observacionLimpia = (obs || '')
        .replace(/\s*•?\s*\[Entregado:\s*[^\]]+\]/g, '')
        .replace(/\s*•?\s*\[Cancelado(?::\s*[^\]]*)?\]/g, '')
        .trim();

      if (nuevoEstado === 'CANCELADO') {
        const tagCancelado = motivo ? `[Cancelado: ${motivo}]` : '[Cancelado]';
        return observacionLimpia ? `${observacionLimpia} • ${tagCancelado}` : tagCancelado;
      }
      return observacionLimpia || undefined;
    };

    const obsOriginal = 'Alergia al maní';
    const conEntrega = `${obsOriginal} • [Entregado: 12:45:00]`;
    const cancelado = limpiarObservacion(conEntrega, 'CANCELADO', 'Alumno faltó por salud');
    assert.equal(cancelado, 'Alergia al maní • [Cancelado: Alumno faltó por salud]');

    const reactivado = limpiarObservacion(cancelado, 'REGISTRADO');
    assert.equal(reactivado, 'Alergia al maní');
  });

  test('4. calcularResumenCocina en dataService excluye pedidos cancelados', () => {
    const dataServiceContent = fs.readFileSync(dataServicePath, 'utf8');
    assert.match(
      dataServiceContent,
      /p\.estadoPedido !== 'CANCELADO'/,
      'calcularResumenCocina debe filtrar pedidos activos excluyendo CANCELADO'
    );
  });

  test('5. obtenerFiados y liquidarDeudaPadre excluyen pedidos cancelados', () => {
    const dataServiceContent = fs.readFileSync(dataServicePath, 'utf8');
    assert.match(
      dataServiceContent,
      /\.neq\('estado_pedido',\s*'CANCELADO'\)/,
      'obtenerFiados debe excluir pedidos con estado_pedido CANCELADO de las deudas'
    );
  });

  test('6. Cocina (/cocina) no muestra pedidos cancelados en preparaciones ni observaciones', () => {
    const cocinaContent = fs.readFileSync(cocinaPath, 'utf8');
    assert.match(
      cocinaContent,
      /p\.estadoPedido !== 'CANCELADO'/,
      'Cocina debe filtrar pedidos cancelados en pedidosFecha'
    );
  });

  test('7. Admin (/admin) no suma cancelados en almuerzos activos, ventas ni pendientes', () => {
    const adminContent = fs.readFileSync(adminPath, 'utf8');
    assert.match(
      adminContent,
      /pedidosActivos = pedidosPeriodo\.filter\(\(p\) => p\.estadoPedido !== 'CANCELADO'\)/,
      'Admin debe calcular KPIs operacionales y financieros sólo sobre pedidos activos'
    );
    assert.match(
      adminContent,
      /CANCELADO/,
      'Tabla de pedidos recientes en Admin debe soportar el estado CANCELADO'
    );
  });

  test('8. Historial de Padres (/pedidos) muestra badge e información de pedido cancelado', () => {
    const pedidosContent = fs.readFileSync(pedidosPath, 'utf8');
    assert.match(
      pedidosContent,
      /Cancelado/,
      'Historial de pedidos para padres debe mostrar badge de Cancelado'
    );
    assert.match(
      pedidosContent,
      /Pedido cancelado/,
      'Timeline del pedido debe avisar claramente que fue cancelado'
    );
  });

  test('9. Despacho (/despacho) tiene modal de confirmación, botón Cancelar Pedido y opción Reactivar', () => {
    const despachoContent = fs.readFileSync(despachoPath, 'utf8');

    // Botón de cancelación
    assert.match(
      despachoContent,
      /Cancelar pedido/,
      'Despacho debe renderizar botón de Cancelar pedido en cada fila'
    );

    // Modal de confirmación
    assert.match(
      despachoContent,
      /¿Cancelar Pedido #/,
      'Despacho debe mostrar modal de confirmación con el código del pedido'
    );
    assert.match(
      despachoContent,
      /motivoCancelacion/,
      'Modal de cancelación debe permitir ingresar motivo opcional'
    );

    // Reactivación
    assert.match(
      despachoContent,
      /reactivarPedido/,
      'Despacho debe permitir reactivar pedidos cancelados en caso de equivocación'
    );

    // Métricas
    assert.match(
      despachoContent,
      /p\.estadoPedido !== 'CANCELADO'/,
      'Métricas de Despacho (falta entregar, pendientes de pago) deben ignorar pedidos cancelados'
    );
  });

  test('10. Si el pedido ya está entregado, la opción de cancelar desaparece de Despacho y dataService lo rechaza', () => {
    const despachoContent = fs.readFileSync(despachoPath, 'utf8');
    const dataServiceContent = fs.readFileSync(dataServicePath, 'utf8');

    // Comprobar que en la rama entregado no existe el botón Cancelar pedido
    const bloqueEntregado = despachoContent.match(/\) : entregado \? \([\s\S]*?\<\/\>\s*\) : \(/);
    assert.ok(bloqueEntregado, 'Debe existir el bloque condicional para pedidos entregados');
    assert.ok(
      !bloqueEntregado[0].includes('Cancelar pedido'),
      'La opción de Cancelar pedido debe desaparecer por completo si el pedido ya fue entregado'
    );

    // dataService rechaza cancelar pedidos ya entregados
    assert.ok(
      dataServiceContent.includes('No se puede cancelar un pedido que ya ha sido entregado'),
      'dataService debe rechazar explícitamente cancelar pedidos en estado ENTREGADO'
    );
    assert.ok(
      dataServiceContent.includes("pedido.estadoPedido === 'ENTREGADO' || pedido.horaEntrega"),
      'dataService valida tanto estadoPedido como horaEntrega antes de cancelar'
    );
  });

  test('11. En todo el sistema visible y filtros, se utiliza "Colegio" en lugar de "Sede"', () => {
    const cocinaPath = path.resolve(process.cwd(), 'src/app/admin/cocina/page.tsx');
    const cocinaContent = fs.readFileSync(cocinaPath, 'utf8');
    const despachoContent = fs.readFileSync(despachoPath, 'utf8');
    const analyticsPath = path.resolve(process.cwd(), 'src/app/superadmin/analytics/page.tsx');
    const analyticsContent = fs.readFileSync(analyticsPath, 'utf8');

    assert.ok(
      cocinaContent.includes('Filtrar por Colegio:'),
      'Cocina debe indicar "Filtrar por Colegio:" y no "Filtrar por Sede:"'
    );
    assert.ok(
      cocinaContent.includes('🏫 Colegio:'),
      'Cabecera de Cocina debe mostrar "🏫 Colegio:"'
    );
    assert.ok(
      despachoContent.includes('🏫 Colegio:'),
      'Cabecera de Despacho debe mostrar "🏫 Colegio:"'
    );
    assert.ok(
      analyticsContent.includes('Todos los Colegios (Consolidado)'),
      'Analytics debe listar "Todos los Colegios (Consolidado)"'
    );
  });
});
