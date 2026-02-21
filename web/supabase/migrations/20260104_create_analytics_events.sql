-- Migration: Create analytics_events table
-- Created: 2026-01-04
-- Purpose: Track user events for internal analytics (funnel, engagement, friction)

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Identificación de Sesión
    session_id TEXT NOT NULL,           -- Cookie anónima
    
    -- Contexto
    page_path TEXT,                      -- Ej: '/cursos/hongos-medicinales'
    course_id INT,                       -- FK opcional a cursos
    
    -- Evento
    event_name TEXT NOT NULL,            -- Ej: 'enrollment_step_1_view'
    event_category TEXT,                 -- 'funnel', 'engagement', 'error'
    
    -- Datos Adicionales
    metadata JSONB DEFAULT '{}'::jsonb,  -- Payload flexible
    
    -- Atribución
    utm_source TEXT,                     -- ?utm_source=instagram
    utm_medium TEXT,
    utm_campaign TEXT,
    referrer TEXT                        -- Página anterior
);

-- Índices para queries rápidas
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_course ON analytics_events(course_id);

-- RLS: Allow insert for anon (via server or client if needed, but we use admin client in server action mostly)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can do everything
CREATE POLICY "Admin All Analytics" ON analytics_events
    USING (true)
    WITH CHECK (true);

-- Policy: Anon can insert (if we decide to use client-side insert directly, though plan says Server Action)
-- Even with Server Action, if we use createClient() (anon) instead of createAdminClient(), we need this.
-- Let's enabling public insert for now to be safe with standard client usage if needed.
CREATE POLICY "Anon Insert Analytics" ON analytics_events
    FOR INSERT
    WITH CHECK (true);
