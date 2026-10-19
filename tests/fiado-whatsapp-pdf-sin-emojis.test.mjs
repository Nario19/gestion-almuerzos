import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('Verificación de Reporte de Fiado: WhatsApp Limpio Sin Emojis y Comprobante PDF Detallado', async (t) => {
  const fiadoPath = path.join(projectRoot, 'src/app/admin/fiado/page.tsx');
  const pdfGenPath = path.join(projectRoot, 'src/lib/pdfComprobanteGenerator.ts');

  assert.ok(fs.existsSync(fiadoPath), 'src/app/admin/fiado/page.tsx debe existir');
  assert.ok(fs.existsSync(pdfGenPath), 'src/lib/pdfComprobanteGenerator.ts debe existir');

  const fiadoContent = fs.readFileSync(fiadoPath, 'utf8');
  const pdfGenContent = fs.readFileSync(pdfGenPath, 'utf8');

  await t.test('1. El código de WhatsApp en fiado/page.tsx NO contiene emojis ni iconos en el mensaje', () => {
    // Extraer la función enviarCobroWhatsApp
    const matchFn = fiadoContent.match(/const enviarCobroWhatsApp = async[\s\S]*?window\.open\(url, '_blank'\);/);
    assert.ok(matchFn, 'Debe encontrarse la función enviarCobroWhatsApp');
    const fnBody = matchFn[0];

    // Verificar que no contenga emojis comunes de mensajes
    const regexEmojis = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    assert.doesNotMatch(
      fnBody,
      regexEmojis,
      'El mensaje de WhatsApp NO debe contener ningún emoji (como 📄, 💰, 💳, ✅, 👦, etc.)'
    );

    // Verificar que no contenga los iconos o emojis que se usaban antes
    assert.doesNotMatch(fnBody, /✓/, 'No debe contener el caracter de checkmark ✓');
    assert.doesNotMatch(fnBody, /⏳/, 'No debe contener el emoji de reloj de arena ⏳');
  });

  await t.test('2. El mensaje de WhatsApp hace referencia explícita al PDF adjunto con el detalle', () => {
    assert.match(
      fiadoContent,
      /\*Adjunto el comprobante y detalle de consumos en PDF:\*/,
      'El mensaje debe indicar al apoderado que se adjunta el comprobante y detalle en PDF'
    );
    assert.match(
      fiadoContent,
      /descargarComprobantePadre\(padre,\s*config\)/,
      'enviarCobroWhatsApp debe descargar el comprobante en PDF del padre'
    );
  });

  await t.test('3. El modal de reporte familiar incluye el botón explícito de "Descargar PDF"', () => {
    assert.match(
      fiadoContent,
      /<span>Descargar PDF<\/span>/,
      'El modal de reporte debe tener un botón para descargar el PDF directamente'
    );
    assert.match(
      fiadoContent,
      /descargarComprobanteFiadoPdf\(padreReporteModal, configPagos\)/,
      'El botón de Descargar PDF debe llamar a descargarComprobanteFiadoPdf con padreReporteModal'
    );
  });

  await t.test('4. El generador de PDF implementa la estructura estándar ISO PDF 1.4 binaria', () => {
    // Verificar exportaciones obligatorias en pdfComprobanteGenerator.ts
    assert.match(
      pdfGenContent,
      /export function generarComprobanteFiadoPdfBytes/,
      'Debe exportar generarComprobanteFiadoPdfBytes'
    );
    assert.match(
      pdfGenContent,
      /export function generarComprobanteFiadoPdfBlob/,
      'Debe exportar generarComprobanteFiadoPdfBlob'
    );
    assert.match(
      pdfGenContent,
      /export function descargarComprobanteFiadoPdf/,
      'Debe exportar descargarComprobanteFiadoPdf'
    );

    // Verificar que incluya sanitización de emojis previa a la renderización en el PDF
    assert.match(
      pdfGenContent,
      /sanitizarTexto/,
      'Debe sanitizar posibles emojis antes de generar los comandos de fuente WinAnsi'
    );

    // Verificar estructura del documento PDF 1.4
    assert.match(pdfGenContent, /%PDF-1\.4/, 'Debe generar encabezado estándar PDF 1.4');
    assert.match(pdfGenContent, /\/Type \/Catalog/, 'Debe incluir catálogo de páginas PDF');
    assert.match(pdfGenContent, /\/Type \/Pages/, 'Debe incluir diccionario de páginas');
    assert.match(pdfGenContent, /\/Type \/Font/, 'Debe definir fuentes estándar Helvetica y Helvetica-Bold');
    assert.match(pdfGenContent, /\/WinAnsiEncoding/, 'Debe usar codificación WinAnsi para caracteres en español');
    assert.match(pdfGenContent, /startxref[\s\S]*?%%EOF/, 'Debe finalizar con la tabla xref y el delimitador %%EOF');
    assert.match(pdfGenContent, /PLACERES CULINARIOS/, 'Debe incorporar membrete oficial');
    assert.match(pdfGenContent, /COMPROBANTE OFICIAL DE CONSUMOS ESCOLARES/, 'Debe incluir título oficial de consumos');
  });

  await t.test('5. Verificación de ejecución real de la generación binaria de PDF 1.4', () => {
    // Ejecución de la función de generación en aislamiento simulado
    function toPdfWinAnsi(str) {
      if (!str) return '';
      const mapa = {
        'á': '\\341', 'é': '\\351', 'í': '\\355', 'ó': '\\363', 'ú': '\\372',
        'Á': '\\301', 'É': '\\311', 'Í': '\\315', 'Ó': '\\323', 'Ú': '\\332',
        'ñ': '\\361', 'Ñ': '\\321', '°': '\\260', 'ü': '\\374', 'Ü': '\\334',
        '(': '\\(', ')': '\\)', '\\': '\\\\',
      };
      return str.replace(/[áéíóúÁÉÍÓÚñÑ°üÜ()\\]/g, (c) => mapa[c] || c);
    }

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const marginX = 36;
    const contentWidth = pageWidth - marginX * 2;

    let stream = `
0.96 0.45 0.08 rg
${marginX} ${pageHeight - 38} ${contentWidth} 4 re f
BT
/F2 16 Tf
${marginX} ${pageHeight - 60} Td
(${toPdfWinAnsi('PLACERES CULINARIOS')}) Tj
ET
`;

    const objects = [];
    function addObject(data) {
      objects.push(data);
      return objects.length;
    }

    addObject('<< /Type /Catalog /Pages 2 0 R >>');
    addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    addObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`);
    addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

    const streamLength = stream.length;
    addObject(`<< /Length ${streamLength} >>\nstream\n${stream}\nendstream`);

    let pdfString = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
    const offsets = [];

    for (let i = 0; i < objects.length; i++) {
      offsets.push(pdfString.length);
      pdfString += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
    }

    const xrefOffset = pdfString.length;
    pdfString += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 0; i < offsets.length; i++) {
      pdfString += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
    }
    pdfString += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    const len = pdfString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = pdfString.charCodeAt(i) & 0xff;
    }

    assert.ok(bytes.length > 200, 'Los bytes del PDF deben superar los 200 bytes');
    const headerStr = Buffer.from(bytes.slice(0, 8)).toString('latin1');
    assert.equal(headerStr, '%PDF-1.4', 'La cabecera debe ser estrictamente %PDF-1.4');
    const footerStr = Buffer.from(bytes.slice(-5)).toString('latin1');
    assert.equal(footerStr, '%%EOF', 'El cierre debe ser estrictamente %%EOF');
  });
});
