import { test, describe } from 'node:test';
import assert from 'node:assert';

/**
 * Función pura que replica la lógica de estado del timeline de pedidos para padres.
 * (src/app/pedidos/page.tsx -> obtenerEstadoTimeline)
 */
function calcularEstadoTimeline(pedido) {
  const pagadoOAceptado = pedido.estadoPago === 'PAGADO' || pedido.estadoPedido !== 'REGISTRADO';
  const entregado = pedido.estadoPedido === 'ENTREGADO';

  const etapas = [
    {
      id: 1,
      titulo: 'Orden recibida',
      descripcion: 'Orden registrada',
      completado: true,
      enCurso: false,
      alerta: false,
    },
    {
      id: 2,
      titulo: 'Pago aceptado',
      descripcion: (entregado || pagadoOAceptado)
        ? 'Pago verificado'
        : pedido.estadoPago === 'VERIFICANDO'
        ? 'Validando pago'
        : 'Por pagar',
      completado: pagadoOAceptado || entregado,
      enCurso: !pagadoOAceptado && !entregado,
      alerta: pedido.estadoPago === 'PENDIENTE' && !entregado,
    },
    {
      id: 3,
      titulo: 'Entregado',
      descripcion: entregado
        ? (pedido.horaEntrega ? `Entregado (${pedido.horaEntrega})` : 'Entregado en colegio')
        : (pagadoOAceptado ? 'Programado para entrega' : 'Pendiente de pago'),
      completado: entregado,
      enCurso: (pagadoOAceptado || entregado) && !entregado,
      alerta: false,
    },
  ];

  let estadoVivo = {
    titulo: 'Orden Recibida - Esperando Pago',
    descripcion:
      'Por favor realiza el pago por Yape o Plin y adjunta el comprobante para que la administración valide el pago y acepte tu orden.',
    color: 'amber',
  };

  if (entregado) {
    estadoVivo = {
      titulo: '¡Almuerzo Entregado con Éxito!',
      descripcion: pedido.horaEntrega
        ? `El pedido fue entregado a las ${pedido.horaEntrega} en el colegio ${pedido.colegioNombre} para ${pedido.estudianteNombre}.`
        : `El pedido fue entregado puntualmente en el colegio ${pedido.colegioNombre} para ${pedido.estudianteNombre}.`,
      color: 'emerald',
    };
  } else if (pedido.estadoPago === 'VERIFICANDO') {
    estadoVivo = {
      titulo: 'Comprobante en Revisión por Administración',
      descripcion:
        'Hemos recibido tu comprobante de pago. En breve el administrador lo validará para confirmar tu orden.',
      color: 'blue',
    };
  } else if (pagadoOAceptado) {
    estadoVivo = {
      titulo: '¡Pago Aceptado! Programado para Entrega',
      descripcion:
        `El pago ha sido confirmado. El almuerzo de ${pedido.estudianteNombre} está programado para ser entregado en el colegio ${pedido.colegioNombre}.`,
      color: 'blue',
    };
  }

  return { etapas, estadoVivo, pagadoOAceptado, entregado };
}

/**
 * Lógica pura de filtrado de cocina.
 * (src/app/cocina/page.tsx)
 */
function filtrarPedidosParaCocina(pedidos, colegioFiltro = 'TODOS') {
  // En cocina se cuentan y preparan TODOS los pedidos registrados (se hayan pagado o no)
  const pedidosFiltrados =
    colegioFiltro === 'TODOS'
      ? pedidos
      : pedidos.filter((p) => p.colegioNombre === colegioFiltro);

  const pedidosPendientesPago = pedidosFiltrados.filter(
    (p) => p.estadoPago !== 'PAGADO'
  );

  const pedidosPagados = pedidosFiltrados.filter(
    (p) => p.estadoPago === 'PAGADO'
  );

  return {
    totalCocina: pedidosFiltrados.length,
    pedidosAceptados: pedidosFiltrados,
    pedidosFiltrados,
    pedidosPendientesPago,
    pedidosPagados,
  };
}

