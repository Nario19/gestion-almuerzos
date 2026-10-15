-- ==============================================================================
-- MIGRACIÓN: Atributos y Configuraciones Independientes por Colegio
-- Fecha: 2026-10-14
-- Descripción: Agrega soporte nativo en tabla colegios para grados y observaciones
--              independientes por colegio (JSONB), garantizando aislamiento total.
-- ==============================================================================

-- 1. Agregar columnas grados y observaciones a la tabla colegios si no existen
ALTER TABLE public.colegios
ADD COLUMN IF NOT EXISTS grados jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.colegios
ADD COLUMN IF NOT EXISTS observaciones jsonb DEFAULT '[]'::jsonb;

-- Asegurar columna activo en perfiles_padres
ALTER TABLE public.perfiles_padres
ADD COLUMN IF NOT EXISTS activo boolean NOT NULL DEFAULT true;

-- 2. Poblar grados por defecto en colegios existentes si están vacíos
UPDATE public.colegios
SET grados = '[
  "1.° Primaria A", "1.° Primaria B",
  "2.° Primaria A", "2.° Primaria B",
  "3.° Primaria A", "3.° Primaria B",
  "4.° Primaria A", "4.° Primaria B",
  "5.° Primaria A", "5.° Primaria B",
  "6.° Primaria A", "6.° Primaria B",
  "1.° Secundaria A", "1.° Secundaria B",
  "2.° Secundaria A", "2.° Secundaria B",
  "3.° Secundaria A", "3.° Secundaria B",
  "4.° Secundaria A", "4.° Secundaria B",
  "5.° Secundaria A", "5.° Secundaria B"
]'::jsonb
WHERE grados IS NULL OR grados = '[]'::jsonb;

-- 3. Poblar observaciones rápidas por defecto en colegios existentes si están vacías
UPDATE public.colegios
SET observaciones = '[
  "Sin ají",
  "Poco arroz",
  "Alérgico al maní",
  "Alérgico a mariscos",
  "Dieta blanda"
]'::jsonb
WHERE observaciones IS NULL OR observaciones = '[]'::jsonb;
