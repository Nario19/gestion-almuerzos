import type { PadreFiadoResumen, ConfiguracionPagos } from '../types';
import { formatearFechaEmisionPeru, obtenerFechaHoyPeru } from './dateUtils';

function sanitizarTexto(str: string): string {
  if (!str) return '';
  return str.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
}

function toPdfWinAnsi(str: string): string {
  if (!str) return '';
  const limpia = sanitizarTexto(str);
  const mapa: Record<string, string> = {
    'á': '\\341', 'é': '\\351', 'í': '\\355', 'ó': '\\363', 'ú': '\\372',
    'Á': '\\301', 'É': '\\311', 'Í': '\\315', 'Ó': '\\323', 'Ú': '\\332',
    'ñ': '\\361', 'Ñ': '\\321', '°': '\\260', 'ü': '\\374', 'Ü': '\\334',
    '(': '\\(', ')': '\\)', '\\': '\\\\',
  };
  return limpia.replace(/[áéíóúÁÉÍÓÚñÑ°üÜ()\\]/g, (c) => mapa[c] || c);
}

function acortarTexto(str: string, maxLen: number): string {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 2) + '..';
}

/**
 * Genera un documento PDF 1.4 binario estándar con el reporte detallado
 * de consumos escolares de una familia bajo la modalidad Pagar luego / Fiado.
 */
