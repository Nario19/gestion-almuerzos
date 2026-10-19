-- ==============================================================================
-- MIGRACIÓN: Sigla Personalizada por Colegio para Códigos de Pedidos
-- Fecha: 2026-10-19
-- Descripción: Agrega soporte para sigla de 2 a 5 letras en la tabla colegios
--              garantizando generación dinámica de identificadores (#CLA-001, etc.).
-- ==============================================================================

ALTER TABLE public.colegios
ADD COLUMN IF NOT EXISTS sigla VARCHAR(10);

-- Actualizar siglas por defecto para colegios pre-existentes si no tienen valor
UPDATE public.colegios
SET sigla = 'CLA'
WHERE (nombre ILIKE '%claretiano%') AND (sigla IS NULL OR sigla = '');

UPDATE public.colegios
SET sigla = 'CSA'
WHERE (nombre ILIKE '%san agustin%' OR nombre ILIKE '%san agustín%') AND (sigla IS NULL OR sigla = '');

UPDATE public.colegios
SET sigla = 'CSR'
WHERE (nombre ILIKE '%santa rosa%') AND (sigla IS NULL OR sigla = '');

UPDATE public.colegios
SET sigla = 'CLS'
WHERE (nombre ILIKE '%la salle%') AND (sigla IS NULL OR sigla = '');

UPDATE public.colegios
SET sigla = 'INC'
WHERE (nombre ILIKE '%inmaculada%') AND (sigla IS NULL OR sigla = '');
