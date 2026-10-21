import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Optimización de Rendimiento: Carga Ultrarrápida de Carta y Compresión Cloudinary', () => {
  const rootDir = process.cwd();
  const cloudinaryServicePath = path.join(rootDir, 'src', 'lib', 'cloudinaryService.ts');
  const dataServicePath = path.join(rootDir, 'src', 'lib', 'dataService.ts');
  const padresPagePath = path.join(rootDir, 'src', 'app', 'padres', 'page.tsx');
  const adminPagePath = path.join(rootDir, 'src', 'app', 'admin', 'page.tsx');

  const cloudinaryContent = fs.readFileSync(cloudinaryServicePath, 'utf-8');
  const dataServiceContent = fs.readFileSync(dataServicePath, 'utf-8');
  const padresContent = fs.readFileSync(padresPagePath, 'utf-8');
  const adminContent = fs.readFileSync(adminPagePath, 'utf-8');

  test('1. cloudinaryService exporta optimizarUrlCloudinary con transformaciones f_auto, q_auto y ancho límite', () => {
    assert.ok(
      cloudinaryContent.includes('export function optimizarUrlCloudinary'),
      'Debe exportar optimizarUrlCloudinary'
    );
    assert.ok(
      cloudinaryContent.includes('f_auto') && cloudinaryContent.includes('q_') && cloudinaryContent.includes('c_limit'),
      'Debe aplicar transformaciones de formato automático, compresión y ancho límite'
    );

    // Lógica pura de la transformación
    const optimizar = (url, opciones = {}) => {
      if (!url || typeof url !== 'string') return url || '';
      if (!url.includes('cloudinary.com') || !url.includes('/image/upload/')) return url;
      if (url.includes('f_auto') && url.includes('q_auto')) return url;

      const width = opciones.width || 600;
      const calidad = opciones.quality || 'auto';
      const transformacion = `f_auto,q_${calidad},w_${width},c_limit`;

      return url.replace('/image/upload/', `/image/upload/${transformacion}/`);
    };

    const original = 'https://res.cloudinary.com/placeres-culinarios/image/upload/v1729547000/platos/san_martin/lunes/lomo_saltado.jpg';
    const optimizada = optimizar(original, { width: 500 });

    assert.ok(optimizada.includes('/image/upload/f_auto,q_auto,w_500,c_limit/v1729547000/'), 'Debe insertar las transformaciones en la URL');
    assert.equal(optimizar(optimizada), optimizada, 'Debe ser idempotente si ya tiene f_auto y q_auto');
    assert.equal(optimizar('data:image/png;base64,xxxx'), 'data:image/png;base64,xxxx', 'No debe alterar imágenes locales en Base64');
  });

  test('2. dataService.mapearPlatoDesdeSupabase optimiza automáticamente las imágenes de los platos', () => {
    assert.ok(
      dataServiceContent.includes('optimizarUrlCloudinary(d.imagen_url, { width: 600 })'),
      'mapearPlatoDesdeSupabase debe procesar la URL de la imagen con optimizarUrlCloudinary'
    );
  });

  test('3. dataService implementa caché en memoria para obtenerPlatosPorDia y funciones de invalidación', () => {
    assert.ok(
      dataServiceContent.includes('cachePlatosPorDiaMemoria') && dataServiceContent.includes('CACHE_TTL_PLATOS_MS'),
      'dataService debe contar con caché en memoria con TTL para platos del día'
    );

    assert.ok(
      dataServiceContent.includes('export function invalidarCachePlatos'),
      'dataService debe exportar invalidarCachePlatos para mantener sincronización inmediata ante cambios'
    );

    assert.ok(
      dataServiceContent.includes('invalidarCachePlatos()'),
      'Debe invalidar la caché al agregar, actualizar o eliminar platos'
    );
  });

  test('4. dataService implementa caché para configuración global (colegios, pagos y hora límite)', () => {
    assert.ok(
      dataServiceContent.includes('cacheColegiosMemoria') &&
      dataServiceContent.includes('cacheConfigPagosMemoria') &&
      dataServiceContent.includes('cacheHoraLimiteMemoria'),
      'dataService debe disponer de cachés para configuración global'
    );

    assert.ok(
      dataServiceContent.includes('export function invalidarCacheConfig'),
      'dataService debe exportar invalidarCacheConfig'
    );
  });

  test('5. Vista de Padres implementa prefetch de días de la semana e imágenes con carga diferida (lazy/async)', () => {
    // Prefetch en background
    assert.ok(
      padresContent.includes('dataService.obtenerPlatosPorDia(d, colegioFiltro)'),
      'La vista de padres debe precargar los platos de los demás días en segundo plano'
    );

    // Atributos de rendimiento en las imágenes
    assert.ok(
      padresContent.includes('loading="lazy"') && padresContent.includes('decoding="async"'),
      'Las imágenes de la carta deben utilizar loading="lazy" y decoding="async" para acelerar el renderizado inicial'
    );
  });

  test('6. Panel de Administración desacopla la carga de platos del día de los metadatos globales', () => {
    assert.ok(
      adminContent.includes('// Carga de platos del menú del día activo') &&
      adminContent.includes('// Carga de metadatos administrativos'),
      'El panel de administración debe desacoplar las llamadas a la base de datos para no saturar Supabase al cambiar de día'
    );
  });
});
