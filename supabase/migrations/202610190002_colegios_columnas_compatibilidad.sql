-- ==============================================================================
-- MIGRACIÓN: Compatibilidad Total de Columnas en Tabla Colegios
-- Fecha: 2026-10-19
-- Descripción: Agrega de forma idempotente las columnas opcionales 'grados',
--              'observaciones' y 'sigla' a public.colegios y notifica a PostgREST
--              para recargar el schema cache inmediatamente.
-- ==============================================================================

-- 1. Agregar columnas opcionales si no existen
ALTER TABLE public.colegios
ADD COLUMN IF NOT EXISTS grados jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.colegios
ADD COLUMN IF NOT EXISTS observaciones jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.colegios
ADD COLUMN IF NOT EXISTS sigla varchar(10);

-- 2. Poblar grados por defecto en colegios existentes si están vacíos
UPDATE public.colegios
SET grados = '[
  "1.° Primaria", "2.° Primaria", "3.° Primaria", "4.° Primaria",
  "5.° Primaria A", "5.° Primaria B", "6.° Primaria",
  "1.° Secundaria (7mo)", "2.° Secundaria (8vo)", "3.° Secundaria (9no C)",
  "3.° Secundaria (9no A)", "4.° Secundaria", "5.° Secundaria"
]'::jsonb
WHERE grados IS NULL OR grados = '[]'::jsonb;

-- 3. Poblar observaciones por defecto si están vacías
UPDATE public.colegios
SET observaciones = '[
  "Sin cebolla", "Poca crema", "Sin ensalada", "Presa sin piel", "Solo segundo"
]'::jsonb
WHERE observaciones IS NULL OR observaciones = '[]'::jsonb;

-- 4. Recargar el schema cache de PostgREST en Supabase
NOTIFY pgrst, 'reload schema';
