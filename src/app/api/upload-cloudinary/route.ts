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
    const rawPlatosPreset =
      process.env.CLOUDINARY_PLATOS_PRESET ||
      process.env.NEXT_PUBLIC_CLOUDINARY_PLATOS_PRESET ||
      'platos_almuerzos';

    const cloudName = (rawCloudName || CLOUDINARY_DEFAULT_CLOUD_NAME).replace(/^["']|["']$/g, '').trim();
    const uploadPresetComprobantes = (rawUploadPreset || CLOUDINARY_DEFAULT_UPLOAD_PRESET).replace(/^["']|["']$/g, '').trim();
    const uploadPresetPlatos = (rawPlatosPreset || 'platos_almuerzos').replace(/^["']|["']$/g, '').trim();

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

    const presetPrincipal = folder === 'platos' ? uploadPresetPlatos : uploadPresetComprobantes;

    const intentarSubida = async (presetNombre: string) => {
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', fileContent as Blob | string);
      cloudinaryFormData.append('upload_preset', presetNombre);
      cloudinaryFormData.append('folder', folder);
      cloudinaryFormData.append('asset_folder', folder);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: cloudinaryFormData,
      });

      const resJson = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data: resJson };
    };

    let intento = await intentarSubida(presetPrincipal);

    // Fallback a comprobantes_almuerzos si platos_almuerzos no está creado aún en Cloudinary
    if (!intento.ok && folder === 'platos' && intento.data?.error?.message?.toLowerCase().includes('not found')) {
      intento = await intentarSubida(uploadPresetComprobantes);
    }

    if (!intento.ok || !intento.data?.secure_url) {
      const errorMsg = intento.data?.error?.message || `Error HTTP ${intento.status} al subir a Cloudinary`;
      console.error('[API upload-cloudinary] Error en Cloudinary:', errorMsg);
      return NextResponse.json({ error: errorMsg }, { status: intento.status || 500 });
    }

    const data = intento.data;

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
