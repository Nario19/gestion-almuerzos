import { test, describe } from 'node:test';
import assert from 'node:assert';

/**
 * Función pura que replica la lógica de estado del timeline de pedidos para padres.
 * (src/app/pedidos/page.tsx -> obtenerEstadoTimeline)
 */
function calcularEstadoTimeline(pedido) {
  const pagadoOAceptado = pedido.estadoPago === 'PAGADO' || pedido.estadoPedido !== 'REGISTRADO';
  const enCocinaOListo =
    pedido.estadoPedido === 'EN_COCINA' ||
    pedido.estadoPedido === 'EMPACADO' ||
    pedido.estadoPedido === 'ENTREGADO';
  const empacadoOListo = pedido.estadoPedido === 'EMPACADO' || pedido.estadoPedido === 'ENTREGADO';
  const entregado = pedido.estadoPedido === 'ENTREGADO';

  const etapas = [
    {
      id: 1,
      titulo: 'Pedido',
      descripcion: 'Orden recibida',
      completado: true,
      enCurso: false,
      alerta: false,
    },
    {
      id: 2,
      titulo: 'Aceptado',
      descripcion: pagadoOAceptado
        ? 'Pago verificado'
        : pedido.estadoPago === 'VERIFICANDO'
        ? 'Validando pago'
        : 'Por Pagar',
      completado: pagadoOAceptado,
      enCurso: !pagadoOAceptado,
      alerta: pedido.estadoPago === 'PENDIENTE',
    },
    {
      id: 3,
      titulo: 'Preparado',
      descripcion: enCocinaOListo ? 'En Cocina' : 'En cola',
      completado: empacadoOListo,
      enCurso: pagadoOAceptado && !empacadoOListo,
      alerta: false,
    },
    {
      id: 4,
      titulo: 'Entrega',
      descripcion: entregado ? 'Entregado' : empacadoOListo ? 'Empacado' : 'En camino',
      completado: entregado,
      enCurso: empacadoOListo && !entregado,
      alerta: false,
    },
  ];

  let estadoVivo = {
    titulo: 'Orden Registrada - Esperando Pago',
    descripcion:
      'Por favor realiza el pago por Yape o Plin y adjunta el comprobante para que la administración acepte la orden y la envíe a cocina.',
    color: 'amber',
  };

  if (entregado) {
    estadoVivo = {
      titulo: '¡Almuerzo Entregado con Éxito!',
      descripcion: `El pedido fue entregado puntualmente en el colegio ${pedido.colegioNombre} para ${pedido.estudianteNombre}.`,
      color: 'emerald',
    };
  } else if (pedido.estadoPedido === 'EMPACADO') {
    estadoVivo = {
      titulo: 'Lonchera Empacada y Rotulada',
      descripcion: `Almuerzo listo y empacado en envase térmico rotulado con el grado (${pedido.gradoSeccion}). En ruta de entrega al colegio.`,
      color: 'purple',
    };
  } else if (pedido.estadoPedido === 'EN_COCINA') {
    estadoVivo = {
      titulo: 'En Preparación Activa en Cocina',
      descripcion: `El equipo de cocina está elaborando la entrada (${pedido.entradaNombre}) y el segundo (${pedido.segundoNombre}).`,
      color: 'orange',
    };
  } else if (pagadoOAceptado) {
    estadoVivo = {
      titulo: '¡Orden Aceptada! Pasó a Cocina',
      descripcion:
        'El pago ha sido confirmado por administración. La orden ya está asignada al equipo de cocina para la preparación de hoy.',
      color: 'blue',
    };
  } else if (pedido.estadoPago === 'VERIFICANDO') {
    estadoVivo = {
      titulo: 'Comprobante en Revisión por Administración',
      descripcion:
        'Hemos recibido tu comprobante de pago. En breve el administrador lo validará para aceptar tu orden y pasarla a cocina.',
      color: 'blue',
    };
  }

  return { etapas, estadoVivo, pagadoOAceptado, empacadoOListo, entregado };
}

/**
 * Lógica pura de filtrado de cocina.
 * (src/app/cocina/page.tsx)
 */
