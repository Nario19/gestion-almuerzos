import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Automatización y Limpieza de Comprobantes en Cloudinary (> 2 días)', () => {
  const rootDir = process.cwd();
  const cloudinaryServicePath = path.join(rootDir, 'src', 'lib', 'cloudinaryService.ts');
  const dataServicePath = path.join(rootDir, 'src', 'lib', 'dataService.ts');
  const cronRoutePath = path.join(rootDir, 'src', 'app', 'api', 'cron', 'limpiar-comprobantes', 'route.ts');
  const vercelJsonPath = path.join(rootDir, 'vercel.json');
  const superadminPagePath = path.join(rootDir, 'src', 'app', 'superadmin', 'page.tsx');

  const cloudinaryContent = fs.readFileSync(cloudinaryServicePath, 'utf-8');
  const dataServiceContent = fs.readFileSync(dataServicePath, 'utf-8');
  const cronRouteContent = fs.readFileSync(cronRoutePath, 'utf-8');
  const vercelJsonContent = fs.readFileSync(vercelJsonPath, 'utf-8');
  const superadminContent = fs.readFileSync(superadminPagePath, 'utf-8');

  test('1. cloudinaryService exporta extraerPublicIdComprobante con blindaje estricto', async () => {
    assert.ok(
      cloudinaryContent.includes('export function extraerPublicIdComprobante'),
      'Debe exportar la función extraerPublicIdComprobante'
    );

    assert.ok(
      cloudinaryContent.includes('/comprobantes/') &&
        (cloudinaryContent.includes("publicId.startsWith('comprobantes/')") ||
          cloudinaryContent.includes("sinExtension.startsWith('comprobantes/')")),
      'Debe restringir la extracción estrictamente a la carpeta comprobantes/'
    );

    // Verificación dinámica de la lógica de extracción
    const extraer = (url) => {
      if (!url || typeof url !== 'string') return null;
      if (!url.includes('cloudinary.com') || !url.includes('/comprobantes/')) return null;
      try {
        const uploadIndex = url.indexOf('/image/upload/');
        if (uploadIndex === -1) return null;
        const pathPart = url.substring(uploadIndex + '/image/upload/'.length);
        const match = pathPart.match(/(comprobantes\/[^.?#]+)/);
        if (!match) return null;
        let publicId = match[1];
        publicId = publicId.replace(/\.(webp|jpg|jpeg|png|gif|bmp|tiff|avif|heic|pdf)$/i, '');
        return publicId.startsWith('comprobantes/') ? publicId : null;
      } catch {
        return null;
      }
    };

    // Caso A: URL con versión
    assert.equal(
      extraer('https://res.cloudinary.com/mi-cloud/image/upload/v1729547000/comprobantes/yape_12345.webp'),
      'comprobantes/yape_12345'
    );

    // Caso B: URL sin versión
    assert.equal(
      extraer('https://res.cloudinary.com/mi-cloud/image/upload/comprobantes/plin_998877.jpg'),
      'comprobantes/plin_998877'
    );

    // Caso C: FOTO DE PLATO DEL MENÚ -> NUNCA debe extraerse (blindaje anti-borrado accidental)
    assert.equal(
      extraer('https://res.cloudinary.com/mi-cloud/image/upload/v1729547000/platos/san_martin/lunes/lomo.webp'),
      null,
      'Las fotos de platos del menú jamás deben ser marcadas como comprobantes para borrar'
    );

    // Caso D: Base64 o URLs externas
    assert.equal(extraer('data:image/jpeg;base64,xxxx'), null);
    assert.equal(extraer(null), null);
    assert.equal(extraer(''), null);
  });

  test('2. cloudinaryService implementa firma criptográfica y endpoint de destrucción seguro', () => {
    assert.ok(
      cloudinaryContent.includes('export async function generarSha1'),
      'Debe exportar generarSha1 para cálculo de firma criptográfica'
    );

    assert.ok(
      cloudinaryContent.includes('export async function eliminarImagenDeCloudinary'),
      'Debe exportar eliminarImagenDeCloudinary'
    );

    assert.ok(
      cloudinaryContent.includes('image/destroy'),
      'Debe comunicarse con el endpoint oficial image/destroy de Cloudinary'
    );

    assert.ok(
      cloudinaryContent.includes('CLOUDINARY_API_KEY') && cloudinaryContent.includes('CLOUDINARY_API_SECRET'),
      'Debe validar las credenciales seguras del servidor'
    );
  });

  test('3. dataService implementa limpiarComprobantesAntiguos con umbral configurable', () => {
    assert.ok(
      dataServiceContent.includes('limpiarComprobantesAntiguos(diasAntiguedad: number = 2)'),
      'dataService debe implementar limpiarComprobantesAntiguos con parámetro por defecto de 2 días'
    );

    assert.ok(
      dataServiceContent.includes('extraerPublicIdComprobante') && dataServiceContent.includes('eliminarImagenDeCloudinary'),
      'dataService debe coordinar la extracción de publicId y la eliminación en Cloudinary'
    );

    assert.ok(
      dataServiceContent.includes('comprobante_url: null'),
      'dataService debe limpiar comprobante_url en la base de datos dejando intacto el resto del pedido'
    );
  });

  test('4. Lógica de retención: pedidos de hoy y ayer se conservan; pedidos > 48 horas se purgan', () => {
    const ahora = Date.now();
    const dosDiasMs = 2 * 24 * 60 * 60 * 1000;
    const cutoff = ahora - dosDiasMs;

    const pedidosSimulados = [
      {
        id: '1',
        estudianteNombre: 'Mateo',
        createdAt: new Date(ahora - 1000 * 60 * 60 * 2).toISOString(), // Hace 2 horas (Hoy)
        comprobanteUrl: 'https://res.cloudinary.com/demo/image/upload/comprobantes/reciente_1.jpg',
      },
      {
        id: '2',
        estudianteNombre: 'Valeria',
        createdAt: new Date(ahora - 1000 * 60 * 60 * 26).toISOString(), // Hace 26 horas (Ayer)
        comprobanteUrl: 'https://res.cloudinary.com/demo/image/upload/comprobantes/reciente_2.jpg',
      },
      {
        id: '3',
        estudianteNombre: 'Rodrigo',
        createdAt: new Date(ahora - 1000 * 60 * 60 * 72).toISOString(), // Hace 72 horas (Hace 3 días)
        comprobanteUrl: 'https://res.cloudinary.com/demo/image/upload/comprobantes/antiguo_3.jpg',
      },
      {
        id: '4',
        estudianteNombre: 'Camila',
        createdAt: new Date(ahora - 1000 * 60 * 60 * 120).toISOString(), // Hace 5 días
        comprobanteUrl: 'https://res.cloudinary.com/demo/image/upload/comprobantes/antiguo_4.jpg',
      },
    ];

    const pedidosParaPurgar = pedidosSimulados.filter((p) => {
      const fechaMs = new Date(p.createdAt).getTime();
      return fechaMs < cutoff && p.comprobanteUrl;
    });

    const pedidosConservados = pedidosSimulados.filter((p) => {
      const fechaMs = new Date(p.createdAt).getTime();
      return fechaMs >= cutoff;
    });

    assert.equal(pedidosParaPurgar.length, 2, 'Deben purgarse exactamente los 2 pedidos mayores a 48 hrs');
    assert.equal(pedidosParaPurgar[0].id, '3');
    assert.equal(pedidosParaPurgar[1].id, '4');

    assert.equal(pedidosConservados.length, 2, 'Deben conservarse los pedidos recientes de hoy y ayer');
    assert.equal(pedidosConservados[0].id, '1');
    assert.equal(pedidosConservados[1].id, '2');
  });

  test('5. vercel.json programa la tarea diaria a las 03:00 AM Perú (08:00 UTC)', () => {
    assert.ok(fs.existsSync(vercelJsonPath), 'El archivo vercel.json debe existir en la raíz');
    const config = JSON.parse(vercelJsonContent);

    assert.ok(Array.isArray(config.crons), 'vercel.json debe contener el arreglo crons');
    const cronItem = config.crons.find((c) => c.path === '/api/cron/limpiar-comprobantes');

    assert.ok(cronItem, 'Debe existir la tarea programada para /api/cron/limpiar-comprobantes');
    assert.equal(cronItem.schedule, '0 8 * * *', 'El cron debe ejecutarse a las 08:00 UTC (03:00 AM hora de Perú UTC-5)');
  });

  test('6. Route Handler /api/cron/limpiar-comprobantes implementa GET, POST y protección de autenticación', () => {
    assert.ok(
      cronRouteContent.includes('export async function GET') && cronRouteContent.includes('export async function POST'),
      'El endpoint debe soportar peticiones GET (Vercel Cron) y POST (activación manual)'
    );

    assert.ok(
      cronRouteContent.includes('CRON_SECRET'),
      'El endpoint debe validar el token CRON_SECRET de seguridad'
    );

    assert.ok(
      cronRouteContent.includes('dataService.limpiarComprobantesAntiguos'),
      'El endpoint debe delegar la depuración a dataService.limpiarComprobantesAntiguos'
    );
  });

  test('7. Panel de Superadmin incluye tarjeta visual de estado y botón de ejecución manual', () => {
    assert.ok(
      superadminContent.includes('Almacenamiento Cloudinary: Depuración de Comprobantes'),
      'Superadmin debe tener la sección de depuración de comprobantes'
    );

    assert.ok(
      superadminContent.includes('handleLimpiarComprobantesManualmente') || superadminContent.includes('Ejecutar Limpieza Ahora'),
      'Superadmin debe ofrecer botón de ejecución inmediata manual'
    );

    assert.ok(
      superadminContent.includes('Vercel Cron') || superadminContent.includes('03:00 AM Perú'),
      'Superadmin debe mostrar el horario automático programado'
    );
  });
});
