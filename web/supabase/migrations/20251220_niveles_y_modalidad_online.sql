-- Migración: Sistema de Multi-Nivel y Variantes de Modalidad
-- Fecha: 2025-12-20

-- 1. Agregar columna 'niveles' como array de texto
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS niveles text[] DEFAULT '{}';

-- 2. Migrar datos existentes de 'nivel' a 'niveles'
UPDATE public.cursos 
SET niveles = ARRAY[nivel] 
WHERE nivel IS NOT NULL AND nivel != '' AND (niveles IS NULL OR niveles = '{}');

-- 3. Agregar soporte para variante online de cursos híbridos
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS permite_online boolean DEFAULT false;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS precio_online numeric;

-- 4. Comentarios para documentación
COMMENT ON COLUMN public.cursos.niveles IS 'Array de niveles: basico, intermedio, avanzado. Un curso puede tener múltiples.';
COMMENT ON COLUMN public.cursos.permite_online IS 'Para cursos híbridos: indica si se puede cursar 100% online (sin prácticas presenciales).';
COMMENT ON COLUMN public.cursos.precio_online IS 'Precio alternativo para modalidad 100% online (si aplica).';
