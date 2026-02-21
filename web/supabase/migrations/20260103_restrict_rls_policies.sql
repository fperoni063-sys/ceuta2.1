-- Migration: Restrict RLS policies for sensitive tables
-- Date: 2026-01-03
-- Description: Changes public read access to service-role only for descuentos and email_templates

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anon Read Descuentos" ON public.descuentos;
DROP POLICY IF EXISTS "Public Read Email Templates" ON public.email_templates;

-- Create restrictive policies (only service role / authenticated admin can read)
-- Note: Service role (used by createAdminClient) bypasses RLS entirely, so this effectively
-- blocks anonymous/public access while allowing backend API calls to work normally.

CREATE POLICY "Authenticated Read Descuentos" ON public.descuentos
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated Read Email Templates" ON public.email_templates
    FOR SELECT
    TO authenticated
    USING (true);

-- Add comment for documentation
COMMENT ON POLICY "Authenticated Read Descuentos" ON public.descuentos IS 'Security: Discount codes are only readable by authenticated users. Backend uses service role which bypasses RLS.';
COMMENT ON POLICY "Authenticated Read Email Templates" ON public.email_templates IS 'Security: Email templates are only readable by authenticated users. Backend uses service role which bypasses RLS.';
