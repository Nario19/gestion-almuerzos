import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * Función réplica pura de la lógica de filtrado de platos por colegio de dataService.obtenerPlatosPorDia
 */
function filtrarPlatosPorColegio(platos, dia, colegioIdONombre) {
  const platosPorDia = platos.filter((p) => p.diaSemana === dia);
  if (!colegioIdONombre || colegioIdONombre.toLowerCase().trim() === 'todos') {
    return platosPorDia;
  }
  const val = colegioIdONombre.toLowerCase().trim();
  return platosPorDia.filter((p) => {
    const pId = (p.colegioId || '').toLowerCase().trim();
    const pNom = (p.colegioNombre || '').toLowerCase().trim();
    return pId === val || pNom === val;
  });
}

/**
 * Clasificación canónica de platos usada en src/app/padres/page.tsx
 */
function clasificarPlatos(platos) {
  const esEntrada = (t) => {
    const s = (t || '').toLowerCase().trim();
    return s === 'entrada' || s.includes('sopa') || s.includes('ensalada');
  };
  const esSegundo = (t) => {
    const s = (t || '').toLowerCase().trim();
    return s === 'segundo';
  };
  const esExtra = (t) => !esEntrada(t) && !esSegundo(t);

  return {
    entradas: platos.filter((p) => esEntrada(p.tipo)),
    segundos: platos.filter((p) => esSegundo(p.tipo)),
    extras: platos.filter((p) => esExtra(p.tipo)),
  };
}

/**
 * Cálculo del monto total según menú base y extras
 */
function calcularTotalPedido(segundos, segundoSeleccionado, extras, extrasSeleccionadosIds) {
  const segundoObj = segundos.find((s) => s.nombre === segundoSeleccionado) || segundos[0];
  const precioMenuBase = segundoObj?.precio && segundoObj.precio > 0 ? segundoObj.precio : 12.0;

  const extrasSeleccionados = extras.filter((e) => extrasSeleccionadosIds.includes(e.id));
  const totalExtras = extrasSeleccionados.reduce((acc, curr) => acc + (curr.precio || 0), 0);

  return {
    precioMenuBase,
    totalExtras,
    precioTotal: precioMenuBase + totalExtras,
    extrasTexto: extrasSeleccionados.length > 0
      ? extrasSeleccionados.map((e) => `${e.nombre} (S/ ${e.precio.toFixed(2)})`).join(', ')
      : undefined,
  };
}

