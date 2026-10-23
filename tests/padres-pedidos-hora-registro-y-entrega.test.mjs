import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Visualización de Hora de Pedido y Hora de Entrega en Pedidos de Padres', async (t) => {
  const pedidosPagePath = path.join(rootDir, 'src/app/padres/pedidos/page.tsx');
  const deudasPagePath = path.join(rootDir, 'src/app/padres/deudas/page.tsx');
  const dateUtilsPath = path.join(rootDir, 'src/lib/dateUtils.ts');

  const pedidosPageCode = fs.readFileSync(pedidosPagePath, 'utf8');
  const deudasPageCode = fs.readFileSync(deudasPagePath, 'utf8');
  const dateUtilsCode = fs.readFileSync(dateUtilsPath, 'utf8');

  await t.test('1. src/app/padres/pedidos/page.tsx importa formatearHoraPeru y Clock', () => {
    assert.match(
      pedidosPageCode,
      /formatearHoraPeru/,
      'Debe importar formatearHoraPeru de @/lib/dateUtils'
    );
    assert.match(
      pedidosPageCode,
      /Clock/,
      'Debe importar el icono Clock de lucide-react'
    );
  });

  await t.test('2. Encabezado de pedido del padre muestra la hora de realización al costado de la fecha', () => {
    // Debe tener el elemento con Calendar para la fecha y el elemento con Clock para la hora
    assert.match(
      pedidosPageCode,
      /<Calendar[^>]*\/>[\s\S]*?<span>\{formatearFechaCorta\(pedido\.fecha,\s*pedido\.diaSemana\)\}<\/span>/,
      'Debe renderizar la fecha del pedido'
    );
    assert.match(
      pedidosPageCode,
      /formatearHoraPedido\(pedido\.createdAt\)/,
      'Debe evaluar la hora de creación del pedido'
    );
    assert.match(
      pedidosPageCode,
      /<Clock[^>]*\/>[\s\S]*?<span>\{formatearHoraPedido\(pedido\.createdAt\)\}<\/span>/,
      'Debe renderizar el icono Clock y la hora formateada al costado de la fecha'
    );
  });

  await t.test('3. Línea de tiempo (stepper) muestra la hora en que se marcó como entregado en el paso Entregado', () => {
    // Debe verificar si es la etapa 3 (Entregado), entregado es true y pedido.horaEntrega existe
    assert.match(
      pedidosPageCode,
      /esEtapaEntregado\s*&&\s*entregado\s*&&\s*pedido\.horaEntrega/,
      'Debe comprobar que el paso es Entregado, está entregado y tiene horaEntrega'
    );
    assert.match(
      pedidosPageCode,
      /\{pedido\.horaEntrega\}/,
      'Debe mostrar pedido.horaEntrega en el stepper'
    );
  });

  await t.test('4. badgeEstadoPedido incluye hora de entrega cuando está entregado', () => {
    assert.match(
      pedidosPageCode,
      /badgeEstadoPedido\s*=\s*\(estado:\s*EstadoPedido,\s*horaEntrega\?: string\)/,
      'badgeEstadoPedido debe aceptar horaEntrega opcional'
    );
    assert.match(
      pedidosPageCode,
      /Entregado\{horaEntrega \? ` \(\$\{horaEntrega\}\)` : ''\}/,
      'badgeEstadoPedido debe concatenar la hora de entrega cuando esté disponible'
    );
  });

  await t.test('5. src/app/padres/deudas/page.tsx muestra la hora del pedido al costado de la fecha y hora de entrega', () => {
    assert.match(
      deudasPageCode,
      /formatearHoraPeru/,
      'Deudas debe importar formatearHoraPeru'
    );
    assert.match(
      deudasPageCode,
      /<Clock[^>]*\/>[\s\S]*?<span>\{formatearHoraPeru\(pedido\.createdAt\)/,
      'Deudas debe renderizar la hora al costado de la fecha'
    );
    assert.match(
      deudasPageCode,
      /Entregado\{pedido\.horaEntrega \? ` \(\$\{pedido\.horaEntrega\}\)` : ''\}/,
      'Deudas debe mostrar la hora de entrega en el badge de Entregado'
    );
  });

  await t.test('6. Verificación funcional de formatearHoraPeru con zona horaria de Perú (America/Lima)', async () => {
    const { formatearHoraPeru } = await import('../src/lib/dateUtils.ts');

    // 18:49:00 UTC = 13:49:00 en Perú (America/Lima, UTC-5) -> 01:49 p. m.
    const isoEjemplo = '2026-10-23T18:49:00.000Z';
    const horaFormateada = formatearHoraPeru(isoEjemplo);
    assert.equal(horaFormateada, '01:49 p. m.', 'Debe convertir 18:49 UTC a 01:49 p. m. en Perú');

    // Casos defensivos
    assert.equal(formatearHoraPeru(undefined), '', 'Debe retornar string vacío para undefined');
    assert.equal(formatearHoraPeru('invalido'), '', 'Debe retornar string vacío para fecha inválida');
  });
});
