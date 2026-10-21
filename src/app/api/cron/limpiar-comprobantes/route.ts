import { NextRequest, NextResponse } from 'next/server';
import { dataService } from '@/lib/dataService';

export const dynamic = 'force-dynamic';

/**
 * Endpoint automatizado de limpieza de comprobantes antiguos de Cloudinary y Supabase.
 * Diseñado para invocarse de forma programada mediante Vercel Cron Jobs o manualmente
 * desde el panel de Super Administrador.
 *
 * Flujo:
 * 1. Valida la autorización con CRON_SECRET (Bearer Token).
 * 2. Consulta pedidos con más de 2 días de antigüedad que conserven comprobantes.
 * 3. Destruye el activo de Cloudinary mediante la API segura.
 * 4. Actualiza comprobante_url en Supabase a null (preservando todos los datos del pedido).
 */
async function procesarLimpieza(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const url = new URL(request.url);
  const tokenQuery = url.searchParams.get('token');

  // En producción, si existe CRON_SECRET, validar autenticidad de la petición
  if (cronSecret && cronSecret.trim().length > 0) {
    const tokenRecibido = authHeader?.replace(/^Bearer\s+/i, '') || tokenQuery;
    if (tokenRecibido !== cronSecret) {
      return NextResponse.json(
        {
          error: 'No autorizado. Se requiere un CRON_SECRET válido en la cabecera Authorization o parámetro token.',
          success: false,
        },
        { status: 401 }
      );
    }
  }

  // Permitir especificar días de antigüedad por query param (por defecto 2 días = 48 horas)
  const diasParam = url.searchParams.get('dias');
  const diasAntiguedad = diasParam && !isNaN(parseInt(diasParam, 10))
    ? Math.max(1, parseInt(diasParam, 10))
    : 2;

  try {
    const resumen = await dataService.limpiarComprobantesAntiguos(diasAntiguedad);

    return NextResponse.json({
      success: true,
      mensaje: `Depuración completada exitosamente para comprobantes con más de ${diasAntiguedad} días de antigüedad.`,
      timestamp: new Date().toISOString(),
      resumen,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[API Cron Limpieza Comprobantes] Error:', msg);
    return NextResponse.json(
      {
        success: false,
        error: `Error ejecutando limpieza: ${msg}`,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return procesarLimpieza(request);
}

export async function POST(request: NextRequest) {
  return procesarLimpieza(request);
}
