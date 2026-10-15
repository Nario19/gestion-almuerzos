import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Columna de Pago en Despacho: Colores de Métodos de Pago y Botón Simplificado', async (t) => {
  const despachoPath = path.join(rootDir, 'src', 'app', 'despacho', 'page.tsx');
  const despachoContent = fs.readFileSync(despachoPath, 'utf-8');

  await t.test('1. Yape aparece con color morado (bg-purple-600)', () => {
    assert.ok(
      despachoContent.includes("p.metodoPago === 'Yape'") &&
        despachoContent.includes('bg-purple-600') &&
        despachoContent.includes('text-white'),
      'La insignia de Yape debe tener color morado (bg-purple-600 text-white)'
    );
  });

  await t.test('2. Plin aparece con color celeste (bg-sky-500)', () => {
    assert.ok(
      despachoContent.includes("p.metodoPago === 'Plin'") &&
        despachoContent.includes('bg-sky-500') &&
        despachoContent.includes('text-white'),
      'La insignia de Plin debe tener color celeste (bg-sky-500 text-white)'
    );
  });

  await t.test('3. Pagar luego aparece con color amarillo (bg-yellow-400)', () => {
    assert.ok(
      despachoContent.includes("p.metodoPago === 'Pagar luego'") &&
        despachoContent.includes('bg-yellow-400') &&
        despachoContent.includes('text-slate-950'),
      'La insignia de Pagar luego debe tener color amarillo (bg-yellow-400 text-slate-950)'
    );
  });

  await t.test('4. El botón de pago sólo dice "Aceptar pago" para todos los pedidos pendientes', () => {
    // Comprobar que el botón renderiza exactamente "Aceptar pago"
    assert.ok(
      despachoContent.includes('<span>Aceptar pago</span>'),
      'El botón debe decir exactamente "Aceptar pago"'
    );

    // Asegurar que no contenga sufijos entre paréntesis redundantes en el botón
    assert.ok(
      !despachoContent.includes('Aceptar Pago'),
      'El botón de pago no debe incluir "Aceptar Pago" con mayúsculas ni sufijos'
    );
  });

  await t.test('5. El estado confirmado sólo dice "Pago aceptado" sin sufijos ni paréntesis', () => {
    assert.ok(
      despachoContent.includes('<span>Pago aceptado</span>'),
      'Al estar pagado debe indicar limpiamente "Pago aceptado"'
    );
    assert.ok(
      !despachoContent.includes('Pago Aceptado ({p.metodoPago'),
      'No debe tener sufijos en el estado pagado'
    );
    assert.ok(
      !despachoContent.includes('Pago Confirmado ({p.metodoPago'),
      'No debe tener sufijos de método en el estado confirmado'
    );
  });

  await t.test('6. No existen etiquetas redundantes como "Pendiente en Fiado" en la columna de pago', () => {
    assert.ok(
      !despachoContent.includes('Pendiente en Fiado'),
      'Se removió la etiqueta extra de "Pendiente en Fiado" para mantener la columna limpia y uniforme'
    );
  });
});
