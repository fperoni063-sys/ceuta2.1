-- DATA TYPE: Create docentes table
CREATE TABLE IF NOT EXISTS docentes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  foto_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- DATA TYPE: Add columns to cursos
ALTER TABLE cursos 
ADD COLUMN IF NOT EXISTS docente_id UUID REFERENCES docentes(id),
ADD COLUMN IF NOT EXISTS fecha_a_confirmar BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS lugar_a_confirmar BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS es_inscripcion_anticipada BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cantidad_cuotas INTEGER DEFAULT 1;

-- MIGRATION: Populate docentes from existing text column in cursos
-- This inserts unique teacher names into the docentes table
INSERT INTO docentes (nombre)
SELECT DISTINCT docente 
FROM cursos 
WHERE docente IS NOT NULL AND docente != ''
ON CONFLICT DO NOTHING;

-- RELINK: Update cursos with the new docente_id
UPDATE cursos c
SET docente_id = d.id
FROM docentes d
WHERE c.docente = d.nombre;

-- CLEANUP/OPTIONAL: You might want to keep the old 'docente' column for a bit as backup, 
-- or rename it to 'docente_legacy'. For now, we will leave it but the app should prefer docente_id.
