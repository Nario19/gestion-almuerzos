import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * Función réplica pura de obtenerIdentificadorColegio (de src/lib/dataService.ts)
 */
function obtenerIdentificadorColegio(colegioNombre) {
  if (!colegioNombre) return 'COL';
  const normalizado = colegioNombre.trim().toLowerCase();

  if (normalizado.includes('claretiano')) return 'CLA';
  if (normalizado.includes('san agustin') || normalizado.includes('san agustín')) return 'CSA';
  if (normalizado.includes('santa rosa')) return 'CSR';
  if (normalizado.includes('la salle')) return 'CLS';
  if (normalizado.includes('inmaculada')) return 'INC';

  const soloNombre = normalizado.split('|')[0].trim();
  const sinPuntuacion = soloNombre.replace(/[.,\-_/]/g, ' ');
  const palabrasLimpias = sinPuntuacion
    .split(/\s+/)
    .filter((w) => !/^(colegio|ie|i|e|institucion|institución|educativa|de|del|la|las|los|el|y)$/i.test(w))
    .filter(Boolean);

  if (palabrasLimpias.length >= 2) {
    const acronimo = palabrasLimpias.map((w) => w[0]).join('').toUpperCase().slice(0, 4);
    if (acronimo.length >= 2) return acronimo;
  }

  const primeraPalabra = (palabrasLimpias[0] || soloNombre).replace(/[^a-z0-9]/gi, '').toUpperCase();
  return primeraPalabra.slice(0, 3) || 'COL';
}

/**
 * Función réplica pura del cálculo de resumen de cocina agrupado por colegio
 */
function calcularResumenCocina(pedidos) {
  const mapSegundos = new Map();
  const mapEntradas = new Map();
  const mapPorColegio = new Map();

  for (const p of pedidos) {
    if (p.segundoNombre) {
      mapSegundos.set(p.segundoNombre, (mapSegundos.get(p.segundoNombre) || 0) + 1);
    }
    if (p.entradaNombre) {
      mapEntradas.set(p.entradaNombre, (mapEntradas.get(p.entradaNombre) || 0) + 1);
    }

    const colNombre = p.colegioNombre || 'General';
    if (!mapPorColegio.has(colNombre)) {
      mapPorColegio.set(colNombre, {
        colegioNombre: colNombre,
        identificador: obtenerIdentificadorColegio(colNombre),
        totalPedidos: 0,
        mapSegundos: new Map(),
        mapEntradas: new Map(),
      });
    }

    const colData = mapPorColegio.get(colNombre);
    colData.totalPedidos += 1;
    if (p.segundoNombre) {
      colData.mapSegundos.set(p.segundoNombre, (colData.mapSegundos.get(p.segundoNombre) || 0) + 1);
    }
    if (p.entradaNombre) {
      colData.mapEntradas.set(p.entradaNombre, (colData.mapEntradas.get(p.entradaNombre) || 0) + 1);
    }
  }

  const porColegio = Array.from(mapPorColegio.values()).map((col) => ({
    colegioNombre: col.colegioNombre,
    identificador: col.identificador,
    totalPedidos: col.totalPedidos,
    segundos: Array.from(col.mapSegundos.entries()).map(([plato, cantidad]) => ({ plato, cantidad })),
    entradas: Array.from(col.mapEntradas.entries()).map(([plato, cantidad]) => ({ plato, cantidad })),
  }));

  return {
    totalPedidos: pedidos.length,
    segundos: Array.from(mapSegundos.entries()).map(([plato, cantidad]) => ({ plato, cantidad })),
    entradas: Array.from(mapEntradas.entries()).map(([plato, cantidad]) => ({ plato, cantidad })),
    porColegio,
  };
}

