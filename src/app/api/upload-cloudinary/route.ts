import { NextRequest, NextResponse } from 'next/server';
import { CLOUDINARY_DEFAULT_CLOUD_NAME, CLOUDINARY_DEFAULT_UPLOAD_PRESET } from '@/lib/cloudinaryService';

export const dynamic = 'force-dynamic';

/**
 * Route handler proxy para subir imágenes directamente a Cloudinary desde el servidor.
 * Evita bloqueos de ad-blockers, extensiones de privacidad y restricciones CORS
 * en los navegadores de los usuarios.
 */
export async function POST(request: NextRequest) {
  try {
    const rawCloudName =
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      CLOUDINARY_DEFAULT_CLOUD_NAME;
    const rawUploadPreset =
      process.env.CLOUDINARY_UPLOAD_PRESET ||
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      CLOUDINARY_DEFAULT_UPLOAD_PRESET;

    const cloudName = (rawCloudName || CLOUDINARY_DEFAULT_CLOUD_NAME).replace(/^["']|["']$/g, '').trim();
    const uploadPreset = (rawUploadPreset || CLOUDINARY_DEFAULT_UPLOAD_PRESET).replace(/^["']|["']$/g, '').trim();

    const contentType = request.headers.get('content-type') || '';
    let fileContent: string | Blob | null = null;
    let folder: 'comprobantes' | 'platos' = 'comprobantes';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      fileContent = formData.get('file') as Blob | string | null;
      const folderParam = formData.get('folder');
      if (typeof folderParam === 'string' && folderParam.trim()) {
        const norm = folderParam.trim().toLowerCase();
        folder = norm.startsWith('plato') ? 'platos' : 'comprobantes';
      }
    } else if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      fileContent = body.file || null;
      if (typeof body.folder === 'string' && body.folder.trim()) {
        const norm = body.folder.trim().toLowerCase();
        folder = norm.startsWith('plato') ? 'platos' : 'comprobantes';
      }
    }

    if (!fileContent) {
      return NextResponse.json(
        { error: 'No se recibió ningún archivo o dato de imagen para subir a Cloudinary.' },
        { status: 400 }
      );
    }

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', fileContent);
    cloudinaryFormData.append('upload_preset', uploadPreset);
    if (folder) {
      cloudinaryFormData.append('folder', folder);
    }

    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: cloudinaryFormData,
    });

    const data = await cloudinaryRes.json().catch(() => ({}));

    if (!cloudinaryRes.ok || !data.secure_url) {
      const errorMsg = data.error?.message || `Error HTTP ${cloudinaryRes.status} al subir a Cloudinary`;
      console.error('[API upload-cloudinary] Error en Cloudinary:', errorMsg);
      return NextResponse.json({ error: errorMsg }, { status: cloudinaryRes.status || 500 });
    }

    return NextResponse.json({
      success: true,
      secure_url: data.secure_url,
      public_id: data.public_id,
      format: data.format,
      bytes: data.bytes,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[API upload-cloudinary] Excepción:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
