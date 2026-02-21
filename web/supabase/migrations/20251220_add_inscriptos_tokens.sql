-- Migration: Add access_token and token_expires_at to inscriptos table
-- Created: 2024-12-20
-- Purpose: Allow magic link restoration of enrollment sessions and duplicate checks

ALTER TABLE inscriptos
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE;

-- Add index on access_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_inscriptos_access_token ON inscriptos(access_token);

-- Add comment
COMMENT ON COLUMN inscriptos.access_token IS 'Token unico para recuperar la sesion de inscripcion';
COMMENT ON COLUMN inscriptos.token_expires_at IS 'Fecha de expiracion del token de recuperacion';
