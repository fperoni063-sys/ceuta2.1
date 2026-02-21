-- ==========================================
-- FIX: Actualizar número de contacto de WhatsApp en templates
-- Migración: 2026-01-06 (2)
-- Motivo: Estandarizar el teléfono de contacto a 59898910715 en todos los emails
-- ==========================================

-- Actualizar el HTML de todos los templates que contengan el número viejo
UPDATE email_templates
SET contenido_html = REPLACE(contenido_html, '59898843651', '59898910715')
WHERE contenido_html LIKE '%59898843651%';

-- Actualizar también el contenido texto plano si lo tiene
UPDATE email_templates
SET contenido_texto = REPLACE(contenido_texto, '098 843 651', '098 910 715')
WHERE contenido_texto LIKE '%098 843 651%';

-- Actualizar también el formato internacional en texto plano si existe
UPDATE email_templates
SET contenido_texto = REPLACE(contenido_texto, '59898843651', '59898910715')
WHERE contenido_texto LIKE '%59898843651%';
