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

/** Configuración predeterminada verificada para Cloudinary */
export const CLOUDINARY_DEFAULT_CLOUD_NAME = 'qeqjhqpv';
export const CLOUDINARY_DEFAULT_UPLOAD_PRESET = 'comprobantes_almuerzos';

/**
 * Retorna la carpeta designada en Cloudinary para almacenar fotos de platos.
 * En cumplimiento estricto con la directiva de organización del usuario:
 * Se mantienen únicamente dos carpetas principales en la raíz de Cloudinary:
 * 1. 'comprobantes' -> para los vouchers y comprobantes de pago de los padres.
 * 2. 'platos' -> para todas las fotografías de platos y menús escolares.
 *
 * @param _colegio (opcional, reservado para compatibilidad de firma)
 * @param _dia (opcional, reservado para compatibilidad de firma)
 */
export function obtenerCarpetaCloudinaryPlato(_colegio?: string, _dia?: string): string {
  return 'platos';
}

/**
 * Aplica transformaciones al vuelo en URLs de Cloudinary para optimización máxima de carga:
 * - f_auto: Selecciona automáticamente el formato más eficiente soportado por el navegador (AVIF o WebP).
 * - q_auto: Compresión perceptual inteligente que reduce hasta un 80% del peso sin pérdida visible.
 * - w_600: Limita el ancho a 600px, reduciendo fotos de smartphones de 5MB a ~30KB-50KB.
 * - c_limit: Escala proporcionalmente sin distorsionar ni recortar.
 *
 * @param url URL de la imagen en Cloudinary o fallback local.
 * @param opciones Configuración opcional de ancho y calidad.
 */
export function optimizarUrlCloudinary(
  url?: string | null,
  opciones?: { width?: number; quality?: string }
): string {
  if (!url || typeof url !== 'string') return url || '';
  if (!url.includes('cloudinary.com') || !url.includes('/image/upload/')) return url;
  if (url.includes('f_auto') && url.includes('q_auto')) return url;

  const width = opciones?.width || 600;
  const calidad = opciones?.quality || 'auto';
  const transformacion = `f_auto,q_${calidad},w_${width},c_limit`;

  return url.replace('/image/upload/', `/image/upload/${transformacion}/`);
}

/**
 * Sube una imagen (Blob, File o DataURL Base64) a Cloudinary usando un Upload Preset no firmado (Unsigned).
 * Aplica estrategia de doble canal:
 * 1. Intento directo hacia la API pública de Cloudinary (0 ms de sobrecarga).
 * 2. Si falla en el navegador (por ad-blockers, extensiones o restricciones CORS), recurre de forma transparente al endpoint servidor /api/upload-cloudinary.
 *
 * @param fileODataUrl Archivo Blob, File o DataURL Base64 de la imagen.
 * @param carpeta Subcarpeta de destino en Cloudinary (por defecto: 'comprobantes').
 * @returns La URL segura HTTPS generada por Cloudinary.
 */
export async function subirImagenACloudinary(
  fileODataUrl: Blob | File | string,
  carpeta: string = 'comprobantes'
): Promise<string> {
  const rawCloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    CLOUDINARY_DEFAULT_CLOUD_NAME;
  const rawUploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
    process.env.CLOUDINARY_UPLOAD_PRESET ||
    CLOUDINARY_DEFAULT_UPLOAD_PRESET;

  const cloudName = (rawCloudName || CLOUDINARY_DEFAULT_CLOUD_NAME).replace(/^["']|["']$/g, '').trim();
  const uploadPreset = (rawUploadPreset || CLOUDINARY_DEFAULT_UPLOAD_PRESET).replace(/^["']|["']$/g, '').trim();

  // Normalizar estrictamente a dos únicas carpetas raíz en Cloudinary: 'platos' o 'comprobantes'
  const carpetaDestino = (carpeta && carpeta.toLowerCase().startsWith('plato'))
    ? 'platos'
    : 'comprobantes';

  // Intento 1: Subida directa a Cloudinary
  const subirDirecto = async (): Promise<string> => {
    const formData = new FormData();
    formData.append('file', fileODataUrl);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', carpetaDestino);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorJson: CloudinaryErrorResponse = await res.json().catch(() => ({}));
      const msg = errorJson.error?.message || `Error HTTP ${res.status}: ${res.statusText}`;
      throw new Error(msg);
    }

    const data: CloudinaryUploadResponse = await res.json();
    if (!data.secure_url) {
      throw new Error('Cloudinary no retornó una URL segura válida.');
    }
    return data.secure_url;
  };

  // Intento 2: Subida por proxy interno si estamos en el navegador
  const subirViaApiServidor = async (): Promise<string> => {
    if (typeof window === 'undefined') {
      throw new Error('Entorno no-navegador para proxy');
    }

    const formData = new FormData();
    formData.append('file', fileODataUrl);
    formData.append('folder', carpetaDestino);

    const res = await fetch('/api/upload-cloudinary', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Error HTTP ${res.status} en proxy de servidor`);
    }

    const data = await res.json();
    if (!data.secure_url) {
      throw new Error('Proxy de servidor no retornó secure_url');
    }
    return data.secure_url;
  };

  try {
    return await subirDirecto();
  } catch (errDirecto) {
    console.warn('[Cloudinary] Intento directo falló, usando proxy servidor:', errDirecto);
    try {
      if (typeof window !== 'undefined') {
        return await subirViaApiServidor();
      }
    } catch (errProxy) {
      console.error('[Cloudinary] Intento de proxy servidor también falló:', errProxy);
    }

    // Para comprobantes de pago de padres, mantener contingencia si todo falló
    if (carpeta.startsWith('comprobantes') && typeof fileODataUrl === 'string' && fileODataUrl.startsWith('data:image')) {
      console.warn('[Cloudinary] Usando respaldo local para no perder el pedido del padre.');
      return fileODataUrl;
    }

    const msg = errDirecto instanceof Error ? errDirecto.message : String(errDirecto);
    throw new Error(`Error al subir imagen a Cloudinary: ${msg}`);
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

