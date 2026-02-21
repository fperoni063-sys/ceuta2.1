-- Migration: Fix inscriptos foreign key to allow course deletion
-- Created: 2025-12-17
-- Problem: Cannot delete courses that have enrollments (inscriptos) due to FK constraint
-- Solution: Add ON DELETE CASCADE to inscriptos.curso_id

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE inscriptos 
DROP CONSTRAINT IF EXISTS inscriptos_curso_id_fkey;

-- Step 2: Re-add the foreign key with ON DELETE CASCADE
ALTER TABLE inscriptos 
ADD CONSTRAINT inscriptos_curso_id_fkey 
FOREIGN KEY (curso_id) 
REFERENCES cursos(id) 
ON DELETE CASCADE;

-- This means: when a course is deleted, all related enrollments (inscriptos) 
-- will be automatically deleted as well.
