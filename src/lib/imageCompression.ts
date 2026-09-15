/**
 * Utilidad de compresión de imágenes en el cliente.
 * Reduce capturas de pantalla de 2MB-5MB a ~50KB-80KB en formato WebP antes de subirlas.
 */

export interface CompressionResult {
  compressedDataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  reductionPercentage: number;
}

export async function compressImage(
  file: File,
  maxWidth: number = 800,
  quality: number = 0.75
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const originalSizeKb = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Calcular dimensiones manteniendo la relación de aspecto
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el contexto de canvas'));
          return;
        }

        // Dibujar y comprimir
        ctx.drawImage(img, 0, 0, width, height);

        // Intentar exportar como WebP, con fallback a JPEG
        let compressedDataUrl = canvas.toDataURL('image/webp', quality);
        if (!compressedDataUrl.startsWith('data:image/webp')) {
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Calcular tamaño aproximado a partir de base64
        const base64Length = compressedDataUrl.length - (compressedDataUrl.indexOf(',') + 1);
        const compressedSizeKb = Math.round((base64Length * 3) / 4 / 1024);
        const reductionPercentage = Math.round(
          ((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100
        );

        resolve({
          compressedDataUrl,
          originalSizeKb,
          compressedSizeKb,
          reductionPercentage: Math.max(0, reductionPercentage),
        });
      };

      img.onerror = () => reject(new Error('Error al decodificar la imagen'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}
