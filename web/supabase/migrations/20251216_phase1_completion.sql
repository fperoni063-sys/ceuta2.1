-- Migration: Phase 1 Completion (Storage, RLS, RPC)
-- Created: 2024-12-16
-- Run this in Supabase SQL Editor

-- -----------------------------------------------------------------------------
-- 1. STORAGE BUCKETS
-- -----------------------------------------------------------------------------
-- Create 'cursos' bucket (public) for course images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cursos', 'cursos', true)
ON CONFLICT (id) DO NOTHING;

-- Create 'comprobantes' bucket (private) for payment receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('comprobantes', 'comprobantes', false)
ON CONFLICT (id) DO NOTHING;

-- Policies for 'cursos' bucket
-- Allow public read access
CREATE POLICY "Public Access Cursos" ON storage.objects FOR SELECT
USING ( bucket_id = 'cursos' );

-- Allow authenticated/admin insert/update (we will use service role mainly, which bypasses RLS, but for good measure)
-- Note: Service Role bypasses RLS, so explicit policies for it aren't strictly needed unless we use authenticated user.

-- Policies for 'comprobantes' bucket
-- Allow anon upload (for enrollment form)
CREATE POLICY "Anon Upload Comprobantes" ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'comprobantes' );

-- Read access only for admin (service role) - no policy needed for service role bypass.

-- -----------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscriptos ENABLE ROW LEVEL SECURITY;
ALTER TABLE descuentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonios ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- 2.1 Cursos
-- Public read access
CREATE POLICY "Public Read Cursos" ON cursos FOR SELECT USING (true);
-- Write access only for service_role (implicit)

-- 2.2 Inscriptos
-- Anon insert (for enrollment form)
CREATE POLICY "Anon Insert Inscriptos" ON inscriptos FOR INSERT WITH CHECK (true);
-- Read access only for service_role (implicit) or potentially authenticated user later.

-- 2.3 Descuentos
-- Public read (to validate codes) or better: RPC function to validate without exposing list.
-- Let's allow select for now to check if code exists, but maybe restrict columns in future?
-- For now: Allow select by anon (needed to look up discount code in frontend)
CREATE POLICY "Anon Read Descuentos" ON descuentos FOR SELECT USING (true);

-- 2.4 Testimonios
-- Public read
CREATE POLICY "Public Read Testimonios" ON testimonios FOR SELECT USING (true);

-- 2.5 Configuracion
-- Public read
CREATE POLICY "Public Read Configuracion" ON configuracion FOR SELECT USING (true);


-- -----------------------------------------------------------------------------
-- 3. RPC FUNCTIONS
-- -----------------------------------------------------------------------------

-- Function to validate discount code securely (optional, but good practice)
CREATE OR REPLACE FUNCTION validate_discount_code(p_code TEXT, p_curso_id INT)
RETURNS TABLE (
  valid BOOLEAN,
  tipo VARCHAR,
  valor DECIMAL,
  error_message TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_discount RECORD;
BEGIN
  SELECT * INTO v_discount FROM descuentos WHERE codigo = p_code AND activo = true;
  
  IF v_discount IS NULL THEN
    RETURN QUERY SELECT false, NULL::VARCHAR, NULL::DECIMAL, 'Código no encontrado o inactivo';
    RETURN;
  END IF;

  -- Check dates
  IF v_discount.fecha_inicio IS NOT NULL AND v_discount.fecha_inicio > CURRENT_DATE THEN
    RETURN QUERY SELECT false, NULL::VARCHAR, NULL::DECIMAL, 'Código aún no vigente';
    RETURN;
  END IF;

  IF v_discount.fecha_fin IS NOT NULL AND v_discount.fecha_fin < CURRENT_DATE THEN
    RETURN QUERY SELECT false, NULL::VARCHAR, NULL::DECIMAL, 'Código vencido';
    RETURN;
  END IF;

  -- Check max uses
  IF v_discount.usos_maximos IS NOT NULL AND v_discount.usos_actuales >= v_discount.usos_maximos THEN
    RETURN QUERY SELECT false, NULL::VARCHAR, NULL::DECIMAL, 'Código agotado';
    RETURN;
  END IF;

  -- Check course applicability
  IF v_discount.cursos_aplica IS NOT NULL AND NOT (p_curso_id = ANY(v_discount.cursos_aplica)) THEN
    RETURN QUERY SELECT false, NULL::VARCHAR, NULL::DECIMAL, 'Código no aplicable a este curso';
    RETURN;
  END IF;

  RETURN QUERY SELECT true, v_discount.tipo, v_discount.valor, NULL::TEXT;
END;
$$;

-- Function to increment discount usage
CREATE OR REPLACE FUNCTION increment_discount_usage(p_code TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE descuentos 
  SET usos_actuales = usos_actuales + 1 
  WHERE codigo = p_code;
END;
$$;
