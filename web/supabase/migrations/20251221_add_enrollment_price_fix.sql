-- Add new columns to inscriptos table to lock in price and modality
ALTER TABLE inscriptos 
ADD COLUMN IF NOT EXISTS precio_pagado integer,
ADD COLUMN IF NOT EXISTS modalidad_seleccionada text;

-- Data Fix: Update Hongos course online price to 3000 so that 60% off = 1200
-- Assuming the course name contains 'Hongos'
UPDATE cursos 
SET precio_online = 3000 
WHERE nombre ILIKE '%hongos%' AND precio_online IS NOT NULL;
