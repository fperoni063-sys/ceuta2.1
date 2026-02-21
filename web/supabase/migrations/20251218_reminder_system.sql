-- ==========================================
-- SISTEMA DE RECORDATORIO DE PREINSCRIPCIONES
-- Migración: 2025-12-18
-- ==========================================

-- ==========================================
-- 1. MODIFICAR TABLA INSCRIPTOS
-- ==========================================

-- Agregar columnas para sistema de tokens y tracking
ALTER TABLE inscriptos 
ADD COLUMN IF NOT EXISTS access_token VARCHAR(64) UNIQUE,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS veces_visitado INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ultima_visita TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS emails_enviados INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ultimo_email_enviado TIMESTAMP WITH TIME ZONE;

-- Crear índice para búsqueda rápida por token
CREATE INDEX IF NOT EXISTS idx_inscriptos_access_token 
ON inscriptos(access_token);

-- Comentarios
COMMENT ON COLUMN inscriptos.access_token IS 'Token único para acceso sin login (link mágico)';
COMMENT ON COLUMN inscriptos.token_expires_at IS 'Fecha de expiración del token';
COMMENT ON COLUMN inscriptos.veces_visitado IS 'Contador de visitas a la página personal';
COMMENT ON COLUMN inscriptos.ultima_visita IS 'Última vez que visitó su página';
COMMENT ON COLUMN inscriptos.emails_enviados IS 'Cantidad de emails de seguimiento enviados';
COMMENT ON COLUMN inscriptos.ultimo_email_enviado IS 'Fecha del último email enviado';

-- ==========================================
-- 2. TABLA EMAIL_TEMPLATES
-- ==========================================

CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    asunto TEXT NOT NULL,
    contenido_html TEXT NOT NULL,
    contenido_texto TEXT NOT NULL,
    descripcion TEXT,
    variables_disponibles JSONB DEFAULT '[]'::jsonb,
    activo BOOLEAN DEFAULT true,
    orden_secuencia INTEGER,
    horas_despues INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para orden
CREATE INDEX IF NOT EXISTS idx_email_templates_orden 
ON email_templates(orden_secuencia);

-- RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Email Templates" ON email_templates FOR SELECT USING (true);

-- Comentarios
COMMENT ON TABLE email_templates IS 'Templates de email editables desde el admin';
COMMENT ON COLUMN email_templates.nombre IS 'Identificador del template (ej: confirmacion, recordatorio_24h)';
COMMENT ON COLUMN email_templates.orden_secuencia IS 'Orden en la secuencia automática (null = no es parte de secuencia)';
COMMENT ON COLUMN email_templates.horas_despues IS 'Horas después de inscripción para enviar este email';
COMMENT ON COLUMN email_templates.variables_disponibles IS 'Lista de variables que se pueden usar: {{nombre}}, {{curso}}, etc.';

-- ==========================================
-- 3. TABLA EMAIL_LOGS
-- ==========================================

CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,
    inscripto_id INTEGER REFERENCES inscriptos(id) ON DELETE CASCADE,
    template_nombre VARCHAR(100),
    email_destino VARCHAR(255) NOT NULL,
    asunto TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'pending',
    error_mensaje TEXT,
    enviado_at TIMESTAMP WITH TIME ZONE,
    abierto_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_email_logs_inscripto 
