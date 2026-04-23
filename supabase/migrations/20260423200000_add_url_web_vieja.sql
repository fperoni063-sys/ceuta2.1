-- Agrega la columna url_web_vieja para la automatización de preinscripciones
ALTER TABLE "public"."cursos" ADD COLUMN IF NOT EXISTS "url_web_vieja" text;
