-- Migración: Agregar tabla programa_clases y campo teoricas_presenciales
-- Fecha: 2025-12-20

-- Agregar campo a cursos para indicar si las teóricas son presenciales (curso 100% presencial)
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS teoricas_presenciales BOOLEAN DEFAULT FALSE;

-- Crear tabla programa_clases
CREATE TABLE IF NOT EXISTS programa_clases (
    id SERIAL PRIMARY KEY,
    curso_id INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    numero INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'teorico' CHECK (tipo IN ('teorico', 'practico')),
    practica_presencial BOOLEAN DEFAULT FALSE,
    practica_virtual BOOLEAN DEFAULT FALSE,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas por curso
CREATE INDEX IF NOT EXISTS idx_programa_clases_curso ON programa_clases(curso_id);

-- Habilitar RLS
ALTER TABLE programa_clases ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública (cualquiera puede ver el programa)
CREATE POLICY "Lectura pública programa_clases" 
    ON programa_clases 
    FOR SELECT 
    USING (true);

-- Política de escritura solo para usuarios autenticados
CREATE POLICY "Escritura autenticada programa_clases" 
    ON programa_clases 
    FOR ALL 
    USING (auth.role() = 'authenticated');

-- Comentarios
COMMENT ON TABLE programa_clases IS 'Clases individuales del programa de cada curso';
COMMENT ON COLUMN programa_clases.tipo IS 'teorico o practico';
COMMENT ON COLUMN programa_clases.practica_presencial IS 'Solo aplica si tipo=practico. True si la práctica tiene opción presencial';
COMMENT ON COLUMN programa_clases.practica_virtual IS 'Solo aplica si tipo=practico. True si la práctica tiene opción virtual';