describe('Flujo Operativo de Estados: Orden recibida -> Pago aceptado -> Entregado', () => {
  const basePedido = {
    id: 'ped-101',
    estudianteNombre: 'Mateo Quispe',
    colegioNombre: 'Colegio Claretiano',
    gradoSeccion: '3ro Primaria - A',
    fechaMenu: '2026-10-14',
    entradaNombre: 'Sopa de Verduras',
    segundoNombre: 'Arroz con Pollo',
    precioTotal: 15.0,
    estadoPedido: 'REGISTRADO',
    estadoPago: 'PENDIENTE',
    createdAt: '2026-10-14T13:45:00.000Z',
  };

  test('1. Etapa 1: Orden recibida (recién registrado sin pagar)', () => {
    const pedido = { ...basePedido };
    const timeline = calcularEstadoTimeline(pedido);

    assert.strictEqual(timeline.etapas.length, 3, 'El timeline debe constar de 3 etapas');
    assert.strictEqual(timeline.etapas[0].titulo, 'Orden recibida');
    assert.strictEqual(timeline.etapas[0].completado, true, 'Etapa 1 (Orden recibida) debe estar completada');

    assert.strictEqual(timeline.etapas[1].titulo, 'Pago aceptado');
    assert.strictEqual(timeline.etapas[1].completado, false, 'Etapa 2 (Pago aceptado) NO debe estar completada');
    assert.strictEqual(timeline.etapas[1].alerta, true, 'Etapa 2 debe mostrar alerta de pago');

    assert.strictEqual(timeline.etapas[2].titulo, 'Entregado');
    assert.strictEqual(timeline.etapas[2].completado, false, 'Etapa 3 (Entregado) NO debe estar completada');
    assert.strictEqual(timeline.estadoVivo.titulo, 'Orden Recibida - Esperando Pago');

    // Verificación en Cocina: Se contabiliza para cocinar, y se identifica como pendiente de pago
    const { totalCocina, pedidosPendientesPago } = filtrarPedidosParaCocina([pedido]);
    assert.strictEqual(totalCocina, 1, 'Cocina debe contabilizar todos los pedidos a cocinar se hayan pagado o no');
    assert.strictEqual(pedidosPendientesPago.length, 1, 'Debe aparecer como pendiente de pago');
  });

  test('2. Comprobante subido: Estado VERIFICANDO', () => {
    const pedido = { ...basePedido, estadoPago: 'VERIFICANDO', comprobanteUrl: 'https://ejemplo.com/voucher.jpg' };
    const timeline = calcularEstadoTimeline(pedido);

    assert.strictEqual(timeline.etapas[0].completado, true);
    assert.strictEqual(timeline.etapas[1].completado, false);
    assert.strictEqual(timeline.etapas[1].descripcion, 'Validando pago');
    assert.strictEqual(timeline.estadoVivo.titulo, 'Comprobante en Revisión por Administración');

    // En cocina ya está contabilizado para cocinar, y se marca como pendiente de pago
    const { totalCocina, pedidosPendientesPago } = filtrarPedidosParaCocina([pedido]);
    assert.strictEqual(totalCocina, 1);
    assert.strictEqual(pedidosPendientesPago.length, 1);
  });

  test('3. Etapa 2: Pago aceptado por Admin en Despacho', () => {
    const pedido = { ...basePedido, estadoPago: 'PAGADO' };
    const timeline = calcularEstadoTimeline(pedido);

    assert.strictEqual(timeline.etapas[0].completado, true, 'Paso 1 (Orden recibida) completado');
    assert.strictEqual(timeline.etapas[1].completado, true, 'Paso 2 (Pago aceptado) completado');
    assert.strictEqual(timeline.etapas[2].enCurso, true, 'Paso 3 (Entregado) en curso / programado');
    assert.strictEqual(timeline.estadoVivo.titulo, '¡Pago Aceptado! Programado para Entrega');

    // Pago aceptado: se mantiene en cocina y pasa a pago verificado
    const { totalCocina, pedidosPagados, pedidosPendientesPago } = filtrarPedidosParaCocina([pedido]);
    assert.strictEqual(totalCocina, 1, 'Cocina contabiliza la orden');
    assert.strictEqual(pedidosPagados.length, 1);
    assert.strictEqual(pedidosPendientesPago.length, 0);
  });

  test('4. Transición directa: De Pago aceptado a Entregado con registro de hora', () => {
    // REGLA: El admin en despacho pasa directamente de Pago aceptado a Entregado (ya no hay paso de preparado en el timeline)
    const pedido = {
      ...basePedido,
      estadoPago: 'PAGADO',
      estadoPedido: 'ENTREGADO',
      horaEntrega: '12:30 p. m.',
    };
    const timeline = calcularEstadoTimeline(pedido);

    assert.strictEqual(timeline.etapas.length, 3);
    assert.strictEqual(timeline.etapas[0].completado, true, '1. Orden recibida completada');
    assert.strictEqual(timeline.etapas[1].completado, true, '2. Pago aceptado completado');
    assert.strictEqual(timeline.etapas[2].completado, true, '3. Entregado completado');
    assert.strictEqual(timeline.etapas[2].descripcion, 'Entregado (12:30 p. m.)');
    assert.strictEqual(timeline.estadoVivo.titulo, '¡Almuerzo Entregado con Éxito!');
    assert.ok(timeline.estadoVivo.descripcion.includes('12:30 p. m.'));

    const { pedidosAceptados } = filtrarPedidosParaCocina([pedido]);
    assert.strictEqual(pedidosAceptados.length, 1, 'Cocina contabiliza el pedido entregado');
  });

  test('5. Despacho: Captura y formato de hora de creación y hora de entrega en Perú (America/Lima)', () => {
    const pedido = {
      ...basePedido,
      createdAt: '2026-10-14T17:15:00.000Z', // 12:15 p. m. en Perú UTC-5
      horaEntrega: '12:45 p. m.',
    };

    const formatearHoraPeru = (fechaIso) => {
      try {
        const d = new Date(fechaIso);
        return d.toLocaleTimeString('es-PE', {
          timeZone: 'America/Lima',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      } catch {
        return '';
      }
    };

    const horaPedido = formatearHoraPeru(pedido.createdAt);
    assert.ok(horaPedido.includes('12:15'), `La hora del pedido debe convertirse a America/Lima (12:15): ${horaPedido}`);
    assert.strictEqual(pedido.horaEntrega, '12:45 p. m.');
  });

  test('7. Filtro por Colegio en Cocina contabiliza todas las órdenes (pagadas o no)', () => {
    const p1 = { ...basePedido, id: '1', colegioNombre: 'Colegio Claretiano', estadoPago: 'PAGADO' };
    const p2 = { ...basePedido, id: '2', colegioNombre: 'Colegio Zárate', estadoPago: 'PAGADO' };
    const p3 = { ...basePedido, id: '3', colegioNombre: 'Colegio Claretiano', estadoPago: 'PENDIENTE' }; // No pagado

    const todos = filtrarPedidosParaCocina([p1, p2, p3], 'TODOS');
    assert.strictEqual(todos.pedidosFiltrados.length, 3, 'TODOS debe contabilizar los 3 pedidos (pagados o no)');

    const soloClaretiano = filtrarPedidosParaCocina([p1, p2, p3], 'Colegio Claretiano');
    assert.strictEqual(soloClaretiano.pedidosFiltrados.length, 2, 'Claretiano debe contabilizar 2 pedidos (p1 y p3)');

    const soloZarate = filtrarPedidosParaCocina([p1, p2, p3], 'Colegio Zárate');
    assert.strictEqual(soloZarate.pedidosFiltrados.length, 1, 'Zárate debe contabilizar 1 pedido (p2)');
    assert.strictEqual(soloZarate.pedidosFiltrados[0].id, '2');
  });

  test('8. Filtro de fecha en Cocina: discrimina entre hoy y ayer', () => {
    const hoyStr = '2026-10-14';
    const ayerStr = '2026-10-13';

    const pHoy = { ...basePedido, id: 'h1', fecha: hoyStr, estadoPago: 'PENDIENTE' };
    const pAyer = { ...basePedido, id: 'a1', fecha: ayerStr, estadoPago: 'PAGADO' };

    // Filtrar cocina para hoy (contabiliza pedidos hechos, pagados o no)
    const pedidosHoy = [pHoy, pAyer].filter((p) => p.fecha === hoyStr);
    assert.strictEqual(pedidosHoy.length, 1);
    assert.strictEqual(pedidosHoy[0].id, 'h1');

    // Filtrar cocina para ayer (contabiliza pedidos hechos, pagados o no)
    const pedidosAyer = [pHoy, pAyer].filter((p) => p.fecha === ayerStr);
    assert.strictEqual(pedidosAyer.length, 1);
    assert.strictEqual(pedidosAyer[0].id, 'a1');
  });

  test('9. Métricas Operativas de Admin: SOLO muestra Entregados y Falta Entregar', () => {
    const pEntregado = { ...basePedido, id: '1', estadoPago: 'PAGADO', estadoPedido: 'ENTREGADO' };
    const pPreparadoFaltaEntregar = { ...basePedido, id: '2', estadoPago: 'PAGADO', estadoPedido: 'EMPACADO' };
    const pEnCocinaFaltaEntregar = { ...basePedido, id: '3', estadoPago: 'PAGADO', estadoPedido: 'EN_COCINA' };
    const pNoPagado = { ...basePedido, id: '4', estadoPago: 'PENDIENTE', estadoPedido: 'REGISTRADO' };

    const pedidosPeriodo = [pEntregado, pPreparadoFaltaEntregar, pEnCocinaFaltaEntregar, pNoPagado];

    // Solo se consideran órdenes operativas (con pago aceptado o en proceso)
    const operativos = pedidosPeriodo.filter(
      (p) => p.estadoPago === 'PAGADO' || p.estadoPedido !== 'REGISTRADO'
    );
    assert.strictEqual(operativos.length, 3, 'Solo 3 pedidos tienen pago aceptado');

    const entregados = operativos.filter((p) => p.estadoPedido === 'ENTREGADO').length;
    assert.strictEqual(entregados, 1, '1 pedido entregado');

    const faltaEntregar = operativos.filter((p) => p.estadoPedido !== 'ENTREGADO').length;
    assert.strictEqual(faltaEntregar, 2, '2 pedidos falta entregar (con pago aceptado y preparados/en proceso)');

    const totalParaEntrega = entregados + faltaEntregar;
    const porcentajeEntrega = Math.round((entregados / totalParaEntrega) * 100);
    assert.strictEqual(porcentajeEntrega, 33, '33% completado (1 de 3)');
  });
});
