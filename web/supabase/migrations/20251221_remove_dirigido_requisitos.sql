-- Migración: Eliminar columnas dirigido_a y requisitos_previos
-- Razón: Estas secciones no aportan valor en la UI según feedback, se configuran vía FAQs si es necesario.

ALTER TABLE public.cursos 
DROP COLUMN IF EXISTS dirigido_a,
DROP COLUMN IF EXISTS requisitos_previos;
