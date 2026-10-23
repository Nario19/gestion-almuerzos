import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Estructura de Tabla y Desglose de Fiados organizada igual que Despacho', () => {
  const rootDir = process.cwd();
  const fiadoPath = path.join(rootDir, 'src/app/admin/fiado/page.tsx');
  const fiadoContent = fs.readFileSync(fiadoPath, 'utf-8');

  test('1. Cabecera de la tabla principal de fiados cuenta con las 7 columnas requeridas', () => {
    assert.ok(fiadoContent.includes('>Almuerzos</TableHead>'), 'Debe incluir columna Almuerzos');
    assert.ok(fiadoContent.includes('>Grado y Estudiante</TableHead>'), 'Debe incluir columna Grado y Estudiante');
    assert.ok(fiadoContent.includes('>Nombre (Padre y Teléfono)</TableHead>'), 'Debe incluir columna Nombre (Padre y Teléfono)');
    assert.ok(fiadoContent.includes('>Estado de Entrega</TableHead>'), 'Debe incluir columna Estado de Entrega');
    assert.ok(fiadoContent.includes('>Fecha y Hora</TableHead>'), 'Debe incluir columna Fecha y Hora');
    assert.ok(fiadoContent.includes('>Deuda / Pago</TableHead>'), 'Debe incluir columna Deuda / Pago');
    assert.ok(fiadoContent.includes('>Acciones</TableHead>'), 'Debe incluir columna Acciones');
  });

  test('2. Fila general de familia muestra Estado de Entrega, Códigos y botón para ver platos en desglose', () => {
    assert.ok(fiadoContent.includes('Pendiente de entrega') || fiadoContent.includes('almuerzos entregados'), 'Debe indicar estado de entrega');
    assert.ok(fiadoContent.includes('codigoPedido'), 'Debe mostrar códigos de pedido');
    assert.ok(fiadoContent.includes('Ver platos en desglose'), 'Debe incluir enlace Ver platos en desglose');
  });

  test('3. Columna "Fecha y Hora" en la tabla principal está organizada idéntica a Despacho', () => {
    assert.ok(fiadoContent.includes('Calendar'), 'Debe usar icono Calendar');
    assert.ok(fiadoContent.includes('Clock'), 'Debe usar icono Clock');
    assert.ok(fiadoContent.includes('Consumo de HOY'), 'Debe incluir badge Consumo de HOY');
  });

  test('4. Desglose de Almuerzos cuenta con columna "Pedido" que integra Entrada, Segundo y Ensalada juntos con etiquetas y colores claros', () => {
    // En la tabla interna desplegable
    assert.ok(fiadoContent.includes('<th className="py-2.5 px-3">Pedido</th>'), 'Desglose debe tener encabezado Pedido');
    assert.ok(fiadoContent.includes('Entrada:'), 'Debe incluir etiqueta Entrada:');
    assert.ok(fiadoContent.includes('Segundo:'), 'Debe incluir etiqueta Segundo:');
    assert.ok(fiadoContent.includes('Ensalada:'), 'Debe incluir etiqueta Ensalada:');
    assert.ok(fiadoContent.includes('text-orange-700'), 'Debe usar clase text-orange-700 para Entrada');
    assert.ok(fiadoContent.includes('text-emerald-700'), 'Debe usar clase text-emerald-700 para Ensalada');
    assert.ok(!fiadoContent.includes('EntradaSopa o postre'), 'No debe concatenar Entrada con Sopa o postre');
    assert.ok(!fiadoContent.includes('<span className="sr-only">Sopa o postre</span>'), 'No debe tener Sopa o postre en la tabla desplegable');
  });

  test('5. Modal de reporte familiar desglosa Pedido con Entrada, Segundo y Ensalada', () => {
    assert.ok(fiadoContent.includes('<th className="py-2 px-3">Pedido</th>'), 'Modal debe incluir columna Pedido');
  });
});
