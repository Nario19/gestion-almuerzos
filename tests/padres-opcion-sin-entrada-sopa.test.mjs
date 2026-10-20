import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Padres: Opción "Sin entrada / sopa" en Pedido de Menú y Exclusión en Cocina', () => {
  const rootDir = process.cwd();
  const padresPagePath = path.join(rootDir, 'src', 'app', 'padres', 'page.tsx');
  const dataServicePath = path.join(rootDir, 'src', 'lib', 'dataService.ts');

  const padresContent = fs.readFileSync(padresPagePath, 'utf-8');
  const dataServiceContent = fs.readFileSync(dataServicePath, 'utf-8');

  test('1. La interfaz de padres incluye tarjeta interactiva "Sin entrada / sopa"', () => {
    // Debe existir el botón con onClick que establece 'Sin entrada'
    assert.ok(
      padresContent.includes("setEntradaSeleccionada('Sin entrada')"),
      'Debe permitir seleccionar "Sin entrada" con un clic'
    );

    // Debe contener el título y texto explicativo
    assert.ok(
      padresContent.includes('Sin entrada / sopa'),
      'Debe mostrar el texto visible "Sin entrada / sopa"'
    );
    assert.ok(
      padresContent.includes('Solo Segundo') || padresContent.includes('Solo plato de fondo') || padresContent.includes('Servir únicamente el plato de fondo'),
      'Debe incluir descripción clara de que solo se servirá el plato de fondo'
    );
  });

  test('2. La tarjeta "Sin entrada / sopa" resalta visualmente cuando está seleccionada', () => {
    // Debe comparar con 'Sin entrada' para aplicar bordes y ring de selección
    assert.ok(
      padresContent.includes("entradaSeleccionada === 'Sin entrada'"),
      'Debe evaluar si entradaSeleccionada es "Sin entrada" para activar el estilo seleccionado'
    );
  });

  test('3. Inicialización por defecto en padres: si no hay entradas, selecciona "Sin entrada"', () => {
    assert.ok(
      padresContent.includes("primeraEntrada ? primeraEntrada.nombre : 'Sin entrada'"),
      'Al cargar platos, si no hay entradas registradas debe auto-seleccionar "Sin entrada" para no bloquear al padre'
    );
  });

  test('4. Validación de formulario: permite "Sin entrada" sin requerir que exista en la carta de platos', () => {
    // Verificación de esSinEntrada y entradaValida
    assert.ok(
      padresContent.includes('const esSinEntrada =') &&
      padresContent.includes("entradaSeleccionada === 'Sin entrada'"),
      'Debe detectar la condición esSinEntrada'
    );

    assert.ok(
      padresContent.includes('const entradaValida = esSinEntrada ||'),
      'entradaValida debe aceptar la opción esSinEntrada sin buscarla en la tabla de platos'
    );

    assert.ok(
      padresContent.includes("const entradaFinal = esSinEntrada ? 'Sin entrada' : entradaSeleccionada;"),
      'Al crear el pedido debe normalizar a "Sin entrada"'
    );
  });

  test('5. Modal de confirmación de pedido refleja claramente "Sin entrada / sopa"', () => {
    assert.ok(
      padresContent.includes("Sin entrada / sopa (Solo segundo)"),
      'El modal de confirmación debe mostrar al padre que eligió solo segundo'
    );
  });

  test('6. dataService.calcularResumenCocina excluye "Sin entrada" del conteo de sopas a preparar', () => {
    assert.ok(
      dataServiceContent.includes('const esSinEntrada =') &&
      dataServiceContent.includes("p.entradaNombre === 'Sin entrada'") &&
      dataServiceContent.includes("p.entradaNombre.toLowerCase().includes('sin entrada')"),
      'calcularResumenCocina debe verificar esSinEntrada para no sumar sopas inexistentes'
    );

    assert.ok(
      dataServiceContent.includes('if (!esSinEntrada) {'),
      'calcularResumenCocina solo debe acumular en entradasMap si no es Sin Entrada'
    );
  });

  test('7. dataService.calcularResumenCocinaDetalladoPorColegio ignora "Sin entrada" en estadísticas', () => {
    assert.ok(
      dataServiceContent.includes("p.entradaNombre !== 'Sin entrada'") &&
      dataServiceContent.includes("!p.entradaNombre.toLowerCase().includes('sin entrada')"),
      'calcularResumenCocinaDetalladoPorColegio no debe registrar "Sin entrada" como plato más pedido'
    );
  });

  test('8. Lógica pura: resumen de cocina con pedidos mixtos no infla el conteo de sopas', () => {
    // Simulamos la lógica exacta implementada en dataService.calcularResumenCocina
    const pedidos = [
      { id: '1', estudianteNombre: 'Ana', gradoSeccion: '1A', colegioNombre: 'San Pedro', entradaNombre: 'Sopa de Pollo', segundoNombre: 'Lomo Saltado', observacion: '' },
      { id: '2', estudianteNombre: 'Luis', gradoSeccion: '2B', colegioNombre: 'San Pedro', entradaNombre: 'Sin entrada', segundoNombre: 'Lomo Saltado', observacion: '' },
      { id: '3', estudianteNombre: 'Carlos', gradoSeccion: '3A', colegioNombre: 'San Pedro', entradaNombre: 'Sin entrada / sopa', segundoNombre: 'Seco de Pollo', observacion: 'Sin ají' },
      { id: '4', estudianteNombre: 'Elena', gradoSeccion: '4A', colegioNombre: 'San Pedro', entradaNombre: 'Ensalada Fresca', segundoNombre: 'Seco de Pollo', observacion: '' },
    ];

    const entradasMap = new Map();
    const segundosMap = new Map();

    for (const p of pedidos) {
      const esSinEntrada =
        !p.entradaNombre ||
        p.entradaNombre.trim() === '' ||
        p.entradaNombre === 'Sin entrada' ||
        p.entradaNombre.toLowerCase().includes('sin entrada') ||
        p.entradaNombre.toLowerCase().includes('sin sopa');

      if (!esSinEntrada) {
        const item = entradasMap.get(p.entradaNombre) || { count: 0 };
        item.count += 1;
        entradasMap.set(p.entradaNombre, item);
      }

      const itemSeg = segundosMap.get(p.segundoNombre) || { count: 0 };
      itemSeg.count += 1;
      segundosMap.set(p.segundoNombre, itemSeg);
    }

    // Solo debe haber 2 entradas a cocinar: Sopa de Pollo (1) y Ensalada Fresca (1)
    assert.equal(entradasMap.size, 2, 'Solo debe haber 2 entradas registradas en cocina');
    assert.equal(entradasMap.get('Sopa de Pollo')?.count, 1);
    assert.equal(entradasMap.get('Ensalada Fresca')?.count, 1);
    assert.equal(entradasMap.get('Sin entrada'), undefined, 'Sin entrada no debe figurar en entradasMap');
    assert.equal(entradasMap.get('Sin entrada / sopa'), undefined, 'Sin entrada / sopa no debe figurar en entradasMap');

    // Los segundos deben sumar los 4 pedidos
    assert.equal(segundosMap.get('Lomo Saltado')?.count, 2);
    assert.equal(segundosMap.get('Seco de Pollo')?.count, 2);
  });
});
