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

/**
 * Genera un hash SHA-1 criptográfico compatible con Node.js y navegadores modernos
 * para firmar peticiones autenticadas de administración a la API de Cloudinary.
 */
export async function generarSha1(texto: string): Promise<string> {
  if (typeof window === 'undefined') {
    // Entorno de servidor Node.js
    const cryptoModule = await import('crypto');
    return cryptoModule.createHash('sha1').update(texto).digest('hex');
  } else if (typeof crypto !== 'undefined' && crypto.subtle) {
    // Entorno navegador o Edge runtime moderno
    const buffer = new TextEncoder().encode(texto);
    const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  throw new Error('No crypto provider available');
}

/**
 * Extrae con estricta seguridad el public_id de un comprobante alojado en Cloudinary.
 * Solo procesa URLs que contengan la carpeta 'comprobantes/' y rechaza terminantemente
 * fotos de platos ('platos/...') u otros activos para evitar cualquier purga accidental de menús.
 *
 * @param url URL pública de Cloudinary
 * @returns El public_id (ej. 'comprobantes/abc123xyz') o null si no califica.
 */
export function extraerPublicIdComprobante(url?: string | null): string | null {
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
}

/**
 * Elimina definitivamente una imagen en Cloudinary mediante su endpoint seguro de destrucción.
 * Requiere las variables privadas CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET configuradas en el servidor.
 *
 * @param publicId Identificador público de la imagen (ej: 'comprobantes/abc123xyz')
 */
export async function eliminarImagenDeCloudinary(
  publicId: string
): Promise<{ success: boolean; result?: string; error?: string }> {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey =
    process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName) {
    return { success: false, error: 'CLOUDINARY_CLOUD_NAME no configurado.' };
  }

  if (!apiKey || !apiSecret) {
    console.warn(
      '[Cloudinary] Para purgar automáticamente imágenes en Cloudinary se requieren las variables CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en el servidor.'
    );
    return {
      success: false,
      error: 'Credenciales CLOUDINARY_API_KEY y/o CLOUDINARY_API_SECRET no configuradas en el servidor.',
    };
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const cadenaParaFirma = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = await generarSha1(cadenaParaFirma);

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || (data.result !== 'ok' && data.result !== 'not found')) {
      const msg = data.error?.message || data.result || `Error HTTP ${res.status}`;
      return { success: false, error: msg };
    }

    return { success: true, result: data.result };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Cloudinary] Error destruyendo imagen ${publicId}:`, msg);
    return { success: false, error: msg };
  }
}