function filtrarPedidosParaCocina(pedidos, colegioFiltro = 'TODOS') {
  // En cocina solo se preparan pedidos aceptados (pago verificado o estado avanzado por administración)
  const pedidosAceptados = pedidos.filter(
    (p) => p.estadoPago === 'PAGADO' || p.estadoPedido !== 'REGISTRADO'
  );

  const pedidosPendientesDespacho = pedidos.filter(
    (p) => p.estadoPago !== 'PAGADO' && p.estadoPedido === 'REGISTRADO'
  );

  const pedidosFiltrados =
    colegioFiltro === 'TODOS'
      ? pedidosAceptados
      : pedidosAceptados.filter((p) => p.colegioNombre === colegioFiltro);

  return {
    pedidosAceptados,
    pedidosPendientesDespacho,
    pedidosFiltrados,
  };
}

describe('Flujo Operativo de Estados: Despacho -> Cocina -> Timeline Padres', () => {
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
  };

  test('1. Etapa Inicial: Pedido recién registrado sin pagar', () => {
    const pedido = { ...basePedido };
    const timeline = calcularEstadoTimeline(pedido);

    // Etapa 1 completada, Etapa 2 con alerta de pago pendiente
    assert.strictEqual(timeline.etapas[0].completado, true, 'Etapa 1 (Pedido) debe estar completada');
    assert.strictEqual(timeline.etapas[1].completado, false, 'Etapa 2 (Aceptado) NO debe estar completada');
    assert.strictEqual(timeline.etapas[1].alerta, true, 'Etapa 2 debe mostrar alerta de pago');
    assert.strictEqual(timeline.etapas[2].completado, false, 'Etapa 3 (Preparado) NO debe estar completada');
    assert.strictEqual(timeline.etapas[3].completado, false, 'Etapa 4 (Entrega) NO debe estar completada');
    assert.strictEqual(timeline.estadoVivo.titulo, 'Orden Registrada - Esperando Pago');

    // Verificación en Cocina: NO debe aparecer en pedidos de cocina
    const { pedidosAceptados, pedidosPendientesDespacho } = filtrarPedidosParaCocina([pedido]);
    assert.strictEqual(pedidosAceptados.length, 0, 'Cocina NO debe cocinar pedidos no aceptados');
    assert.strictEqual(pedidosPendientesDespacho.length, 1, 'Debe aparecer como pendiente en despacho');
  });

  test('2. Comprobante subido: Estado VERIFICANDO', () => {
    const pedido = { ...basePedido, estadoPago: 'VERIFICANDO', comprobanteUrl: 'https://ejemplo.com/voucher.jpg' };
    const timeline = calcularEstadoTimeline(pedido);

    assert.strictEqual(timeline.etapas[0].completado, true);
    assert.strictEqual(timeline.etapas[1].completado, false);
    assert.strictEqual(timeline.etapas[1].descripcion, 'Validando pago');
    assert.strictEqual(timeline.estadoVivo.titulo, 'Comprobante en Revisión por Administración');

    // Aún no llega a cocina hasta que admin acepte
    const { pedidosAceptados, pedidosPendientesDespacho } = filtrarPedidosParaCocina([pedido]);
    assert.strictEqual(pedidosAceptados.length, 0);
    assert.strictEqual(pedidosPendientesDespacho.length, 1);
  });

  test('3. Admin acepta orden en Despacho: Pasa a PAGADO -> Orden Aceptada', () => {
    const pedido = { ...basePedido, estadoPago: 'PAGADO' };
    const timeline = calcularEstadoTimeline(pedido);

    assert.strictEqual(timeline.etapas[0].completado, true, 'Paso 1 completado');
    assert.strictEqual(timeline.etapas[1].completado, true, 'Paso 2 (Aceptado) completado');
    assert.strictEqual(timeline.etapas[2].enCurso, true, 'Paso 3 (Preparado) en curso');
    assert.strictEqual(timeline.estadoVivo.titulo, '¡Orden Aceptada! Pasó a Cocina');

    // Ahora SÍ pasa a cocina
    const { pedidosAceptados, pedidosPendientesDespacho } = filtrarPedidosParaCocina([pedido]);
    assert.strictEqual(pedidosAceptados.length, 1, 'Cocina debe contabilizar la orden aceptada');
    assert.strictEqual(pedidosPendientesDespacho.length, 0);
  });

  test('4. Cocina avanza orden a EN_COCINA', () => {
    const pedido = { ...basePedido, estadoPago: 'PAGADO', estadoPedido: 'EN_COCINA' };
    const timeline = calcularEstadoTimeline(pedido);

    assert.strictEqual(timeline.etapas[1].completado, true);
    assert.strictEqual(timeline.etapas[2].enCurso, true);
    assert.strictEqual(timeline.estadoVivo.titulo, 'En Preparación Activa en Cocina');
    assert.ok(timeline.estadoVivo.descripcion.includes('Arroz con Pollo'));

    const { pedidosAceptados } = filtrarPedidosParaCocina([pedido]);
    assert.strictEqual(pedidosAceptados.length, 1);
  });

  test('5. Despacho/Cocina empaca la lonchera: EMPACADO', () => {
    const pedido = { ...basePedido, estadoPago: 'PAGADO', estadoPedido: 'EMPACADO' };
    const timeline = calcularEstadoTimeline(pedido);

    assert.strictEqual(timeline.etapas[0].completado, true);
    assert.strictEqual(timeline.etapas[1].completado, true);
    assert.strictEqual(timeline.etapas[2].completado, true, 'Paso 3 Preparado está completado');
    assert.strictEqual(timeline.etapas[3].enCurso, true, 'Paso 4 Entrega está en curso');
    assert.strictEqual(timeline.estadoVivo.titulo, 'Lonchera Empacada y Rotulada');

    const { pedidosAceptados } = filtrarPedidosParaCocina([pedido]);
    assert.strictEqual(pedidosAceptados.length, 1);
  });

  test('6. Reparto entrega en colegio: ENTREGADO', () => {
    const pedido = { ...basePedido, estadoPago: 'PAGADO', estadoPedido: 'ENTREGADO' };
    const timeline = calcularEstadoTimeline(pedido);

    assert.strictEqual(timeline.etapas[0].completado, true);
    assert.strictEqual(timeline.etapas[1].completado, true);
    assert.strictEqual(timeline.etapas[2].completado, true);
    assert.strictEqual(timeline.etapas[3].completado, true, 'Paso 4 Entrega completado');
    assert.strictEqual(timeline.estadoVivo.titulo, '¡Almuerzo Entregado con Éxito!');

    const { pedidosAceptados } = filtrarPedidosParaCocina([pedido]);
    assert.strictEqual(pedidosAceptados.length, 1);
  });

  test('7. Filtro por Colegio en Cocina respeta órdenes aceptadas', () => {
    const p1 = { ...basePedido, id: '1', colegioNombre: 'Colegio Claretiano', estadoPago: 'PAGADO' };
    const p2 = { ...basePedido, id: '2', colegioNombre: 'Colegio Zárate', estadoPago: 'PAGADO' };
    const p3 = { ...basePedido, id: '3', colegioNombre: 'Colegio Claretiano', estadoPago: 'PENDIENTE' }; // No pagado

    const todos = filtrarPedidosParaCocina([p1, p2, p3], 'TODOS');
    assert.strictEqual(todos.pedidosFiltrados.length, 2, 'Solo p1 y p2 aceptados');

    const soloClaretiano = filtrarPedidosParaCocina([p1, p2, p3], 'Colegio Claretiano');
    assert.strictEqual(soloClaretiano.pedidosFiltrados.length, 1, 'Solo p1 debe aparecer para Claretiano');
    assert.strictEqual(soloClaretiano.pedidosFiltrados[0].id, '1');

    const soloZarate = filtrarPedidosParaCocina([p1, p2, p3], 'Colegio Zárate');
    assert.strictEqual(soloZarate.pedidosFiltrados.length, 1, 'Solo p2 debe aparecer para Zárate');
    assert.strictEqual(soloZarate.pedidosFiltrados[0].id, '2');
  });
});
