import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Sustitución de Efectivo por Pagar luego, Pantalla de Fiado, Reglas de Entrega y Menús por Colegio', async (t) => {

  await t.test('1. Tipo MetodoPago incluye "Pagar luego" y sustituye a "Efectivo" en el formulario', () => {
    const typesPath = path.join(rootDir, 'src', 'types', 'index.ts');
    const typesContent = fs.readFileSync(typesPath, 'utf-8');
    assert.ok(
      typesContent.includes("'Pagar luego'"),
      "MetodoPago debe incluir 'Pagar luego'"
    );

    const pagePath = path.join(rootDir, 'src', 'app', 'padres', 'page.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf-8');
    assert.ok(
      pageContent.includes("['Yape', 'Plin', 'Pagar luego']"),
      "src/app/page.tsx debe ofrecer los métodos Yape, Plin y Pagar luego"
    );
    assert.ok(
      pageContent.includes('Paga al recibir el almuerzo'),
      "src/app/page.tsx debe explicar el método Pagar luego al padre"
    );
  });

  await t.test('2. Regla Estricta de Entrega: Yape/Plin bloquea entrega sin pago; "Pagar luego" permite entregar', () => {
    function validarEntrega(pedido) {
      const esYapeOPlin = pedido.metodoPago === 'Yape' || pedido.metodoPago === 'Plin';
      if (esYapeOPlin && pedido.estadoPago !== 'PAGADO') {
        return {
          permitido: false,
          error: `No se puede marcar como entregado el pedido #${pedido.codigoPedido}: El pago por ${pedido.metodoPago} debe ser confirmado antes de realizar la entrega.`,
        };
      }
      return { permitido: true };
    }

    // A. Pedido Yape sin pagar
    const pedYape = { codigoPedido: 'ALM-101', metodoPago: 'Yape', estadoPago: 'PENDIENTE' };
    const resYape = validarEntrega(pedYape);
    assert.equal(resYape.permitido, false, 'Yape pendiente no debe permitir entrega');
    assert.ok(resYape.error.includes('El pago por Yape debe ser confirmado'));

    // B. Pedido Plin en verificación
    const pedPlin = { codigoPedido: 'ALM-102', metodoPago: 'Plin', estadoPago: 'VERIFICANDO' };
    const resPlin = validarEntrega(pedPlin);
    assert.equal(resPlin.permitido, false, 'Plin verificando no debe permitir entrega');

    // C. Pedido Pagar luego (Fiado): ES EL ÚNICO que permite entregar con pago pendiente
    const pedPagarLuego = { codigoPedido: 'ALM-103', metodoPago: 'Pagar luego', estadoPago: 'PENDIENTE' };
    const resPagarLuego = validarEntrega(pedPagarLuego);
    assert.equal(resPagarLuego.permitido, true, 'Pagar luego sí debe permitir marcar como entregado');

    // D. Pedido Yape con pago PAGADO: Permite entrega
    const pedYapePagado = { codigoPedido: 'ALM-104', metodoPago: 'Yape', estadoPago: 'PAGADO' };
    assert.equal(validarEntrega(pedYapePagado).permitido, true, 'Yape pagado permite entrega');
  });

  await t.test('3. En Despacho: Se implementa el bloqueo de entrega en UI y botón de alerta', () => {
    const despachoPath = path.join(rootDir, 'src', 'app', 'admin', 'despacho', 'page.tsx');
    const despachoContent = fs.readFileSync(despachoPath, 'utf-8');

    assert.ok(
      despachoContent.includes("p.metodoPago === 'Yape' || p.metodoPago === 'Plin'"),
      'Despacho debe verificar si el método es Yape o Plin'
    );
    assert.ok(
      despachoContent.includes('alertaBloqueoEntrega'),
      'Despacho debe incluir estado de alerta para bloqueo de entrega'
    );
    assert.ok(
      despachoContent.includes('Requiere Pago'),
      'Despacho debe mostrar botón con texto Requiere Pago cuando Yape/Plin está pendiente'
    );
    assert.ok(
      despachoContent.includes("p.metodoPago === 'Pagar luego'"),
      'Despacho debe mostrar insignia para Pagar luego'
    );
  });

  await t.test('4. Pantalla y Servicio de Fiados: Agrupación por Apoderado, Cálculo de Deuda y Estado de Cuenta', () => {
    // Simulación del agrupador de fiados implementado en dataService
    const pedidosMuestra = [
      {
        id: 'p1',
        codigoPedido: 'ALM-F1',
        fecha: '2026-10-14',
        padreId: 'padre-01',
        estudianteNombre: 'Dhana Quispe',
        gradoSeccion: '9no C',
        colegioNombre: 'Colegio Claretiano',
        entradaNombre: 'Sopa de verduras',
        segundoNombre: 'Seco de pollo',
        metodoPago: 'Pagar luego',
        estadoPago: 'PENDIENTE',
        estadoPedido: 'ENTREGADO',
        monto: 12.0,
      },
      {
        id: 'p2',
        codigoPedido: 'ALM-F2',
        fecha: '2026-10-15',
        padreId: 'padre-01',
        estudianteNombre: 'Mateo Quispe',
        gradoSeccion: '5to Primaria',
        colegioNombre: 'Colegio Claretiano',
        entradaNombre: 'Crema rosada',
        segundoNombre: 'Tallarines rojos',
        metodoPago: 'Pagar luego',
        estadoPago: 'PENDIENTE',
        estadoPedido: 'REGISTRADO',
        monto: 12.0,
      },
      {
        id: 'p3',
        codigoPedido: 'ALM-F3',
        fecha: '2026-10-14',
        padreId: 'padre-02',
        estudianteNombre: 'Lucas Santos',
        gradoSeccion: '3ro B',
        colegioNombre: 'Colegio Claretiano',
        entradaNombre: 'Sopa wantán',
        segundoNombre: 'Arroz chaufa',
        metodoPago: 'Pagar luego',
        estadoPago: 'PAGADO', // Ya canceló
        estadoPedido: 'ENTREGADO',
        monto: 12.0,
      },
    ];

    // Función de cálculo
    function calcularFiados(pedidos) {
      const grupos = new Map();
      pedidos.forEach((p) => {
        if (!grupos.has(p.padreId)) {
          grupos.set(p.padreId, {
            padreId: p.padreId,
            hijos: new Set(),
            totalDeuda: 0,
            pedidos: [],
            entregados: 0,
          });
        }
        const g = grupos.get(p.padreId);
        g.hijos.add(p.estudianteNombre);
        if (p.estadoPago !== 'PAGADO') g.totalDeuda += p.monto;
        if (p.estadoPedido === 'ENTREGADO') g.entregados++;
        g.pedidos.push(p);
      });
      return Array.from(grupos.values());
    }

    const resultado = calcularFiados(pedidosMuestra);
    assert.equal(resultado.length, 2, 'Debe haber 2 familias/padres');

    const padre1 = resultado.find((r) => r.padreId === 'padre-01');
    assert.equal(padre1.totalDeuda, 24.0, 'Padre 1 debe tener deuda de S/ 24.00');
    assert.equal(padre1.hijos.size, 2, 'Padre 1 tiene 2 hijos con almuerzos');
    assert.equal(padre1.entregados, 1, '1 almuerzo ya entregado');

    const padre2 = resultado.find((r) => r.padreId === 'padre-02');
    assert.equal(padre2.totalDeuda, 0, 'Padre 2 ya pagó, deuda en 0');
  });

  await t.test('5. Mensajería de Cobro por WhatsApp y Liquidación de Deuda', () => {
    function generarMensajeWhatsApp({ nombrePadre, colegioNombre, pedidos, totalDeuda }) {
      const pedidosPendientes = pedidos.filter((p) => p.estadoPago !== 'PAGADO');
      const detalle = pedidosPendientes
        .map((p) => `• ${p.fecha} - ${p.estudianteNombre} (${p.gradoSeccion}): ${p.segundoNombre} (S/ ${p.monto.toFixed(2)})`)
        .join('\n');

      return (
        `Hola *${nombrePadre}*, le saludamos de *Placeres Culinarios* (${colegioNombre}).\n\n` +
        `Le compartimos el estado de cuenta de sus almuerzos ("Pagar luego / Fiado"):\n\n` +
        `${detalle}\n\n` +
        `💰 *Total pendiente de pago: S/ ${totalDeuda.toFixed(2)}*`
      );
    }

    const mensaje = generarMensajeWhatsApp({
      nombrePadre: 'Nario Reyes',
      colegioNombre: 'Colegio San Agustín',
      totalDeuda: 24.0,
      pedidos: [
        {
          fecha: '2026-10-14',
          estudianteNombre: 'Dhana Reyes',
          gradoSeccion: '9no C',
          segundoNombre: 'Seco de pollo',
          monto: 12.0,
          estadoPago: 'PENDIENTE',
        },
        {
          fecha: '2026-10-15',
          estudianteNombre: 'Mateo Reyes',
          gradoSeccion: '5to Primaria',
          segundoNombre: 'Tallarines rojos',
          monto: 12.0,
          estadoPago: 'PENDIENTE',
        },
      ],
    });

    assert.ok(mensaje.includes('Nario Reyes'));
    assert.ok(mensaje.includes('Dhana Reyes'));
    assert.ok(mensaje.includes('Mateo Reyes'));
    assert.ok(mensaje.includes('Total pendiente de pago: S/ 24.00'));
  });

  await t.test('6. Menú Independiente por Colegio: dataService soporta colegioNombre en platos', () => {
    const dataServicePath = path.join(rootDir, 'src', 'lib', 'dataService.ts');
    const dataServiceContent = fs.readFileSync(dataServicePath, 'utf-8');

    assert.ok(
      dataServiceContent.includes('obtenerPlatosPorDia(dia: DiaSemana, colegioNombre?: string)'),
      'obtenerPlatosPorDia debe recibir colegioNombre'
    );
    assert.ok(
      dataServiceContent.includes('platos.filter'),
      'Debe filtrar platos según el colegioNombre proporcionado'
    );
    assert.ok(
      dataServiceContent.includes('[Colegio:'),
      'Debe almacenar y decodificar el tag [Colegio: ...]'
    );
    assert.ok(
      dataServiceContent.includes('obtenerFiados'),
      'dataService debe implementar método obtenerFiados'
    );
    assert.ok(
      dataServiceContent.includes('liquidarDeudaPadre'),
      'dataService debe implementar método liquidarDeudaPadre'
    );
    assert.ok(
      dataServiceContent.includes('marcarFiadoComoPagado'),
      'dataService debe implementar método marcarFiadoComoPagado'
    );
  });

  await t.test('7. Sustitución de "Entrada" por "Sopa o postre" en menú, cocina y despacho', () => {
    const pageContent = fs.readFileSync(path.join(rootDir, 'src', 'app', 'padres', 'page.tsx'), 'utf-8');
    assert.ok(
      pageContent.includes('1. Sopa o postre'),
      "src/app/padres/page.tsx debe titular '1. Sopa o postre'"
    );

    const despachoContent = fs.readFileSync(path.join(rootDir, 'src', 'app', 'admin', 'despacho', 'page.tsx'), 'utf-8');
    assert.ok(
      despachoContent.includes('Sopa o postre:'),
      "src/app/admin/despacho/page.tsx debe rotular 'Sopa o postre:'"
    );

    const cocinaContent = fs.readFileSync(path.join(rootDir, 'src', 'app', 'admin', 'cocina', 'page.tsx'), 'utf-8');
    assert.ok(
      cocinaContent.includes('Consolidado de Sopas o Postres'),
      "src/app/admin/cocina/page.tsx debe rotular 'Consolidado de Sopas o Postres'"
    );

    const navContent = fs.readFileSync(path.join(rootDir, 'src', 'components', 'HeaderNav.tsx'), 'utf-8');
    assert.ok(
      navContent.includes('/fiado'),
      "HeaderNav debe incluir acceso a '/fiado'"
    );
    assert.ok(
      navContent.includes('Fiado'),
      "HeaderNav debe mostrar el enlace 'Fiado'"
    );
  });
});
