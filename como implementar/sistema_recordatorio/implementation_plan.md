# Sistema de Recordatorio de Preinscripciones - CEUTA

## Documento de Implementación Completo

---

## 1. Resumen Ejecutivo

Este documento describe la implementación completa del sistema de recordatorio para preinscriptos de CEUTA. El objetivo es maximizar la conversión de preinscripciones a pagos mediante:

1. **Link mágico por email** - Acceso directo sin necesidad de recordar códigos
2. **Página personalizada** - Estado de inscripción y opciones de pago
3. **Sistema de cookies** - Reconocimiento automático al volver a la web
4. **Emails automáticos** - Secuencia de nurturing integrada en la web
5. **Templates editables** - Administrador puede personalizar mensajes

---

## 2. Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Next.js)                            │
├─────────────────────────────────────────────────────────────────────────┤
│  /mi-inscripcion/[token]     → Página personal del usuario              │
│  /admin/email-templates      → Editor de templates de email             │
│  /admin/inscriptos           → Lista con acciones de reenvío            │
│  Banner de reconocimiento    → Detecta cookie y muestra aviso           │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            API ROUTES                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  POST /api/inscripcion       → Crea inscripción + genera token          │
│  GET  /api/mi-inscripcion    → Obtiene datos por token                  │
│  POST /api/emails/send       → Envía email individual                   │
│  POST /api/emails/schedule   → Programa secuencia automática            │
│  GET  /api/admin/templates   → Lista templates editables                │
│  PUT  /api/admin/templates   → Guarda template modificado               │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          SUPABASE (Backend)                              │
├─────────────────────────────────────────────────────────────────────────┤
│  inscriptos                  → Datos + access_token                     │
│  email_templates             → Templates personalizables                │
│  email_logs                  → Historial de emails enviados             │
│  scheduled_emails            → Cola de emails programados               │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    CRON JOB (Vercel Cron / Edge Function)               │
├─────────────────────────────────────────────────────────────────────────┤
│  Cada hora: revisa scheduled_emails y envía los que correspondan        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Base de Datos - Migraciones SQL

### 3.1 Modificar tabla `inscriptos`

```sql
-- Archivo: supabase/migrations/20251218_add_token_system.sql

-- Agregar columnas para sistema de tokens
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
COMMENT ON COLUMN inscriptos.access_token IS 'Token único para acceso sin login';
COMMENT ON COLUMN inscriptos.token_expires_at IS 'Fecha de expiración del token';
COMMENT ON COLUMN inscriptos.veces_visitado IS 'Contador de visitas a la página personal';
COMMENT ON COLUMN inscriptos.ultima_visita IS 'Última vez que visitó su página';
COMMENT ON COLUMN inscriptos.emails_enviados IS 'Cantidad de emails de seguimiento enviados';
COMMENT ON COLUMN inscriptos.ultimo_email_enviado IS 'Fecha del último email enviado';
```

### 3.2 Crear tabla `email_templates`

```sql
-- Archivo: supabase/migrations/20251218_create_email_templates.sql

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

-- Comentarios
COMMENT ON TABLE email_templates IS 'Templates de email editables desde el admin';
COMMENT ON COLUMN email_templates.nombre IS 'Identificador del template (ej: confirmacion, recordatorio_24h)';
COMMENT ON COLUMN email_templates.orden_secuencia IS 'Orden en la secuencia automática (null = no es parte de secuencia)';
COMMENT ON COLUMN email_templates.horas_despues IS 'Horas después de inscripción para enviar este email';
COMMENT ON COLUMN email_templates.variables_disponibles IS 'Lista de variables que se pueden usar: {{nombre}}, {{curso}}, etc.';
```

### 3.3 Crear tabla `email_logs`

```sql
-- Archivo: supabase/migrations/20251218_create_email_logs.sql

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

-- Comentarios
COMMENT ON COLUMN email_logs.estado IS 'pending, sent, failed, opened, clicked';
```

### 3.4 Crear tabla `scheduled_emails`

```sql
-- Archivo: supabase/migrations/20251218_create_scheduled_emails.sql

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

-- Comentarios
COMMENT ON TABLE scheduled_emails IS 'Cola de emails programados para envío futuro';
COMMENT ON COLUMN scheduled_emails.estado IS 'pending, sent, cancelled';
```

---

## 4. Variables de Entorno Necesarias

Agregar al archivo `.env.local`:

