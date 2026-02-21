-- Migration: Enhance inscriptos table with additional form fields
-- Created: 2024-12-17
-- Purpose: Add fields to match CEUTA official enrollment form

-- Add new columns to inscriptos table
ALTER TABLE inscriptos 
ADD COLUMN IF NOT EXISTS edad INTEGER,
ADD COLUMN IF NOT EXISTS departamento VARCHAR(50),
ADD COLUMN IF NOT EXISTS direccion TEXT,
ADD COLUMN IF NOT EXISTS como_se_entero VARCHAR(100),
ADD COLUMN IF NOT EXISTS recibir_novedades BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN inscriptos.edad IS 'Edad del inscripto';
COMMENT ON COLUMN inscriptos.departamento IS 'Departamento o Otro país';
COMMENT ON COLUMN inscriptos.direccion IS 'Dirección del inscripto';
COMMENT ON COLUMN inscriptos.como_se_entero IS 'Cómo se enteró del curso';
COMMENT ON COLUMN inscriptos.recibir_novedades IS 'Suscripción a newsletter';
