/**
 * Servicio de integración con Cloudinary para almacenamiento optimizado de imágenes
 * en la nube (comprobantes de pago y fotos de platos).
 *
 * Evita la saturación del almacenamiento de base de datos PostgreSQL en Supabase
 * almacenando únicamente la URL pública segura (https://res.cloudinary.com/...)
 * en lugar de cadenas pesadas en Base64.
 */

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

export interface CloudinaryErrorResponse {
  error?: {
    message: string;
  };
}

/**
 * Genera la ruta de carpeta estructurada en Cloudinary para un plato según colegio y día de la semana.
 * Ejemplo: 'platos/colegio_san_martin/lunes' o 'platos/general/lunes'
 *
 * @param colegio Nombre del colegio (o undefined para platos generales)
 * @param dia Día de la semana (LUNES, MARTES, etc.)
 */
export function obtenerCarpetaCloudinaryPlato(colegio?: string, dia?: string): string {
  const colValido = (colegio && colegio !== 'TODOS' && colegio.trim().length > 0)
    ? colegio
    : 'general';

  const slugCol = colValido
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const slugDia = (dia || 'general')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return `platos/${slugCol || 'general'}/${slugDia || 'menu'}`;
}

/**
 * Sube una imagen (Blob, File o DataURL Base64) a Cloudinary usando un Upload Preset no firmado (Unsigned).
 *
 * @param fileODataUrl Archivo Blob, File o DataURL Base64 de la imagen.
 * @param carpeta Subcarpeta de destino en Cloudinary (por defecto: 'comprobantes').
 * @returns La URL segura HTTPS generada por Cloudinary, o el fallback en Base64 si no está configurado.
 */
export async function subirImagenACloudinary(
  fileODataUrl: Blob | File | string,
  carpeta: string = 'comprobantes'
): Promise<string> {
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || process.env.CLOUDINARY_UPLOAD_PRESET;

  // Si Cloudinary no está configurado en las variables de entorno, aplicar fallback transparente
  if (!cloudName || !uploadPreset) {
    if (typeof fileODataUrl === 'string') {
      return fileODataUrl;
    }
    return '';
  }

  try {
    const formData = new FormData();
    formData.append('file', fileODataUrl);
    formData.append('upload_preset', uploadPreset);
    if (carpeta) {
      formData.append('folder', carpeta);
    }

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorJson: CloudinaryErrorResponse = await res.json().catch(() => ({}));
      const msg = errorJson.error?.message || `Error HTTP ${res.status}: ${res.statusText}`;
      console.error('[Cloudinary] Error en la subida:', msg);

      // Si falla Cloudinary (por ejemplo problemas de red o cuota), mantener la data comprimida como fallback
      // para no frustrar la orden del padre
      if (typeof fileODataUrl === 'string' && fileODataUrl.startsWith('data:image')) {
        console.warn('[Cloudinary] Usando respaldo local temporal para evitar pérdida del pedido.');
        return fileODataUrl;
      }
      throw new Error(`Error al subir imagen a Cloudinary: ${msg}`);
    }

    const data: CloudinaryUploadResponse = await res.json();
    if (!data.secure_url) {
      throw new Error('Cloudinary no retornó una URL segura válida.');
    }

    return data.secure_url;
  } catch (err: unknown) {
    console.error('[Cloudinary] Excepción durante la subida:', err);
    // En caso de fallo de red, si tenemos el string DataURL, fallback de contingencia
    if (typeof fileODataUrl === 'string' && fileODataUrl.startsWith('data:image')) {
      return fileODataUrl;
    }
    throw err;
  }
}
