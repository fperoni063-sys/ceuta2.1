-- =====================================================
-- Actualización de constraints de descuento
-- Migración: 20251221_update_discount_constraint_v2.sql
-- =====================================================

-- Eliminar constraints anteriores
ALTER TABLE cursos DROP CONSTRAINT IF EXISTS check_descuento_porcentaje_range;
ALTER TABLE cursos DROP CONSTRAINT IF EXISTS check_descuento_online_porcentaje_range;

-- Crear nuevas constraints permitiendo hasta 100%
ALTER TABLE cursos ADD CONSTRAINT check_descuento_porcentaje_range 
    CHECK (descuento_porcentaje IS NULL OR (descuento_porcentaje > 0 AND descuento_porcentaje <= 100));

ALTER TABLE cursos ADD CONSTRAINT check_descuento_online_porcentaje_range 
    CHECK (descuento_online_porcentaje IS NULL OR (descuento_online_porcentaje > 0 AND descuento_online_porcentaje <= 100));

-- Actualizar comentarios
COMMENT ON COLUMN cursos.descuento_porcentaje IS 'Porcentaje de descuento (1-100). NULL = sin descuento';
