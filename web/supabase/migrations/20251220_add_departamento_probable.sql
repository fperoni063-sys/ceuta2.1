-- Add departamento_probable field to cursos table
-- This allows admins to specify a probable department when exact location is TBD

ALTER TABLE cursos
ADD COLUMN IF NOT EXISTS departamento_probable VARCHAR(50) DEFAULT NULL;

COMMENT ON COLUMN cursos.departamento_probable IS 'Departamento probable cuando el lugar exacto está a confirmar';
