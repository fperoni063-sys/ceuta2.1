-- Migration to add video_url column to cursos table
ALTER TABLE public.cursos
ADD COLUMN IF NOT EXISTS video_url text;
