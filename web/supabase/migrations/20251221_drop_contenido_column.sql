-- =====================================================
-- Eliminar columna 'contenido' de la tabla cursos
-- Migración: 20251221_drop_contenido_column.sql
-- =====================================================
-- RAZÓN: Este campo fue reemplazado por la tabla 'programa_clases'
--        que permite gestionar clases individuales con tipo, orden, etc.
-- =====================================================

-- Paso 1: Eliminar la columna 'contenido'
ALTER TABLE cursos DROP COLUMN IF EXISTS contenido;

-- Nota: Los datos del programa ahora se gestionan en la tabla programa_clases
-- con la siguiente estructura:
--   - curso_id: FK al curso
--   - numero: número de clase (1, 2, 3...)
--   - titulo: título de la clase
--   - tipo: 'teorico' o 'practico'
--   - practica_presencial: boolean
--   - practica_virtual: boolean
--   - orden: orden de visualización
--   - activo: visibilidad
