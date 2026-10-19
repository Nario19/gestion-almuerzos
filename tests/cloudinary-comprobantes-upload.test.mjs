import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('Almacenamiento de Comprobantes en Cloudinary (Blindaje de Supabase PostgreSQL)', async (t) => {
  await t.test('1. cloudinaryService: Existe el módulo con función subirImagenACloudinary y tipado seguro', () => {
    const servicePath = path.join(projectRoot, 'src/lib/cloudinaryService.ts');
    assert.ok(fs.existsSync(servicePath), 'src/lib/cloudinaryService.ts debe existir');
    const content = fs.readFileSync(servicePath, 'utf8');

    assert.match(content, /export async function subirImagenACloudinary/, 'Debe exportar subirImagenACloudinary');
    assert.match(content, /NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME/, 'Debe leer NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
    assert.match(content, /NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET/, 'Debe leer NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
    assert.match(content, /https:\/\/api\.cloudinary\.com\/v1_1/, 'Debe llamar al endpoint REST oficial de Cloudinary');
    assert.match(content, /upload_preset/, 'Debe adjuntar el upload_preset unsigned');
  });

  await t.test('2. cloudinaryService: Lógica pura y fallback en caso de falta de credenciales o error', async () => {
    const { subirImagenACloudinary } = await import(path.join(projectRoot, 'src/lib/cloudinaryService.ts'));
    
    // Si se pasa un dataURL de fallback
    const fakeDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
    
    // Respaldar variables actuales
    const oldCloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const oldPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    try {
      // Sin variables de entorno debe devolver el dataUrl como fallback sin romper el flujo
      delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      delete process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      const fallbackResult = await subirImagenACloudinary(fakeDataUrl, 'comprobantes');
      assert.equal(fallbackResult, fakeDataUrl, 'Debe devolver el dataUrl de fallback si no hay credenciales configuradas');
    } finally {
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = oldCloud;
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = oldPreset;
    }
  });

  await t.test('3. En / (Home / Checkout): Integración de Cloudinary al adjuntar comprobante', () => {
    const pagePath = path.join(projectRoot, 'src/app/page.tsx');
    const content = fs.readFileSync(pagePath, 'utf8');

    // Debe importar el servicio
    assert.match(content, /import\s*\{\s*subirImagenACloudinary\s*\}\s*from\s*['"]@\/lib\/cloudinaryService['"]/, 'page.tsx debe importar subirImagenACloudinary');

    // Debe invocar la subida a Cloudinary
    assert.match(content, /subirImagenACloudinary\(result\.compressedDataUrl,\s*['"]comprobantes['"]\)/, 'handleImageUpload debe subir la imagen comprimida a Cloudinary');

    // Debe manejar feedback visual
    assert.match(content, /Optimizando y guardando comprobante en la nube\.\.\./, 'Debe informar al padre que se está guardando en la nube');
    assert.match(content, /En Cloudinary/, 'Debe incluir badge de confirmación en Cloudinary');

    // En crearPedido debe enviar la URL de Cloudinary
    assert.match(content, /comprobanteUrl:\s*urlComprobanteFinal/, 'crearPedido debe guardar la URL segura de Cloudinary en lugar del Base64 directo');
  });

  await t.test('4. En /admin: Integración de Cloudinary para fotos de platos del menú semanal', () => {
    const adminPath = path.join(projectRoot, 'src/app/admin/page.tsx');
    const content = fs.readFileSync(adminPath, 'utf8');

    assert.match(content, /import\s*\{\s*subirImagenACloudinary\s*\}\s*from\s*['"]@\/lib\/cloudinaryService['"]/, 'admin/page.tsx debe importar subirImagenACloudinary');
    assert.match(content, /subirImagenACloudinary\(res\.compressedDataUrl,\s*['"]platos['"]\)/, 'handleFotoUpload debe subir la foto a la carpeta platos en Cloudinary');
  });

  await t.test('5. Variables de entorno documentadas en .env.example', () => {
    const envExamplePath = path.join(projectRoot, '.env.example');
    const content = fs.readFileSync(envExamplePath, 'utf8');

    assert.match(content, /NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME/, '.env.example debe documentar NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
    assert.match(content, /NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET/, '.env.example debe documentar NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
  });

  await t.test('6. Modal de Confirmación: Carga y muestra la imagen del comprobante para verificar que sea el correcto', () => {
    const pagePath = path.join(projectRoot, 'src/app/page.tsx');
    const content = fs.readFileSync(pagePath, 'utf8');

    // Debe existir la sección de previsualización en el modal de corroboración
    assert.match(content, /Captura del Comprobante de Pago/, 'El modal de confirmación debe titular la sección Captura del Comprobante de Pago');
    assert.match(content, /Por favor verifica que la captura corresponda a tu pago/, 'Debe pedir al padre que verifique si la captura es la correcta');
    assert.match(content, /<img\s*src=\{cloudinaryUrl\s*\|\|\s*comprimidoInfo\?\.compressedDataUrl\}\s*alt="Comprobante de pago a verificar"/, 'Debe renderizar la imagen del comprobante con la URL de Cloudinary o el fallback comprimido');
  });
});

