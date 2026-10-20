import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Línea de Tiempo de Fiados y Módulo de Deudas para Padres', () => {
  const pedidosPagePath = path.resolve(process.cwd(), 'src/app/padres/pedidos/page.tsx');
  const deudasPagePath = path.resolve(process.cwd(), 'src/app/padres/deudas/page.tsx');
  const deudasLayoutPath = path.resolve(process.cwd(), 'src/app/padres/deudas/layout.tsx');
  const middlewarePath = path.resolve(process.cwd(), 'src/middleware.ts');
  const navUtilsPath = path.resolve(process.cwd(), 'src/lib/navUtils.ts');
  const headerNavPath = path.resolve(process.cwd(), 'src/components/HeaderNav.tsx');
  const bottomNavPath = path.resolve(process.cwd(), 'src/components/BottomNav.tsx');
  const metadataUtilsPath = path.resolve(process.cwd(), 'src/lib/metadataUtils.ts');

  test('1. Línea de tiempo (stepper): Fiado entregado sin liquidar muestra etapa 2 en amarillo como "Pagar luego"', () => {
    const contenido = fs.readFileSync(pedidosPagePath, 'utf-8');

    // Verifica que obtenerEstadoTimeline detecte fiado
    assert.ok(
      contenido.includes('esFiado') && contenido.includes('fiadoLiquidado') && contenido.includes('fiadoPendiente'),
      'obtenerEstadoTimeline debe evaluar esFiado, fiadoLiquidado y fiadoPendiente'
    );

    // Verifica que etapa 2 para fiados muestre 'Pagar luego' si no está liquidado
    assert.ok(
      contenido.includes("fiadoLiquidado ? 'Pago aceptado' : 'Pagar luego'"),
      'Etapa 2 debe mostrar "Pagar luego" cuando el fiado no está liquidado'
    );

    // Verifica que completado sea true para fiados SOLO si fiadoLiquidado es true
    assert.ok(
      contenido.includes('completado: esFiado ? fiadoLiquidado : (pagadoOAceptado || entregado)'),
      'Etapa 2 sólo debe completarse en fiados cuando fiadoLiquidado es verdadero'
    );

    // Verifica que alerta sea true para fiado pendiente
    assert.ok(
      contenido.includes('alerta: esFiado') && contenido.includes('fiadoPendiente'),
      'Etapa 2 debe tener alerta activa (amarillo/ámbar) para fiados pendientes'
    );
  });

  test('2. Badge de estado de pago muestra "Pagar luego (Fiado)" para fiados pendientes y "Pago aceptado" al liquidar', () => {
    const contenido = fs.readFileSync(pedidosPagePath, 'utf-8');

    assert.ok(
      contenido.includes("const badgeEstadoPago = (estado: EstadoPago, metodoPago?: string) =>"),
      'badgeEstadoPago debe aceptar metodoPago para detectar pedidos fiados'
    );

    assert.ok(
      contenido.includes('Pagar luego (Fiado)'),
      'badgeEstadoPago debe contener la etiqueta "Pagar luego (Fiado)"'
    );

    assert.ok(
      contenido.includes('Pago aceptado'),
      'badgeEstadoPago debe contener la etiqueta "Pago aceptado"'
    );
  });

  test('3. Módulo de Deudas: Archivos page.tsx y layout.tsx existen y tienen tipado estricto', () => {
    assert.ok(fs.existsSync(deudasPagePath), 'src/app/padres/deudas/page.tsx debe existir');
    assert.ok(fs.existsSync(deudasLayoutPath), 'src/app/padres/deudas/layout.tsx debe existir');

    const contenidoDeudas = fs.readFileSync(deudasPagePath, 'utf-8');
    assert.ok(contenidoDeudas.includes("'use client'"), 'deudas/page.tsx debe ser un Client Component');
    assert.ok(contenidoDeudas.includes('totalDeudaPendiente'), 'deudas/page.tsx debe calcular totalDeudaPendiente');
    assert.ok(contenidoDeudas.includes('descargarComprobanteFiadoPdf'), 'deudas/page.tsx debe integrar descarga de PDF');
    assert.ok(contenidoDeudas.includes('obtenerPedidosPorPadre'), 'deudas/page.tsx debe cargar pedidos del padre');
    assert.ok(contenidoDeudas.includes('suscribirCambios'), 'deudas/page.tsx debe suscribirse a cambios en tiempo real');
  });

  test('4. Seguridad y Middleware: Ruta /padres/deudas protegida para padres autenticados', () => {
    const contenidoMiddleware = fs.readFileSync(middlewarePath, 'utf-8');
    assert.ok(
      contenidoMiddleware.includes("pathname.startsWith('/padres/deudas')"),
      'middleware.ts debe proteger /padres/deudas contra accesos anónimos'
    );
  });

  test('5. Navegación e Iconografía: HeaderNav, BottomNav y navUtils integran "Mis Deudas"', () => {
    const contenidoNavUtils = fs.readFileSync(navUtilsPath, 'utf-8');
    assert.ok(
      contenidoNavUtils.includes("ruta.startsWith('/padres/deudas')") && contenidoNavUtils.includes('Mis Deudas'),
      'navUtils debe reconocer /padres/deudas con título Mis Deudas'
    );

    const contenidoHeaderNav = fs.readFileSync(headerNavPath, 'utf-8');
    assert.ok(
      contenidoHeaderNav.includes('/padres/deudas') && contenidoHeaderNav.includes('Mis Deudas'),
      'HeaderNav debe incluir enlace a /padres/deudas'
    );

    const contenidoBottomNav = fs.readFileSync(bottomNavPath, 'utf-8');
    assert.ok(
      contenidoBottomNav.includes('/padres/deudas') && contenidoBottomNav.includes('Deudas'),
      'BottomNav debe incluir pestaña de Deudas para navegación móvil de padres'
    );
  });

  test('6. Metadatos SEO por página: /padres/deudas registrado en RUTA_METADATA_MAP', () => {
    const contenidoMetadata = fs.readFileSync(metadataUtilsPath, 'utf-8');
    assert.ok(
      contenidoMetadata.includes("'/padres/deudas'"),
      'RUTA_METADATA_MAP debe contener configuración de metadatos para /padres/deudas'
    );
  });
});
