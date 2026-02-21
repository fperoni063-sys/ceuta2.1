-- Remove unused 'beneficios' field which is not rendered on the frontend
-- Remove legacy 'docente' text field which was replaced by 'docente_id' foreign key
ALTER TABLE cursos
DROP COLUMN IF EXISTS beneficios,
DROP COLUMN IF EXISTS docente;