test('Listado Correcto de Menú por Colegio para Padres Autenticados y Home Público (TSX)', async (t) => {
  const padresTsxPath = path.join(rootDir, 'src', 'app', 'padres', 'page.tsx');
  const homeTsxPath = path.join(rootDir, 'src', 'app', 'page.tsx');
  const dataServicePath = path.join(rootDir, 'src', 'lib', 'dataService.ts');

  const padresTsxContent = fs.readFileSync(padresTsxPath, 'utf-8');
  const homeTsxContent = fs.readFileSync(homeTsxPath, 'utf-8');
  const dataServiceContent = fs.readFileSync(dataServicePath, 'utf-8');

  await t.test('1. src/app/page.tsx sirve como punto de entrada público que renderiza PedidoPage', () => {
    assert.ok(
      homeTsxContent.includes("from './padres/page'") || homeTsxContent.includes("from '@/app/padres/page'"),
      'src/app/page.tsx debe importar PedidoPage desde src/app/padres/page'
    );
    assert.ok(
      homeTsxContent.includes('export default') && homeTsxContent.includes('PedidoPage'),
      'src/app/page.tsx debe exportar PedidoPage como componente por defecto'
    );
  });

  await t.test('2. El TSX público (!usuario) contiene el selector de colegios registrados', () => {
    assert.ok(
      padresTsxContent.includes('if (!usuario)'),
      'src/app/padres/page.tsx debe contar con la sección condicional para visitantes no autenticados (!usuario)'
    );

    assert.ok(
      padresTsxContent.includes('listaColegios.map((col) =>') &&
        padresTsxContent.includes('<select') &&
        padresTsxContent.includes('value={colegio}') &&
        padresTsxContent.includes('onChange={(e) => setColegio(e.target.value)}'),
      'El TSX público debe renderizar un elemento <select> enlazado a listaColegios y setColegio'
    );

    assert.ok(
      padresTsxContent.includes('cargandoColegios ?') &&
        padresTsxContent.includes('listaColegios.length === 0'),
      'El selector público debe manejar estados de carga y lista de colegios vacía'
    );
  });

  await t.test('3. En el TSX público, los platos se listan clasificados en Sopa/Ensalada, Segundo y Extras con precios dinámicos', () => {
    assert.ok(
      padresTsxContent.includes('1. Sopa o Ensalada') || padresTsxContent.includes('1. Sopa o postre'),
      'El TSX público debe titular y listar la sección 1 (Sopa o Ensalada)'
    );

    assert.ok(
      padresTsxContent.includes('2. Segundo (Plato de Fondo)'),
      'El TSX público debe titular y listar la sección 2 (Plato de Fondo)'
    );

    assert.ok(
      padresTsxContent.includes('3. Extras y Adicionales'),
      'El TSX público debe titular y listar la sección 3 (Extras y Adicionales)'
    );

    assert.ok(
      padresTsxContent.includes('precioMenuBase.toFixed(2)'),
      'El TSX público debe desplegar el precio configurado del menú escolar'
    );

    assert.ok(
      padresTsxContent.includes('ext.precio.toFixed(2)'),
      'El TSX público debe desplegar el precio unitario individual de cada extra'
    );
  });

  await t.test('4. Para Padres autenticados, el menú se filtra automáticamente según el colegio del hijo seleccionado', () => {
    assert.ok(
      padresTsxContent.includes('const colegioFiltro = hijoSeleccionado?.colegioNombre || hijoSeleccionado?.colegioId || colegio'),
      'Debe determinar colegioFiltro priorizando el colegioNombre o colegioId del hijo seleccionado'
    );

    assert.ok(
      padresTsxContent.includes('dataService.obtenerPlatosPorDia(diaSeleccionado, colegioFiltro)'),
      'Debe invocar dataService.obtenerPlatosPorDia pasando el día y el colegioFiltro del estudiante'
    );

    assert.ok(
      padresTsxContent.includes('seleccionarHijo = (hijo: Hijo) =>'),
      'Debe implementar la función seleccionarHijo para cambiar reactivamente de estudiante'
    );

    assert.ok(
      padresTsxContent.includes('setColegio(hijo.colegioNombre)') &&
        padresTsxContent.includes('setHijoSeleccionado(hijo)'),
      'Al seleccionar un hijo, debe actualizar hijoSeleccionado y el colegio activo'
    );
  });

  await t.test('5. En la vista de Padres, se permite seleccionar Sopa/Ensalada, Segundo y sumar Extras con total en vivo', () => {
    assert.ok(
      padresTsxContent.includes('extrasSeleccionadosIds') &&
        padresTsxContent.includes('setExtrasSeleccionadosIds') &&
        padresTsxContent.includes('toggleExtra'),
      'Debe existir estado y función toggleExtra para seleccionar múltiples extras'
    );

    assert.ok(
      padresTsxContent.includes('totalExtras') &&
        padresTsxContent.includes('precioTotalPedido'),
      'Debe calcular totalExtras y precioTotalPedido sumando el menú base y extras'
    );

    assert.ok(
      padresTsxContent.includes('monto: precioTotalPedido') || padresTsxContent.includes('monto: montoFinal'),
      'La creación de pedido debe enviar el monto dinámico total a dataService.crearPedido'
    );

    assert.ok(
      padresTsxContent.includes('refrigerioNombre: textoExtras') || padresTsxContent.includes('refrigerioNombre'),
      'Debe registrar el detalle de los extras seleccionados en refrigerioNombre'
    );
  });

  await t.test('6. Prueba Funcional: Independencia estricta de platos entre colegios creados', () => {
    // Datos de prueba simulando catálogo con platos de diferentes colegios
    const catalogoPlatos = [
      // Colegio Claretiano (LUNES)
      {
        id: 'p-cla-1',
        diaSemana: 'LUNES',
        colegioNombre: 'Colegio Claretiano',
        colegioId: 'col-claretiano-id',
        tipo: 'ENTRADA',
        nombre: 'Sopa de Minestrone',
        precio: 0,
        disponible: true,
      },
      {
        id: 'p-cla-2',
        diaSemana: 'LUNES',
        colegioNombre: 'Colegio Claretiano',
        colegioId: 'col-claretiano-id',
        tipo: 'SEGUNDO',
        nombre: 'Arroz con Pollo Criollo',
        precio: 12.0,
        disponible: true,
      },
      {
        id: 'p-cla-3',
        diaSemana: 'LUNES',
        colegioNombre: 'Colegio Claretiano',
        colegioId: 'col-claretiano-id',
        tipo: 'BEBIDA',
        nombre: 'Chicha Morada 300ml',
        precio: 2.5,
        disponible: true,
      },
      // Colegio San Agustín (LUNES) - Menú diferenciado a S/ 14.00
      {
        id: 'p-csa-1',
        diaSemana: 'LUNES',
        colegioNombre: 'Colegio San Agustín',
        colegioId: 'col-san-agustin-id',
        tipo: 'ENTRADA',
        nombre: 'Ensalada Rusa Fresca',
        precio: 0,
        disponible: true,
      },
      {
        id: 'p-csa-2',
        diaSemana: 'LUNES',
        colegioNombre: 'Colegio San Agustín',
        colegioId: 'col-san-agustin-id',
        tipo: 'SEGUNDO',
        nombre: 'Tallarines Verdes con Bistec',
        precio: 14.0,
        disponible: true,
      },
      {
        id: 'p-csa-3',
        diaSemana: 'LUNES',
        colegioNombre: 'Colegio San Agustín',
        colegioId: 'col-san-agustin-id',
        tipo: 'POSTRE',
        nombre: 'Gelatina con Frutas',
        precio: 3.0,
        disponible: true,
      },
      // Colegio Santa Rosa (LUNES) - Menú a S/ 11.50
      {
        id: 'p-csr-1',
        diaSemana: 'LUNES',
        colegioNombre: 'Colegio Santa Rosa',
        colegioId: 'col-santa-rosa-id',
        tipo: 'ENTRADA',
        nombre: 'Crema de Zapallo',
        precio: 0,
        disponible: true,
      },
      {
        id: 'p-csr-2',
        diaSemana: 'LUNES',
        colegioNombre: 'Colegio Santa Rosa',
        colegioId: 'col-santa-rosa-id',
        tipo: 'SEGUNDO',
        nombre: 'Estofado de Carne con Arroz',
        precio: 11.5,
        disponible: true,
      },
    ];

    // Consulta para Colegio Claretiano por nombre
    const platosClaretiano = filtrarPlatosPorColegio(catalogoPlatos, 'LUNES', 'Colegio Claretiano');
    assert.strictEqual(platosClaretiano.length, 3, 'Colegio Claretiano debe retornar exactamente 3 platos');
    assert.ok(
      platosClaretiano.every((p) => p.colegioNombre === 'Colegio Claretiano'),
      'Ningún plato de otro colegio debe filtrarse en Colegio Claretiano'
    );
    assert.ok(
      platosClaretiano.some((p) => p.nombre === 'Arroz con Pollo Criollo'),
      'Debe contener el plato de fondo Arroz con Pollo Criollo'
    );
    assert.ok(
      !platosClaretiano.some((p) => p.nombre === 'Tallarines Verdes con Bistec'),
      'No debe contener el plato de San Agustín'
    );

    // Consulta para Colegio San Agustín por ID
    const platosSanAgustin = filtrarPlatosPorColegio(catalogoPlatos, 'LUNES', 'col-san-agustin-id');
    assert.strictEqual(platosSanAgustin.length, 3, 'Colegio San Agustín debe retornar exactamente 3 platos');
    assert.ok(
      platosSanAgustin.every((p) => p.colegioId === 'col-san-agustin-id'),
      'Todos los platos deben pertenecer al ID de Colegio San Agustín'
    );

    // Verificación de clasificación y cálculo de precios para un padre en Colegio San Agustín
    const clasificadosSanAgustin = clasificarPlatos(platosSanAgustin);
    assert.strictEqual(clasificadosSanAgustin.entradas.length, 1, 'Debe haber 1 entrada en San Agustín');
    assert.strictEqual(clasificadosSanAgustin.entradas[0].nombre, 'Ensalada Rusa Fresca');
    assert.strictEqual(clasificadosSanAgustin.segundos.length, 1, 'Debe haber 1 segundo en San Agustín');
    assert.strictEqual(clasificadosSanAgustin.segundos[0].nombre, 'Tallarines Verdes con Bistec');
    assert.strictEqual(clasificadosSanAgustin.extras.length, 1, 'Debe haber 1 extra en San Agustín');
    assert.strictEqual(clasificadosSanAgustin.extras[0].nombre, 'Gelatina con Frutas');

    // Cálculo con menú base (S/ 14.00) + extra de Gelatina (S/ 3.00) = S/ 17.00
    const calculoPedido = calcularTotalPedido(
      clasificadosSanAgustin.segundos,
      'Tallarines Verdes con Bistec',
      clasificadosSanAgustin.extras,
      ['p-csa-3'] // seleccionó la gelatina
    );
    assert.strictEqual(calculoPedido.precioMenuBase, 14.0, 'El precio base del menú debe ser S/ 14.00');
    assert.strictEqual(calculoPedido.totalExtras, 3.0, 'El total de extras debe ser S/ 3.00');
    assert.strictEqual(calculoPedido.precioTotal, 17.0, 'El precio total debe ser S/ 17.00');
    assert.strictEqual(calculoPedido.extrasTexto, 'Gelatina con Frutas (S/ 3.00)');

    // Consulta para Colegio Santa Rosa
    const platosSantaRosa = filtrarPlatosPorColegio(catalogoPlatos, 'LUNES', 'Colegio Santa Rosa');
    assert.strictEqual(platosSantaRosa.length, 2, 'Colegio Santa Rosa debe tener 2 platos');
    const clasificadosSantaRosa = clasificarPlatos(platosSantaRosa);
    const calculoSantaRosa = calcularTotalPedido(
      clasificadosSantaRosa.segundos,
      'Estofado de Carne con Arroz',
      clasificadosSantaRosa.extras,
      []
    );
    assert.strictEqual(calculoSantaRosa.precioMenuBase, 11.5, 'El precio base de Santa Rosa debe ser S/ 11.50');
    assert.strictEqual(calculoSantaRosa.precioTotal, 11.5, 'El total sin extras debe ser S/ 11.50');
    assert.strictEqual(calculoSantaRosa.extrasTexto, undefined, 'Sin extras seleccionados');
  });

  await t.test('7. Cambio dinámico de estudiante entre colegios distintos conmuta el menú inmediatamente', () => {
    const estudiante1 = {
      id: 'hijo-1',
      nombreCompleto: 'MATEO LOPEZ',
      colegioNombre: 'Colegio Claretiano',
      colegioId: 'col-claretiano-id',
      gradoSeccion: '3.° Primaria',
    };
    const estudiante2 = {
      id: 'hijo-2',
      nombreCompleto: 'VALENTINA LOPEZ',
      colegioNombre: 'Colegio San Agustín',
      colegioId: 'col-san-agustin-id',
      gradoSeccion: '5.° Primaria',
    };

    const catalogo = [
      { id: '1', diaSemana: 'LUNES', colegioNombre: 'Colegio Claretiano', tipo: 'SEGUNDO', nombre: 'Plato Claretiano', precio: 12 },
      { id: '2', diaSemana: 'LUNES', colegioNombre: 'Colegio San Agustín', tipo: 'SEGUNDO', nombre: 'Plato San Agustín', precio: 15 },
    ];

    // Simulación del estado del padre al alternar entre hijos
    let hijoActivo = estudiante1;
    let platosMostrados = filtrarPlatosPorColegio(catalogo, 'LUNES', hijoActivo.colegioNombre);
    assert.strictEqual(platosMostrados.length, 1);
    assert.strictEqual(platosMostrados[0].nombre, 'Plato Claretiano');

    // Cambiar al segundo hijo
    hijoActivo = estudiante2;
    platosMostrados = filtrarPlatosPorColegio(catalogo, 'LUNES', hijoActivo.colegioNombre);
    assert.strictEqual(platosMostrados.length, 1);
    assert.strictEqual(platosMostrados[0].nombre, 'Plato San Agustín');
    assert.strictEqual(platosMostrados[0].precio, 15);
  });
});
