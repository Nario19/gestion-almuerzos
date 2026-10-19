import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('Verificación de Remoción de WhatsApp en Tarjeta de Pedidos y Ajustes en Fiado', async (t) => {
  await t.test('1. En /pedidos: La tarjeta de pedido ya NO tiene botón de WhatsApp', () => {
    const pedidosPath = path.join(projectRoot, 'src/app/pedidos/page.tsx');
    assert.ok(fs.existsSync(pedidosPath), 'src/app/pedidos/page.tsx debe existir');
    const content = fs.readFileSync(pedidosPath, 'utf8');

    // No debe existir el botón de WhatsApp en la tarjeta
    assert.doesNotMatch(
      content,
      /abrirConsultaWhatsApp/,
      'pedidos/page.tsx ya NO debe contener abrirConsultaWhatsApp'
    );
    assert.doesNotMatch(
      content,
      />\s*WhatsApp\s*<\/span>/,
      'La tarjeta de pedido en pedidos/page.tsx ya NO debe mostrar el botón WhatsApp'
    );
  });

  await t.test('2. En /fiado: Tarjeta familiar ya NO tiene botón de WhatsApp ni insignia de colegio', () => {
    const fiadoPath = path.join(projectRoot, 'src/app/fiado/page.tsx');
    assert.ok(fs.existsSync(fiadoPath), 'src/app/fiado/page.tsx debe existir');
    const content = fs.readFileSync(fiadoPath, 'utf8');

    // En la cabecera de la tarjeta familiar no debe mostrarse el badge de padre.colegioNombre
    assert.doesNotMatch(
      content,
      /<Building2 className="w-3 h-3 text-slate-400" \/>\s*\{padre\.colegioNombre\}/,
      'La cabecera de la tarjeta familiar en fiado ya NO debe mostrar el badge de colegio'
    );

    // En las acciones de la tarjeta familiar no debe estar el botón directo de WhatsApp
    assert.doesNotMatch(
      content,
      /title="Enviar estado de cuenta y recordatorio por WhatsApp"/,
      'La tarjeta familiar en fiado ya NO debe tener el botón directo de WhatsApp'
    );
  });

  await t.test('3. En /fiado: El modal de Reporte incluye el botón Enviar a WhatsApp al número registrado', () => {
    const fiadoPath = path.join(projectRoot, 'src/app/fiado/page.tsx');
    const content = fs.readFileSync(fiadoPath, 'utf8');

    // El modal de reporte debe contener el botón "Enviar a WhatsApp"
    assert.match(
      content,
      /<span>Enviar a WhatsApp<\/span>/,
      'El modal de reporte de fiado debe contener el botón Enviar a WhatsApp'
    );
    assert.match(
      content,
      /onClick=\{\(\) => enviarCobroWhatsApp\(padreReporteModal\)\}/,
      'El botón del modal de reporte debe invocar enviarCobroWhatsApp con padreReporteModal'
    );

    // enviarCobroWhatsApp utiliza el teléfono registrado del padre
    assert.match(
      content,
      /padre\.telefono\.replace\(/,
      'enviarCobroWhatsApp debe limpiar el teléfono registrado'
    );
    assert.match(
      content,
      /https:\/\/wa\.me\/\$\{telefonoFinal\}/,
      'enviarCobroWhatsApp debe direccionar al número de WhatsApp registrado del padre'
    );
  });
});
