-- Migration: Add 'contacto' estado for early lead capture
-- Created: 2024-12-20
-- Purpose: Allow capturing contact information before full enrollment

-- Drop existing constraint and create new one with additional states
ALTER TABLE inscriptos 
DROP CONSTRAINT IF EXISTS inscriptos_estado_check;

ALTER TABLE inscriptos 
ADD CONSTRAINT inscriptos_estado_check 
CHECK (estado IN ('contacto', 'pendiente', 'pago_pendiente', 'verificando', 'confirmado', 'cancelado'));

-- Add comment for documentation
COMMENT ON COLUMN inscriptos.estado IS 'Estados: contacto (solo datos básicos), pendiente, pago_pendiente, verificando, confirmado, cancelado';
