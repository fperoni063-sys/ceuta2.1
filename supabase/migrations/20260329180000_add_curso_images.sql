ALTER TABLE "public"."cursos" 
ADD COLUMN IF NOT EXISTS "imagen_portada" text,
ADD COLUMN IF NOT EXISTS "galeria" text[] DEFAULT '{}';
