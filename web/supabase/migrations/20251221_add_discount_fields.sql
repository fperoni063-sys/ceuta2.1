-- Add discount related fields to cursos table

ALTER TABLE cursos 
ADD COLUMN IF NOT EXISTS descuento_porcentaje INTEGER CHECK (descuento_porcentaje >= 0 AND descuento_porcentaje <= 100),
ADD COLUMN IF NOT EXISTS descuento_cupos_totales INTEGER CHECK (descuento_cupos_totales >= 0),
ADD COLUMN IF NOT EXISTS descuento_cupos_usados INTEGER DEFAULT 0 CHECK (descuento_cupos_usados >= 0),
ADD COLUMN IF NOT EXISTS descuento_etiqueta TEXT,
ADD COLUMN IF NOT EXISTS descuento_fecha_fin TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS descuento_online_porcentaje INTEGER CHECK (descuento_online_porcentaje >= 0 AND descuento_online_porcentaje <= 100),
ADD COLUMN IF NOT EXISTS descuento_online_etiqueta TEXT;

-- Update constraint to ensure cupos_usados does not exceed cupos_totales if set
ALTER TABLE cursos 
DROP CONSTRAINT IF EXISTS check_descuento_cupos;

ALTER TABLE cursos
ADD CONSTRAINT check_descuento_cupos 
CHECK (
  (descuento_cupos_totales IS NULL) OR 
  (descuento_cupos_usados <= descuento_cupos_totales)
);
