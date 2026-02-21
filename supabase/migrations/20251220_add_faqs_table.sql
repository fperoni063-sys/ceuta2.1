-- Migración: Sistema de Preguntas Frecuentes (FAQs) para Cursos
-- Fecha: 2025-12-20
-- Descripción: Crea tabla faqs_cursos con soporte para FAQs globales y específicas por curso

-- Crear tabla faqs_cursos
CREATE TABLE IF NOT EXISTS public.faqs_cursos (
  id SERIAL PRIMARY KEY,
  curso_id INTEGER REFERENCES public.cursos(id) ON DELETE CASCADE,
  -- Si curso_id es NULL, la FAQ es global y aplica a todos los cursos
  pregunta TEXT NOT NULL,
  respuesta TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_faqs_cursos_curso_id ON public.faqs_cursos(curso_id);
CREATE INDEX IF NOT EXISTS idx_faqs_cursos_activo ON public.faqs_cursos(activo);
CREATE INDEX IF NOT EXISTS idx_faqs_cursos_orden ON public.faqs_cursos(orden);

-- Habilitar RLS
ALTER TABLE public.faqs_cursos ENABLE ROW LEVEL SECURITY;

-- Policy: Lectura pública para FAQs activas
CREATE POLICY "FAQs activas son visibles por todos"
ON public.faqs_cursos FOR SELECT
USING (activo = true);

-- Policy: Escritura solo para usuarios autenticados (admin)
CREATE POLICY "Solo usuarios autenticados pueden modificar FAQs"
ON public.faqs_cursos FOR ALL
USING (auth.role() = 'authenticated');

-- Comentarios para documentación
COMMENT ON TABLE public.faqs_cursos IS 'Preguntas frecuentes para cursos. Si curso_id es NULL, la FAQ es global.';
COMMENT ON COLUMN public.faqs_cursos.curso_id IS 'FK a cursos. NULL indica FAQ global que aparece en todos los cursos.';
COMMENT ON COLUMN public.faqs_cursos.orden IS 'Orden de visualización. Menor número = primero.';