ON email_logs(inscripto_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_estado 
ON email_logs(estado);

-- RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Comentarios
COMMENT ON COLUMN email_logs.estado IS 'pending, sent, failed, opened, clicked';

-- ==========================================
-- 4. TABLA SCHEDULED_EMAILS
-- ==========================================

CREATE TABLE IF NOT EXISTS scheduled_emails (
    id SERIAL PRIMARY KEY,
    inscripto_id INTEGER REFERENCES inscriptos(id) ON DELETE CASCADE,
    template_nombre VARCHAR(100) NOT NULL,
    enviar_en TIMESTAMP WITH TIME ZONE NOT NULL,
    estado VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para el cron job
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_pending 
ON scheduled_emails(enviar_en) 
WHERE estado = 'pending';

-- RLS
ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;

-- Comentarios
COMMENT ON TABLE scheduled_emails IS 'Cola de emails programados para envío futuro';
COMMENT ON COLUMN scheduled_emails.estado IS 'pending, sent, cancelled';

-- ==========================================
-- 5. FUNCIÓN RPC PARA INCREMENTAR EMAILS
-- ==========================================

CREATE OR REPLACE FUNCTION increment_emails_enviados(p_inscripto_id INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE inscriptos 
    SET 
        emails_enviados = COALESCE(emails_enviados, 0) + 1,
        ultimo_email_enviado = NOW()
    WHERE id = p_inscripto_id;
END;
$$;

-- ==========================================
-- 6. INSERTAR TEMPLATES POR DEFECTO
-- ==========================================

-- Template de Confirmación (inmediato)
INSERT INTO email_templates (nombre, asunto, contenido_html, contenido_texto, descripcion, variables_disponibles, orden_secuencia, horas_despues)
VALUES (
    'confirmacion',
    '✅ Tu preinscripción a {{curso_nombre}} está confirmada',
    '<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2d6a4f; margin: 0;">CEUTA</h1>
            <p style="color: #6b7280; margin: 5px 0;">Centro Uruguayo de Tecnologías Apropiadas</p>
        </div>
        <h2 style="color: #3d2914;">¡Hola {{nombre_corto}}! 🌱</h2>
        <p style="font-size: 16px; color: #374151;">
            Recibimos tu preinscripción al curso <strong>{{curso_nombre}}</strong>.
        </p>
        <p style="font-size: 16px; color: #374151;">
            Tu lugar está reservado. Solo falta completar el pago para confirmar definitivamente tu inscripción.
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{link_inscripcion}}" 
               style="display: inline-block; background-color: #2d6a4f; color: white; 
                      padding: 16px 32px; text-decoration: none; border-radius: 8px; 
                      font-weight: bold; font-size: 16px;">
                COMPLETAR MI INSCRIPCIÓN
            </a>
        </div>
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #166534; margin-top: 0;">Detalles de tu preinscripción:</h3>
            <ul style="color: #374151; list-style: none; padding: 0; margin: 0;">
                <li style="padding: 5px 0;">📚 <strong>Curso:</strong> {{curso_nombre}}</li>
                <li style="padding: 5px 0;">💰 <strong>Inversión:</strong> {{curso_precio}}/mes</li>
                <li style="padding: 5px 0;">📅 <strong>Inicio:</strong> {{fecha_inicio}}</li>
            </ul>
        </div>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px;">
                ¿Tenés dudas? Escribinos por 
                <a href="https://wa.me/59898843651" style="color: #25D366;">WhatsApp</a>
            </p>
            <p style="color: #9ca3af; font-size: 12px;">CEUTA - Canelones 1198, Montevideo</p>
        </div>
    </div>
</body>
</html>',
    '¡Hola {{nombre_corto}}!

Recibimos tu preinscripción al curso "{{curso_nombre}}".

Tu lugar está reservado. Solo falta completar el pago para confirmar definitivamente tu inscripción.

👉 Completá tu inscripción acá: {{link_inscripcion}}

DETALLES:
- Curso: {{curso_nombre}}
- Inversión: {{curso_precio}}/mes
- Inicio: {{fecha_inicio}}

¿Dudas? WhatsApp: 098 843 651

---
CEUTA - Canelones 1198, Montevideo',
    'Email de confirmación inmediata tras la preinscripción',
    '["{{nombre}}", "{{nombre_corto}}", "{{email}}", "{{telefono}}", "{{curso_nombre}}", "{{curso_precio}}", "{{link_inscripcion}}", "{{fecha_inicio}}"]'::jsonb,
    1,
    0
) ON CONFLICT (nombre) DO NOTHING;

-- Template Recordatorio 24h
INSERT INTO email_templates (nombre, asunto, contenido_html, contenido_texto, descripcion, variables_disponibles, orden_secuencia, horas_despues)
VALUES (
    'recordatorio_24h',
    '{{nombre_corto}}, tu lugar en {{curso_nombre}} te está esperando',
    '<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 16px;">
        <h2 style="color: #3d2914;">Solo un recordatorio amigable...</h2>
        <p style="color: #374151; font-size: 16px;">
            Hola {{nombre_corto}}, vimos que te preinscribiste a <strong>{{curso_nombre}}</strong> 
            pero todavía no completaste tu inscripción.
        </p>
        <p style="color: #374151; font-size: 16px;">🤔 <strong>¿Tenés alguna duda?</strong></p>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>❓ "¿Puedo pagar mes a mes?"</strong><br>
            <span style="color: #6b7280;">→ Sí, el pago es mensual. Sin compromiso a largo plazo.</span></p>
            <p style="margin: 10px 0;"><strong>❓ "¿Qué pasa si no puedo ir a una clase?"</strong><br>
            <span style="color: #6b7280;">→ Las clases quedan grabadas para que las veas después.</span></p>
            <p style="margin: 10px 0;"><strong>❓ "¿Tiene certificado?"</strong><br>
            <span style="color: #6b7280;">→ Sí, certificado oficial de CEUTA al completar el curso.</span></p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{link_inscripcion}}" 
               style="display: inline-block; background-color: #2d6a4f; color: white; 
                      padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                COMPLETAR INSCRIPCIÓN
            </a>
        </div>
        <p style="color: #9ca3af; font-size: 14px; text-align: center;">
            Si decidiste no inscribirte, no hay problema.
        </p>
    </div>
</body>
</html>',
    'Solo un recordatorio amigable...

Hola {{nombre_corto}}, vimos que te preinscribiste a "{{curso_nombre}}" 
pero todavía no completaste tu inscripción.

¿Tenés alguna duda?

❓ "¿Puedo pagar mes a mes?"
→ Sí, el pago es mensual. Sin compromiso a largo plazo.

❓ "¿Qué pasa si no puedo ir a una clase?"
→ Las clases quedan grabadas para que las veas después.

❓ "¿Tiene certificado?"
→ Sí, certificado oficial de CEUTA.

👉 Completá tu inscripción: {{link_inscripcion}}

---
CEUTA',
    'Recordatorio suave después de 24 horas',
    '["{{nombre}}", "{{nombre_corto}}", "{{curso_nombre}}", "{{link_inscripcion}}", "{{curso_precio}}"]'::jsonb,
    2,
    24
) ON CONFLICT (nombre) DO NOTHING;

-- Template Urgencia 72h
INSERT INTO email_templates (nombre, asunto, contenido_html, contenido_texto, descripcion, variables_disponibles, orden_secuencia, horas_despues)
VALUES (
    'urgencia_72h',
    '⚠️ {{nombre_corto}}, quedan pocos lugares para {{curso_nombre}}',
    '<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 16px;">
        <h2 style="color: #3d2914;">{{nombre_corto}}, 📊 actualización de tu curso:</h2>
        <p style="color: #374151; font-size: 16px;">
            Queríamos avisarte que el curso <strong>"{{curso_nombre}}"</strong> 
            está recibiendo muchas inscripciones.
        </p>
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">💬 Lo que dicen nuestros estudiantes:</h3>
            <blockquote style="border-left: 3px solid #f59e0b; padding-left: 15px; margin: 15px 0; font-style: italic; color: #78350f;">
                "El mejor curso que hice. Los profes son increíbles y el contenido muy práctico."
                <br><strong>— María G., egresada 2024</strong>
            </blockquote>
            <blockquote style="border-left: 3px solid #f59e0b; padding-left: 15px; margin: 15px 0; font-style: italic; color: #78350f;">
                "Me cambió la perspectiva profesional. 100% recomendado."
                <br><strong>— Carlos R., egresado 2024</strong>
            </blockquote>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{link_inscripcion}}" 
               style="display: inline-block; background-color: #dc2626; color: white; 
                      padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                ASEGURAR MI LUGAR
            </a>
        </div>
    </div>
</body>
</html>',
    '{{nombre_corto}}, actualización de tu curso:

El curso "{{curso_nombre}}" está recibiendo muchas inscripciones.

💬 Lo que dicen nuestros estudiantes:

"El mejor curso que hice. Los profes son increíbles."
— María G., egresada 2024

"Me cambió la perspectiva profesional."
— Carlos R., egresada 2024

👉 Asegurá tu lugar: {{link_inscripcion}}

---
CEUTA',
    'Email de urgencia con prueba social',
    '["{{nombre_corto}}", "{{curso_nombre}}", "{{link_inscripcion}}"]'::jsonb,
    3,
    72
) ON CONFLICT (nombre) DO NOTHING;

