import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

test('Verificación de Pedidos por Defecto en HOY y Cobranza WhatsApp en Fiado con Superadmin', async (t) => {
  await t.test('1. En /pedidos: fechaFiltro se inicializa por defecto en fechaHoy (Día actual de Perú)', () => {
    const pedidosPath = path.join(projectRoot, 'src/app/pedidos/page.tsx');
    const content = fs.readFileSync(pedidosPath, 'utf8');

    // Debe inicializar fechaFiltro con fechaHoy y no 'TODAS'
    assert.match(
      content,
      /const\s*\[fechaFiltro,\s*setFechaFiltro\]\s*=\s*useState<string>\(fechaHoy\);/,
      'El estado fechaFiltro debe inicializarse por defecto con fechaHoy'
    );

    // Debe calcular fechaHoy usando obtenerFechaHoyPeru
    assert.match(
      content,
      /const\s+fechaHoy\s*=\s*obtenerFechaHoyPeru\(\);/,
      'fechaHoy debe obtenerse de obtenerFechaHoyPeru()'
    );

    // Debe conservar el botón o chip de restablecer a "Todos"
    assert.match(
      content,
      /setFechaFiltro\('TODAS'\)/,
      'Debe permitir cambiar a TODAS para ver el historial completo'
    );
  });

  await t.test('2. En /fiado: Carga dinámica de métodos de pago configurados en Superadmin', () => {
    const fiadoPath = path.join(projectRoot, 'src/app/fiado/page.tsx');
    const content = fs.readFileSync(fiadoPath, 'utf8');

    // Debe importar CONFIG_PAGOS_DEFAULT y ConfiguracionPagos
    assert.match(
      content,
      /CONFIG_PAGOS_DEFAULT/,
      'Debe importar CONFIG_PAGOS_DEFAULT'
    );
    assert.match(
      content,
      /ConfiguracionPagos/,
      'Debe importar el tipo ConfiguracionPagos'
    );

    // Debe declarar el estado configPagos
    assert.match(
      content,
      /const\s*\[configPagos,\s*setConfigPagos\]\s*=\s*useState<ConfiguracionPagos>\(CONFIG_PAGOS_DEFAULT\);/,
      'Debe declarar el estado configPagos inicializado con CONFIG_PAGOS_DEFAULT'
    );

    // Cargar la configuración de pagos en cargarDatos y useEffect
    assert.match(
      content,
      /dataService\.obtenerConfiguracionPagos\(\)/,
      'Debe invocar dataService.obtenerConfiguracionPagos()'
    );
  });

  await t.test('3. En /fiado: enviarCobroWhatsApp estructura el mensaje con deuda, comprobante y medios de pago de Superadmin', () => {
    const fiadoPath = path.join(projectRoot, 'src/app/fiado/page.tsx');
    const content = fs.readFileSync(fiadoPath, 'utf8');

    // Mensaje de WhatsApp debe contener la frase exacta de la deuda
    assert.match(
      content,
      /la deuda que tiene es de S\//,
      'El mensaje debe incluir textualmente "la deuda que tiene es de S/"'
    );

    // Mensaje de WhatsApp debe contener la mención del comprobante
    assert.match(
      content,
      /Adjunto el comprobante y detalle de consumos/,
      'El mensaje debe incluir textualmente "Adjunto el comprobante y detalle de consumos"'
    );

    // Debe incluir Yape y Plin dinámicos de Superadmin
    assert.match(
      content,
      /• \*Yape:\* \$\{config\.numeroYape\} \(\$\{config\.titularYape\}\)/,
      'El mensaje debe incorporar el número y titular de Yape de Superadmin'
    );
    assert.match(
      content,
      /• \*Plin:\* \$\{config\.numeroPlin\} \(\$\{config\.titularPlin\}\)/,
      'El mensaje debe incorporar el número y titular de Plin de Superadmin'
    );

    // Ya NO debe contener números de pago quemados fijos como 999-999-999 en el mensaje de cobro
    assert.doesNotMatch(
      content,
      /• \*Yape \/ Plin:\* 999-999-999/,
      'No debe tener datos de Yape/Plin quemados en el mensaje de cobro'
    );

    // Debe generar el comprobante digital descargable
    assert.match(
      content,
      /descargarComprobantePadre\(padre,\s*config\)/,
      'Debe generar la descarga del comprobante digital para el padre'
    );
  });

  await t.test('4. En /fiado: El botón de impresión permite Imprimir / Guardar PDF', () => {
    const fiadoPath = path.join(projectRoot, 'src/app/fiado/page.tsx');
    const content = fs.readFileSync(fiadoPath, 'utf8');

    // Botón de imprimir / guardar PDF
    assert.match(
      content,
      /<span>Imprimir \/ Guardar PDF<\/span>/,
      'El modal de reporte debe ofrecer la opción explícita "Imprimir / Guardar PDF"'
    );
  });
});
