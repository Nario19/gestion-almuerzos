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
      titulo: 'Preparado',
      descripcion: (entregado || empacadoOListo)
        ? 'Almuerzo preparado'
        : pedido.estadoPedido === 'EN_COCINA'
        ? 'En preparación'
        : 'En cola',
      // REGLA CLAVE: Si el admin pasa de frente de pago aceptado a entregado,
      // preparado se considera completado automáticamente.
      completado: empacadoOListo || entregado,
      enCurso: (pagadoOAceptado || entregado) && !empacadoOListo && !entregado,
      alerta: false,
    },
    {
      id: 4,
      titulo: 'Entregado',
      descripcion: entregado ? 'Entregado en colegio' : empacadoOListo ? 'Listo para entrega' : 'Programado',
      completado: entregado,
      enCurso: empacadoOListo && !entregado,
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
      descripcion: `El pedido fue entregado puntualmente en el colegio ${pedido.colegioNombre} para ${pedido.estudianteNombre}.`,
      color: 'emerald',
    };
  } else if (pedido.estadoPedido === 'EMPACADO') {
    estadoVivo = {
      titulo: 'Lonchera Preparada y Empacada',
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
      titulo: '¡Pago Aceptado! Orden en Cocina',
      descripcion:
        'El pago ha sido confirmado por administración. La orden ya está en cocina para su preparación.',
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

describe('Flujo Operativo de Estados: Orden recibida -> Pago aceptado -> Preparado -> Entregado', () => {
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

  test('1. Etapa 1: Orden recibida (recién registrado sin pagar)', () => {
    const pedido = { ...basePedido };
    const timeline = calcularEstadoTimeline(pedido);

    assert.strictEqual(timeline.etapas[0].titulo, 'Orden recibida');
    assert.strictEqual(timeline.etapas[0].completado, true, 'Etapa 1 (Orden recibida) debe estar completada');

    assert.strictEqual(timeline.etapas[1].titulo, 'Pago aceptado');
    assert.strictEqual(timeline.etapas[1].completado, false, 'Etapa 2 (Pago aceptado) NO debe estar completada');
    assert.strictEqual(timeline.etapas[1].alerta, true, 'Etapa 2 debe mostrar alerta de pago');

    assert.strictEqual(timeline.etapas[2].titulo, 'Preparado');
    assert.strictEqual(timeline.etapas[2].completado, false, 'Etapa 3 (Preparado) NO debe estar completada');

    assert.strictEqual(timeline.etapas[3].titulo, 'Entregado');
    assert.strictEqual(timeline.etapas[3].completado, false, 'Etapa 4 (Entregado) NO debe estar completada');
    assert.strictEqual(timeline.estadoVivo.titulo, 'Orden Recibida - Esperando Pago');

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

    // Aún no llega a cocina hasta que admin acepte el pago
    const { pedidosAceptados, pedidosPendientesDespacho } = filtrarPedidosParaCocina([pedido]);
    assert.strictEqual(pedidosAceptados.length, 0);
    assert.strictEqual(pedidosPendientesDespacho.length, 1);
  });

  test('3. Etapa 2: Pago aceptado por Admin en Despacho', () => {
    const pedido = { ...basePedido, estadoPago: 'PAGADO' };
    const timeline = calcularEstadoTimeline(pedido);

    assert.strictEqual(timeline.etapas[0].completado, true, 'Paso 1 (Orden recibida) completado');
    assert.strictEqual(timeline.etapas[1].completado, true, 'Paso 2 (Pago aceptado) completado');
    assert.strictEqual(timeline.etapas[2].enCurso, true, 'Paso 3 (Preparado) en curso');
    assert.strictEqual(timeline.estadoVivo.titulo, '¡Pago Aceptado! Orden en Cocina');

    // Ahora SÍ pasa a cocina
    const { pedidosAceptados, pedidosPendientesDespacho } = filtrarPedidosParaCocina([pedido]);
    assert.strictEqual(pedidosAceptados.length, 1, 'Cocina debe contabilizar la orden con pago aceptado');
    assert.strictEqual(pedidosPendientesDespacho.length, 0);
  });

  test('4. Etapa 3: Cocina en preparación activa o empaque', () => {
    const pedido = { ...basePedido, estadoPago: 'PAGADO', estadoPedido: 'EN_COCINA' };
    const timeline = calcularEstadoTimeline(pedido);

    assert.strictEqual(timeline.etapas[1].completado, true);
    assert.strictEqual(timeline.etapas[2].enCurso, true);
    assert.strictEqual(timeline.estadoVivo.titulo, 'En Preparación Activa en Cocina');
    assert.ok(timeline.estadoVivo.descripcion.includes('Arroz con Pollo'));

    const { pedidosAceptados } = filtrarPedidosParaCocina([pedido]);
    assert.strictEqual(pedidosAceptados.length, 1);
  });

  test('5. Etapa 3 completada: Preparado / Empacado en lonchera', () => {
    const pedido = { ...basePedido, estadoPago: 'PAGADO', estadoPedido: 'EMPACADO' };
    const timeline = calcularEstadoTimeline(pedido);

    assert.strictEqual(timeline.etapas[0].completado, true);
    assert.strictEqual(timeline.etapas[1].completado, true);
    assert.strictEqual(timeline.etapas[2].completado, true, 'Paso 3 Preparado está completado');
    assert.strictEqual(timeline.etapas[3].enCurso, true, 'Paso 4 Entregado está en curso');
    assert.strictEqual(timeline.estadoVivo.titulo, 'Lonchera Preparada y Empacada');

    const { pedidosAceptados } = filtrarPedidosParaCocina([pedido]);
    assert.strictEqual(pedidosAceptados.length, 1);
  });

  test('6. REGLA CLAVE: Si admin pasa directo de Pago aceptado a Entregado, Preparado queda completado automáticamente', () => {
    // Pedido que estaba en Pago aceptado (PAGADO, REGISTRADO) y el admin lo pasa directo a ENTREGADO
    const pedido = { ...basePedido, estadoPago: 'PAGADO', estadoPedido: 'ENTREGADO' };
    const timeline = calcularEstadoTimeline(pedido);

    // Todos los 4 pasos deben figurar como completados
    assert.strictEqual(timeline.etapas[0].completado, true, '1. Orden recibida debe estar completada');
    assert.strictEqual(timeline.etapas[1].completado, true, '2. Pago aceptado debe estar completado');
    assert.strictEqual(timeline.etapas[2].completado, true, '3. Preparado DEBE estar completado automáticamente al saltar a Entregado');
    assert.strictEqual(timeline.etapas[2].enCurso, false, '3. Preparado ya no está en curso');
    assert.strictEqual(timeline.etapas[3].completado, true, '4. Entregado debe estar completado');
    assert.strictEqual(timeline.etapas[3].enCurso, false);
    assert.strictEqual(timeline.estadoVivo.titulo, '¡Almuerzo Entregado con Éxito!');

    const { pedidosAceptados } = filtrarPedidosParaCocina([pedido]);
    assert.strictEqual(pedidosAceptados.length, 1, 'Cocina contabiliza el pedido entregado');
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
