import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const CLOUDINARY_SERVICE_PATH = path.join(process.cwd(), 'src/lib/cloudinaryService.ts');
const DATA_SERVICE_PATH = path.join(process.cwd(), 'src/lib/dataService.ts');
const ROUTE_UPLOAD_PATH = path.join(process.cwd(), 'src/app/api/upload-cloudinary/route.ts');
const ADMIN_TAB_PATH = path.join(process.cwd(), 'src/app/admin/components/AdminMenuSemanalTab.tsx');
const MODAL_PEDIDO_PATH = path.join(process.cwd(), 'src/components/ModalPedidoManual.tsx');
const ADMIN_PAGE_PATH = path.join(process.cwd(), 'src/app/admin/page.tsx');

test('Robustez de Subida de Fotos de Platos a Cloudinary y Visualización Transversal', async (t) => {
  await t.test('1. cloudinaryService exporta valores predeterminados seguros y cuenta con estrategia de doble canal', () => {
    const content = fs.readFileSync(CLOUDINARY_SERVICE_PATH, 'utf8');
    assert.match(content, /export const CLOUDINARY_DEFAULT_CLOUD_NAME\s*=\s*['"]qeqjhqpv['"]/);
    assert.match(content, /export const CLOUDINARY_DEFAULT_UPLOAD_PRESET\s*=\s*['"]comprobantes_almuerzos['"]/);
    assert.match(content, /subirDirecto/);
    assert.match(content, /subirViaApiServidor/);
    assert.match(content, /\/api\/upload-cloudinary/);
  });

  await t.test('2. Endpoint /api/upload-cloudinary existe y procesa subida en servidor Next.js', () => {
    assert.ok(fs.existsSync(ROUTE_UPLOAD_PATH), 'El archivo route.ts de upload-cloudinary debe existir');
    const content = fs.readFileSync(ROUTE_UPLOAD_PATH, 'utf8');
    assert.match(content, /export async function POST/);
    assert.match(content, /cloudinaryFormData/);
    assert.match(content, /api\.cloudinary\.com/);
  });

  await t.test('3. dataService.ts exige URLs HTTPS en platos y no permite Base64 en Supabase', () => {
    const content = fs.readFileSync(DATA_SERVICE_PATH, 'utf8');
    assert.match(content, /No se pudo guardar la fotografía en Cloudinary/);
    assert.match(content, /imagen_url:\s*\(nuevoPlato\.imagenUrl && !nuevoPlato\.imagenUrl\.startsWith\('data:image'\)\)\s*\?\s*nuevoPlato\.imagenUrl\s*:\s*null/);
  });

  await t.test('4. AdminMenuSemanalTab bloquea el botón mientras se sube la foto a Cloudinary', () => {
    const content = fs.readFileSync(ADMIN_TAB_PATH, 'utf8');
    assert.match(content, /subiendoFotoSegundo/);
    assert.match(content, /Subiendo imagen a Cloudinary/);
  });

  await t.test('5. admin/page.tsx valida que las fotos subidas sean URLs HTTPS válidas y alerta en caso de error', () => {
    const content = fs.readFileSync(ADMIN_PAGE_PATH, 'utf8');
    assert.match(content, /No se recibió un enlace HTTPS seguro de Cloudinary/);
    assert.match(content, /No se pudo subir la foto del segundo a Cloudinary/);
  });

  await t.test('6. ModalPedidoManual.tsx muestra la fotografía del plato cuando se selecciona de la carta', () => {
    const content = fs.readFileSync(MODAL_PEDIDO_PATH, 'utf8');
    assert.match(content, /platoSegundoObj\?\.imagenUrl/);
    assert.match(content, /Fotografía del Segundo/);
  });
});
