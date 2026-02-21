-- Add retry count and tracking for robustness
ALTER TABLE scheduled_emails 
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_error TEXT;

COMMENT ON COLUMN scheduled_emails.retry_count IS 'Número de intentos fallidos';
COMMENT ON COLUMN scheduled_emails.last_error IS 'Último mensaje de error registrado';
