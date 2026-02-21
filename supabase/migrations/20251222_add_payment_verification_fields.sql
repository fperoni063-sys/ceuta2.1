-- Add columns to inscriptos table
ALTER TABLE inscriptos
ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT,
ADD COLUMN IF NOT EXISTS comprobante_tipo TEXT CHECK (comprobante_tipo IN ('image', 'pdf')),
ADD COLUMN IF NOT EXISTS revisado_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS revisado_por UUID REFERENCES auth.users(id);

-- Insert new email templates for payment flow safely
INSERT INTO email_templates (nombre, asunto, contenido_html, contenido_texto, descripcion, variables_disponibles, activo, orden_secuencia, horas_despues)
SELECT 'pago_confirmado',
    '¡Pago confirmado! Tu cupo en {{curso_nombre}} está asegurado',
    '<h2>¡Hola {{nombre_corto}}!</h2><p>Hemos verificado tu pago correctamente para el curso <strong>{{curso_nombre}}</strong>.</p><p>Tu cupo está 100% confirmado. Pronto recibirás más información sobre el inicio.</p><p>¡Gracias por elegirnos!</p>',
    '¡Hola {{nombre_corto}}! Hemos verificado tu pago correctamente para el curso {{curso_nombre}}. Tu cupo está 100% confirmado.',
    'Email enviado cuando un admin confirma el pago',
    '["{{nombre}}", "{{nombre_corto}}", "{{curso_nombre}}"]',
    true,
    NULL,
    0
WHERE NOT EXISTS (
    SELECT 1 FROM email_templates WHERE nombre = 'pago_confirmado'
);

INSERT INTO email_templates (nombre, asunto, contenido_html, contenido_texto, descripcion, variables_disponibles, activo, orden_secuencia, horas_despues)
SELECT 'pago_rechazado',
    'Problema con tu comprobante de pago - {{curso_nombre}}',
    '<h2>Hola {{nombre_corto}},</h2><p>Hubo un problema al verificar tu comprobante de pago para <strong>{{curso_nombre}}</strong>.</p><p><strong>Motivo:</strong> {{motivo_rechazo}}</p><p>Por favor, ingresá nuevamente al link de tu inscripción y subí un nuevo comprobante o contactanos.</p><p><a href="{{link_inscripcion}}">SUBIR NUEVO COMPROBANTE</a></p>',
    'Hola {{nombre_corto}}, hubo un problema con tu comprobante de pago para {{curso_nombre}}. Motivo: {{motivo_rechazo}}. Por favor subí uno nuevo en {{link_inscripcion}}',
    'Email enviado cuando un admin rechaza el pago',
    '["{{nombre}}", "{{nombre_corto}}", "{{curso_nombre}}", "{{motivo_rechazo}}", "{{link_inscripcion}}"]',
    true,
    NULL,
    0
WHERE NOT EXISTS (
    SELECT 1 FROM email_templates WHERE nombre = 'pago_rechazado'
);