-- Template Última Oportunidad 7 días
INSERT INTO email_templates (nombre, asunto, contenido_html, contenido_texto, descripcion, variables_disponibles, orden_secuencia, horas_despues)
VALUES (
    'ultima_oportunidad_7d',
    'Tu preinscripción expira pronto',
    '<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 16px;">
        <h2 style="color: #3d2914;">{{nombre_corto}},</h2>
        <p style="color: #374151; font-size: 16px;">
            Tu preinscripción a <strong>{{curso_nombre}}</strong> expira en las próximas horas.
        </p>
        <p style="color: #374151; font-size: 16px;">
            Después de eso, tendrías que volver a preinscribirte (si quedan lugares disponibles).
        </p>
        <div style="background-color: #fee2e2; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
            <p style="color: #991b1b; font-size: 18px; margin: 0;">
                ⏰ <strong>Este es el último aviso</strong>
            </p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{link_inscripcion}}" 
               style="display: inline-block; background-color: #2d6a4f; color: white; 
                      padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                COMPLETAR INSCRIPCIÓN
            </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
            P.D.: Si hay algo que te frena, respondé este email. Queremos ayudarte.
        </p>
    </div>
</body>
</html>',
    '{{nombre_corto}},

Tu preinscripción a "{{curso_nombre}}" expira en las próximas horas.

Después de eso, tendrías que volver a preinscribirte (si quedan lugares).

⏰ Este es el último aviso.

👉 Completá tu inscripción: {{link_inscripcion}}

P.D.: Si hay algo que te frena, respondé este email. Queremos ayudarte.

---
CEUTA',
    'Último email antes de que expire la preinscripción',
    '["{{nombre_corto}}", "{{curso_nombre}}", "{{link_inscripcion}}"]'::jsonb,
    4,
    168
) ON CONFLICT (nombre) DO NOTHING;