export function generarComprobanteFiadoPdfBytes(
  padre: PadreFiadoResumen,
  config: ConfiguracionPagos
): Uint8Array {
  const pedidos = padre.pedidos || [];
  const fechaHoy = obtenerFechaHoyPeru();
  const fechaEmision = formatearFechaEmisionPeru();

  // Dimensiones estándar A4 (puntos tipográficos 72 ppi)
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginX = 36;
  const contentWidth = pageWidth - marginX * 2; // 523.28

  let stream = '';

  // 1. Barra de acento corporativo superior (Naranja - Ámbar)
  stream += `
0.96 0.45 0.08 rg
${marginX} ${pageHeight - 38} ${contentWidth} 4 re f
`;

  // 2. Encabezado institucional
  stream += `
0.06 0.09 0.16 rg
BT
/F2 16 Tf
${marginX} ${pageHeight - 60} Td
(${toPdfWinAnsi('PLACERES CULINARIOS')}) Tj
ET

0.40 0.46 0.54 rg
BT
/F2 9 Tf
${marginX} ${pageHeight - 73} Td
(${toPdfWinAnsi('COMPROBANTE OFICIAL DE CONSUMOS ESCOLARES (MODALIDAD FIADO / PAGAR LUEGO)')}) Tj
ET

0.25 0.30 0.38 rg
BT
/F1 9 Tf
${marginX} ${pageHeight - 86} Td
(${toPdfWinAnsi(`Institución: ${padre.colegioNombre}   |   Fecha de Emisión: ${fechaEmision}`)}) Tj
ET
`;

  // 3. Recuadro de Datos de la Familia / Apoderado
  const boxTop = pageHeight - 96;
  const boxHeight = 44;
  stream += `
0.96 0.97 0.98 rg
${marginX} ${boxTop - boxHeight} ${contentWidth} ${boxHeight} re f
0.88 0.91 0.94 RG
0.7 w
${marginX} ${boxTop - boxHeight} ${contentWidth} ${boxHeight} re S

0.06 0.09 0.16 rg
BT
/F2 9 Tf
${marginX + 10} ${boxTop - 15} Td
(${toPdfWinAnsi(`Apoderado: ${padre.nombrePadre}`)}) Tj
ET

BT
/F1 9 Tf
${marginX + 320} ${boxTop - 15} Td
(${toPdfWinAnsi(`Teléfono: ${padre.telefono || 'No registrado'}`)}) Tj
ET

BT
/F1 8.5 Tf
${marginX + 10} ${boxTop - 32} Td
(${toPdfWinAnsi(`Hijos registrados: ${padre.hijosNombres.join(', ') || 'General'}`)}) Tj
ET
`;

  // 4. Cabecera de la Tabla de Consumos
  const tableHeaderTop = boxTop - boxHeight - 12;
  const colX = {
    fecha: marginX + 8,
    estudiante: marginX + 75,
    platos: marginX + 195,
    entrega: marginX + 375,
    monto: marginX + 438,
    estado: marginX + 480,
  };

  stream += `
0.93 0.95 0.97 rg
${marginX} ${tableHeaderTop - 20} ${contentWidth} 20 re f
0.80 0.84 0.88 RG
0.5 w
${marginX} ${tableHeaderTop - 20} ${contentWidth} 20 re S

0.28 0.34 0.42 rg
BT
/F2 8 Tf
${colX.fecha} ${tableHeaderTop - 14} Td
(FECHA) Tj
ET

BT
/F2 8 Tf
${colX.estudiante} ${tableHeaderTop - 14} Td
(ESTUDIANTE / GRADO) Tj
ET

BT
/F2 8 Tf
${colX.platos} ${tableHeaderTop - 14} Td
(MENU ESCOLAR / PLATOS) Tj
ET

BT
/F2 8 Tf
${colX.entrega} ${tableHeaderTop - 14} Td
(ENTREGA) Tj
ET

BT
/F2 8 Tf
${colX.monto} ${tableHeaderTop - 14} Td
(MONTO) Tj
ET

BT
/F2 8 Tf
${colX.estado} ${tableHeaderTop - 14} Td
(ESTADO) Tj
ET
`;

  // 5. Filas de la Tabla
  let currentY = tableHeaderTop - 20;
  const rowHeight = 18;
  const maxRowsPerPage = 18;
  const pedidosLimpios = pedidos.slice(0, maxRowsPerPage);

  pedidosLimpios.forEach((ped, idx) => {
    currentY -= rowHeight;
    const isEven = idx % 2 === 1;

    // Fondo alternado
    if (isEven) {
      stream += `
0.98 0.99 1.00 rg
${marginX} ${currentY} ${contentWidth} ${rowHeight} re f
`;
    }

    // Línea divisoria
    stream += `
0.90 0.93 0.96 RG
0.5 w
${marginX} ${currentY} m ${marginX + contentWidth} ${currentY} l S
`;

    const ensaladaTexto = ped.ensaladaNombre && ped.ensaladaNombre !== 'Sin ensalada' ? ` + ${ped.ensaladaNombre}` : '';
    const platoTexto = ped.entradaNombre
      ? `${ped.entradaNombre} + ${ped.segundoNombre}${ensaladaTexto}`
      : `${ped.segundoNombre || 'Almuerzo escolar'}${ensaladaTexto}`;

    const estudianteTexto = ped.gradoSeccion
      ? `${ped.estudianteNombre} (${ped.gradoSeccion})`
      : ped.estudianteNombre;

    const entregaTexto = ped.estadoPedido === 'ENTREGADO' ? 'Entregado' : 'Pendiente';
    const estadoTexto = ped.estadoPago === 'PAGADO' ? 'PAGADO' : 'PENDIENTE';
    const montoTexto = `S/ ${(Number(ped.monto) || 12).toFixed(2)}`;

    // Textos de la fila
    stream += `
0.20 0.25 0.33 rg
BT
/F1 8 Tf
${colX.fecha} ${currentY + 5} Td
(${toPdfWinAnsi(ped.fecha || '')}) Tj
ET

BT
/F2 8 Tf
${colX.estudiante} ${currentY + 5} Td
(${toPdfWinAnsi(acortarTexto(estudianteTexto, 24))}) Tj
ET

BT
/F1 8 Tf
${colX.platos} ${currentY + 5} Td
(${toPdfWinAnsi(acortarTexto(platoTexto, 32))}) Tj
ET

BT
/F1 8 Tf
${colX.entrega} ${currentY + 5} Td
(${toPdfWinAnsi(entregaTexto)}) Tj
ET

BT
/F2 8 Tf
${colX.monto} ${currentY + 5} Td
(${toPdfWinAnsi(montoTexto)}) Tj
ET
`;

    // Color semántico para estado
    if (ped.estadoPago === 'PAGADO') {
      stream += `
0.10 0.55 0.25 rg
BT
/F2 8 Tf
${colX.estado} ${currentY + 5} Td
(${toPdfWinAnsi(estadoTexto)}) Tj
ET
`;
    } else {
      stream += `
0.75 0.35 0.05 rg
BT
/F2 8 Tf
${colX.estado} ${currentY + 5} Td
(${toPdfWinAnsi(estadoTexto)}) Tj
ET
`;
    }
  });

  if (pedidos.length > maxRowsPerPage) {
    currentY -= 14;
    stream += `
0.45 0.50 0.60 rg
BT
/F1 8 Tf
${marginX + 10} ${currentY + 3} Td
(${toPdfWinAnsi(`* Se muestran ${maxRowsPerPage} de ${pedidos.length} consumos registrados en este período.`)}) Tj
ET
`;
  }

  // 6. Recuadro de Total de la Deuda
  const totalBoxY = Math.max(currentY - 56, 120);
  stream += `
1.00 0.98 0.92 rg
${marginX} ${totalBoxY} ${contentWidth} 38 re f
0.96 0.85 0.50 RG
0.8 w
${marginX} ${totalBoxY} ${contentWidth} 38 re S

0.45 0.25 0.05 rg
BT
/F2 11 Tf
${marginX + 16} ${totalBoxY + 14} Td
(${toPdfWinAnsi('TOTAL PENDIENTE DE PAGO:')}) Tj
ET

0.80 0.35 0.05 rg
BT
/F2 16 Tf
${marginX + 360} ${totalBoxY + 12} Td
(${toPdfWinAnsi(`S/ ${padre.totalDeuda.toFixed(2)}`)}) Tj
ET
`;

  // 7. Medios de Pago Oficiales (Superadmin)
  const pagosBoxY = totalBoxY - 58;
  stream += `
0.94 0.99 0.95 rg
${marginX} ${pagosBoxY} ${contentWidth} 48 re f
0.72 0.92 0.78 RG
0.8 w
${marginX} ${pagosBoxY} ${contentWidth} 48 re S

0.08 0.45 0.20 rg
BT
/F2 9 Tf
${marginX + 14} ${pagosBoxY + 33} Td
(${toPdfWinAnsi('MEDIOS DE PAGO ESTABLECIDOS:')}) Tj
ET

0.12 0.30 0.18 rg
BT
/F1 8.5 Tf
${marginX + 14} ${pagosBoxY + 20} Td
(${toPdfWinAnsi(`Yape: ${config.numeroYape || 'Configurado'} (${config.titularYape || 'Administracion'})   |   Plin: ${config.numeroPlin || 'Configurado'} (${config.titularPlin || 'Administracion'})`)}) Tj
ET

0.18 0.35 0.22 rg
BT
/F1 8 Tf
${marginX + 14} ${pagosBoxY + 8} Td
(${toPdfWinAnsi('Tambien puede cancelar directamente en el modulo de atencion escolar. Enviar captura para registrar su abono.')}) Tj
ET
`;

  // 8. Pie de página institucional
  stream += `
0.55 0.60 0.68 rg
BT
/F1 7.5 Tf
${marginX + 100} 35 Td
(${toPdfWinAnsi(`Placeres Culinarios - Sistema de Gestion de Almuerzos Escolares   |   Fecha de comprobante: ${fechaHoy}`)}) Tj
ET
`;

  // Ensamblar objetos PDF 1.4
  const objects: string[] = [];
  function addObject(data: string): number {
    objects.push(data);
    return objects.length;
  }

  addObject('<< /Type /Catalog /Pages 2 0 R >>'); // 1
  addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'); // 2
  addObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`); // 3
  addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'); // 4
  addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'); // 5

  const streamLength = stream.length;
  addObject(`<< /Length ${streamLength} >>\nstream\n${stream}\nendstream`); // 6

  let pdfString = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets: number[] = [];

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
  return bytes;
}

/**
 * Genera el Blob tipo application/pdf del comprobante para visualización o descarga.
 */
export function generarComprobanteFiadoPdfBlob(
  padre: PadreFiadoResumen,
  config: ConfiguracionPagos
): Blob {
  const bytes = generarComprobanteFiadoPdfBytes(padre, config);
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Descarga directamente el archivo .pdf en el navegador del usuario.
 */
export function descargarComprobanteFiadoPdf(
  padre: PadreFiadoResumen,
  config: ConfiguracionPagos
): string {
  if (typeof window === 'undefined') return '';
  const blob = generarComprobanteFiadoPdfBlob(padre, config);
  const fechaHoy = obtenerFechaHoyPeru();
  const nombreLimpio = (padre.nombrePadre || 'Padre').replace(/[^\w\d]/g, '_');
  const filename = `Comprobante_Deuda_${nombreLimpio}_${fechaHoy}.pdf`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return filename;
}