```bash
# Configuración de Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=secretaria@ceuta.org.uy
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx  # App Password de Gmail

# URL base para links
NEXT_PUBLIC_BASE_URL=https://ceuta.org.uy

# Configuración de tokens
TOKEN_EXPIRY_DAYS=30
```

> [!IMPORTANT]
> Para usar Gmail como SMTP, debés:
> 1. Activar verificación en 2 pasos en la cuenta de Google
> 2. Generar una "Contraseña de aplicación" en https://myaccount.google.com/apppasswords
> 3. Usar esa contraseña en SMTP_PASSWORD

---

## 5. Generación de Tokens

### 5.1 Utilidad para generar tokens

```typescript
// Archivo: src/lib/utils/tokens.ts

import crypto from 'crypto';

/**
 * Genera un token seguro de 32 caracteres hexadecimales
 * Usado para el link mágico en emails
 */
export function generateAccessToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Calcula la fecha de expiración del token
 * Por defecto: 30 días desde ahora
 */
export function getTokenExpiry(days: number = 30): Date {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    return expiry;
}

/**
 * Genera el link completo para acceder a la inscripción
 */
export function generateMagicLink(token: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/mi-inscripcion/${token}`;
}
```

---

## 6. Sistema de Emails - Implementación

### 6.1 Servicio de Email

```typescript
// Archivo: src/lib/services/emailService.ts

import nodemailer from 'nodemailer';
import { createAdminClient } from '@/lib/supabase/server';

// Configuración del transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true para 465, false para otros puertos
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export interface EmailData {
    to: string;
    subject: string;
    html: string;
    text: string;
}

/**
 * Envía un email y registra en el log
 */
export async function sendEmail(
    data: EmailData,
    inscriptoId?: number,
    templateNombre?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createAdminClient();
    
    try {
        // Enviar email
        await transporter.sendMail({
            from: '"CEUTA" <secretaria@ceuta.org.uy>',
            to: data.to,
            subject: data.subject,
            html: data.html,
            text: data.text,
        });
        
        // Registrar en log
        if (inscriptoId) {
            await supabase.from('email_logs').insert({
                inscripto_id: inscriptoId,
                template_nombre: templateNombre,
                email_destino: data.to,
                asunto: data.subject,
                estado: 'sent',
                enviado_at: new Date().toISOString(),
            });
            
            // Actualizar contador en inscripto
            await supabase.rpc('increment_emails_enviados', { 
                inscripto_id: inscriptoId 
            });
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        
        // Registrar fallo en log
        if (inscriptoId) {
            await supabase.from('email_logs').insert({
                inscripto_id: inscriptoId,
                template_nombre: templateNombre,
                email_destino: data.to,
                asunto: data.subject,
                estado: 'failed',
                error_mensaje: error instanceof Error ? error.message : 'Unknown error',
            });
        }
        
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        };
    }
}

/**
 * Programa la secuencia de emails para un nuevo inscripto
 */
export async function scheduleEmailSequence(inscriptoId: number): Promise<void> {
    const supabase = createAdminClient();
    
    // Obtener templates de la secuencia ordenados
    const { data: templates } = await supabase
        .from('email_templates')
        .select('nombre, horas_despues')
        .not('orden_secuencia', 'is', null)
        .eq('activo', true)
        .order('orden_secuencia', { ascending: true });
    
    if (!templates) return;
    
    const now = new Date();
    
    // Programar cada email de la secuencia
    for (const template of templates) {
        if (template.horas_despues === 0) {
            // El primer email (confirmación) se envía inmediatamente
            // No lo programamos, lo enviamos directo
            continue;
        }
        
        const enviarEn = new Date(now);
        enviarEn.setHours(enviarEn.getHours() + template.horas_despues);
        
        await supabase.from('scheduled_emails').insert({
            inscripto_id: inscriptoId,
            template_nombre: template.nombre,
            enviar_en: enviarEn.toISOString(),
            estado: 'pending',
        });
    }
}

/**
 * Cancela emails programados (cuando el usuario ya pagó)
 */
export async function cancelScheduledEmails(inscriptoId: number): Promise<void> {
    const supabase = createAdminClient();
    
    await supabase
        .from('scheduled_emails')
        .update({ estado: 'cancelled' })
        .eq('inscripto_id', inscriptoId)
        .eq('estado', 'pending');
}
```

---

Continúa en Parte 2...