test('Independencia de Almuerzos y Pedidos por Colegio con Identificador y Correlativo', async (t) => {
  const dataServicePath = path.join(rootDir, 'src', 'lib', 'dataService.ts');
  const dataServiceContent = fs.readFileSync(dataServicePath, 'utf-8');

  await t.test('1. obtenerIdentificadorColegio genera siglas canónicas y dinámicas correctas', () => {
    // Colegios estándar del sistema
    assert.equal(obtenerIdentificadorColegio('Colegio Claretiano'), 'CLA');
    assert.equal(obtenerIdentificadorColegio('Colegio San Agustín'), 'CSA');
    assert.equal(obtenerIdentificadorColegio('Colegio San Agustin'), 'CSA');
    assert.equal(obtenerIdentificadorColegio('Colegio Santa Rosa'), 'CSR');
    assert.equal(obtenerIdentificadorColegio('Colegio La Salle'), 'CLS');
    assert.equal(obtenerIdentificadorColegio('Inmaculada Concepción'), 'INC');

    // Con formato "Sede | DNI"
    assert.equal(obtenerIdentificadorColegio('Colegio Claretiano | 10000001'), 'CLA');
    assert.equal(obtenerIdentificadorColegio('Colegio San Agustín | 10000002'), 'CSA');

    // Nombres dinámicos
    assert.equal(obtenerIdentificadorColegio('Colegio San Juan'), 'SJ');
    assert.equal(obtenerIdentificadorColegio('I.E. Los Pinos'), 'PIN');
    assert.equal(obtenerIdentificadorColegio('I.E. Mariano Melgar'), 'MM');
    assert.equal(obtenerIdentificadorColegio(''), 'COL');
  });

  await t.test('2. dataService implementa correlativos independientes por colegio en obtenerSiguienteNumeroAlmuerzoColegio y crearPedido', () => {
    assert.ok(
      dataServiceContent.includes('export function obtenerIdentificadorColegio'),
      'dataService debe exportar la función obtenerIdentificadorColegio'
    );
    assert.ok(
      dataServiceContent.includes('obtenerSiguienteNumeroAlmuerzoColegio'),
      'dataService debe implementar obtenerSiguienteNumeroAlmuerzoColegio'
    );
    assert.ok(
      dataServiceContent.includes('const prefijo = obtenerIdentificadorColegio(colegioNom);'),
      'crearPedido debe obtener el prefijo del colegio correspondiente'
    );
    assert.ok(
      dataServiceContent.includes('const siguienteNum = await this.obtenerSiguienteNumeroAlmuerzoColegio(colegioNom);'),
      'crearPedido debe consultar el número correlativo por colegio'
    );
    assert.ok(
      dataServiceContent.includes('`${prefijo}-${String(siguienteNum).padStart(3, \'0\')}`'),
      'crearPedido debe formatear el código como PREFIJO-001'
    );

    // Simulación de cálculo de correlativo aislado
    const pedidosRegistrados = [
      { colegioNombre: 'Colegio Claretiano', codigoPedido: 'CLA-001' },
      { colegioNombre: 'Colegio Claretiano', codigoPedido: 'CLA-002' },
      { colegioNombre: 'Colegio San Agustín', codigoPedido: 'CSA-001' },
    ];

    const calcularSiguiente = (colegioNom) => {
      const pref = obtenerIdentificadorColegio(colegioNom);
      const regex = new RegExp(`^${pref}-(\\d+)`, 'i');
      let max = 0;
      for (const p of pedidosRegistrados) {
        if (p.codigoPedido?.startsWith(`${pref}-`)) {
          const match = p.codigoPedido.match(regex);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > max) max = num;
          }
        }
      }
      return `${pref}-${String(max + 1).padStart(3, '0')}`;
    };

    assert.equal(calcularSiguiente('Colegio Claretiano'), 'CLA-003', 'Claretiano debe continuar en 003');
    assert.equal(calcularSiguiente('Colegio San Agustín'), 'CSA-002', 'San Agustín debe continuar en 002');
    assert.equal(calcularSiguiente('Colegio Santa Rosa'), 'CSR-001', 'Santa Rosa debe empezar en 001 independientemente');
  });

  await t.test('3. calcularResumenCocina agrupa platos desglosados independientemente por colegio', () => {
    const pedidosMuestra = [
      {
        id: '1',
        codigoPedido: 'CLA-001',
        fecha: '2026-10-15',
        colegioNombre: 'Colegio Claretiano',
        estudianteNombre: 'Alumno 1',
        gradoSeccion: '1A',
        telefonoContacto: '999',
        entradaNombre: 'Crema de zapallo',
        segundoNombre: 'Seco de pollo claretiano',
        metodoPago: 'Yape',
        estadoPago: 'PAGADO',
        estadoPedido: 'REGISTRADO',
        monto: 12,
        createdAt: '2026-10-15T10:00:00Z',
      },
      {
        id: '2',
        codigoPedido: 'CLA-002',
        fecha: '2026-10-15',
        colegioNombre: 'Colegio Claretiano',
        estudianteNombre: 'Alumno 2',
        gradoSeccion: '2A',
        telefonoContacto: '999',
        entradaNombre: 'Crema de zapallo',
        segundoNombre: 'Seco de pollo claretiano',
        metodoPago: 'Pagar luego',
        estadoPago: 'PENDIENTE',
        estadoPedido: 'REGISTRADO',
        monto: 12,
        createdAt: '2026-10-15T10:01:00Z',
      },
      {
        id: '3',
        codigoPedido: 'CSA-001',
        fecha: '2026-10-15',
        colegioNombre: 'Colegio San Agustín',
        estudianteNombre: 'Alumno 3',
        gradoSeccion: '3A',
        telefonoContacto: '888',
        entradaNombre: 'Causa de atún',
        segundoNombre: 'Chaufa de pollo agustino',
        metodoPago: 'Yape',
        estadoPago: 'PAGADO',
        estadoPedido: 'REGISTRADO',
        monto: 12,
        createdAt: '2026-10-15T10:02:00Z',
      },
    ];

    const resumen = calcularResumenCocina(pedidosMuestra);

    assert.equal(resumen.totalPedidos, 3);
    assert.ok(Array.isArray(resumen.porColegio), 'Debe incluir desglose porColegio');
    assert.equal(resumen.porColegio.length, 2, 'Deben existir 2 colegios en el desglose');

    const colCla = resumen.porColegio.find((c) => c.colegioNombre === 'Colegio Claretiano');
    assert.ok(colCla);
    assert.equal(colCla.identificador, 'CLA');
    assert.equal(colCla.totalPedidos, 2);
    assert.equal(colCla.segundos[0].plato, 'Seco de pollo claretiano');
    assert.equal(colCla.segundos[0].cantidad, 2);

    const colCsa = resumen.porColegio.find((c) => c.colegioNombre === 'Colegio San Agustín');
    assert.ok(colCsa);
    assert.equal(colCsa.identificador, 'CSA');
    assert.equal(colCsa.totalPedidos, 1);
    assert.equal(colCsa.segundos[0].plato, 'Chaufa de pollo agustino');
    assert.equal(colCsa.segundos[0].cantidad, 1);
  });

  await t.test('4. En /despacho se visualiza Almuerzo # y código con identificador escolar', () => {
    const despachoPath = path.join(rootDir, 'src', 'app', 'despacho', 'page.tsx');
    const content = fs.readFileSync(despachoPath, 'utf-8');

    assert.ok(
      content.includes('Almuerzo #{numeroAlmuerzo}'),
      'Despacho debe renderizar "Almuerzo #{numeroAlmuerzo}" en la tabla'
    );
    assert.ok(
      content.includes('#{p.codigoPedido}'),
      'Despacho debe renderizar "#{p.codigoPedido}" con el código escolar'
    );
    assert.ok(
      content.includes('N° Almuerzo / Hora'),
      'La cabecera de la columna debe indicar "N° Almuerzo / Hora"'
    );
    assert.ok(
      content.includes('N° Almuerzo') && content.includes('Código'),
      'El Excel exportado en Despacho debe incluir Código y N° Almuerzo'
    );
  });

  await t.test('5. En /cocina se visualiza Almuerzos Independientes por Colegio y códigos de pedido', () => {
    const cocinaPath = path.join(rootDir, 'src', 'app', 'cocina', 'page.tsx');
    const content = fs.readFileSync(cocinaPath, 'utf-8');

    assert.ok(
      content.includes('Almuerzos Independientes por Colegio'),
      'Cocina debe incluir la sección de Almuerzos Independientes por Colegio'
    );
    assert.ok(
      content.includes('col.identificador'),
      'Cocina debe renderizar las siglas del colegio (col.identificador)'
    );
    assert.ok(
      content.includes('#{p.codigoPedido}'),
      'En observaciones de Cocina se debe mostrar el código #{p.codigoPedido}'
    );
  });

  await t.test('6. Seeder completo define menús independientes y pedidos con prefijo por colegio', () => {
    const seederPath = path.join(rootDir, 'scripts', 'seed-completo.mjs');
    const content = fs.readFileSync(seederPath, 'utf-8');

    assert.ok(
      content.includes('menusPorColegio'),
      'El seeder debe tener un diccionario menusPorColegio'
    );
    assert.ok(
      content.includes('Seco de pollo claretiano'),
      'Claretiano debe tener sus platos distintivos'
    );
    assert.ok(
      content.includes('Arroz chaufa especial de pollo'),
      'San Agustín debe tener sus platos distintivos'
    );
    assert.ok(
      content.includes('Palta rellena santarrosina') || content.includes('Pollo doradito con papas doradas'),
      'Santa Rosa debe tener sus platos distintivos'
    );
    assert.ok(
      content.includes('${colPrefijo}-${String(numeroAlmuerzoColegio).padStart(3, \'0\')}'),
      'El seeder debe generar códigos de pedido con ${colPrefijo}-${numeroAlmuerzo}'
    );
  });
});
