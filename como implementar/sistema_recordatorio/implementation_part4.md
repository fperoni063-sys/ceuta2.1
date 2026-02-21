# Sistema de Recordatorio - Parte 4: Marketing Avanzado y Checklist

---

## 14. Estrategias de Marketing Implementables

### 14.1 Exit Intent Popup

```tsx
// Archivo: src/components/ExitIntentPopup.tsx (NUEVO)

'use client';

import { useState, useEffect } from 'react';
import { useInscripcionCookie } from '@/lib/hooks/useInscripcionCookie';

export function ExitIntentPopup() {
    const [show, setShow] = useState(false);
    const { hasInscripcion, token } = useInscripcionCookie();

    useEffect(() => {
        // Solo mostrar si tiene inscripción pendiente
        if (!hasInscripcion) return;

        // Detectar intención de salir (mouse sale por arriba)
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY < 10) {
                // Verificar si ya se mostró en esta sesión
                const shown = sessionStorage.getItem('exitPopupShown');
                if (!shown) {
                    setShow(true);
                    sessionStorage.setItem('exitPopupShown', 'true');
                }
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, [hasInscripcion]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-up">
                <div className="text-center">
                    <span className="text-5xl">🤚</span>
                    <h2 className="text-2xl font-serif text-walnut-800 mt-4">
                        ¡Esperá!
                    </h2>
                    <p className="text-walnut-600 mt-2">
                        ¿Te quedó alguna duda sobre el curso?
                    </p>
                </div>

                <div className="mt-6 space-y-3">
                    <a
                        href="https://wa.me/59898843651"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium"
                    >
                        💬 Escribinos por WhatsApp
                    </a>
                    
                    <a
                        href={`/mi-inscripcion/${token}`}
                        className="flex items-center justify-center gap-2 w-full bg-sage-600 hover:bg-sage-700 text-white py-3 rounded-lg font-medium"
                    >
                        Ver mi preinscripción
                    </a>
                    
                    <button
                        onClick={() => setShow(false)}
                        className="w-full text-walnut-400 hover:text-walnut-600 py-2 text-sm"
                    >
                        Seguir navegando
                    </button>
                </div>
            </div>
        </div>
    );
}
```

### 14.2 WhatsApp Automatizado (Webhook)

> [!IMPORTANT]
> Para WhatsApp automatizado se necesita una cuenta de WhatsApp Business API.
> Alternativa más simple: usar la API de WhatsApp Web no oficial (twilio, messagebird).
> O hacerlo manual con notificación a Julia.

```typescript
// Archivo: src/lib/services/whatsappService.ts (NUEVO)

// Opción 1: Generar mensaje para envío manual por Julia
export function generateWhatsAppFollowUp(inscripto: {
    nombre: string;
    telefono: string;
    curso: string;
}): { link: string; message: string } {
    const message = `Hola ${inscripto.nombre.split(' ')[0]}! 👋

Soy de CEUTA. Vi que te preinscribiste al curso "${inscripto.curso}" pero todavía no completaste el pago.

¿Hay algo en lo que pueda ayudarte? 🙂`;

    const cleanPhone = inscripto.telefono.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('598') ? cleanPhone : `598${cleanPhone}`;
    
    return {
        link: `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`,
        message,
    };
}

// Opción 2: Con API de WhatsApp Business (requiere configuración)
export async function sendWhatsAppMessage(
    to: string,
    templateName: string,
    variables: string[]
): Promise<boolean> {
    // Requiere WHATSAPP_BUSINESS_TOKEN y WHATSAPP_PHONE_ID en .env
    const token = process.env.WHATSAPP_BUSINESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (!token || !phoneId) {
        console.log('WhatsApp Business API not configured');
        return false;
    }

    try {
        const response = await fetch(
            `https://graph.facebook.com/v17.0/${phoneId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: to.replace(/\D/g, ''),
                    type: 'template',
                    template: {
                        name: templateName,
                        language: { code: 'es' },
                        components: [{
                            type: 'body',
                            parameters: variables.map(v => ({ type: 'text', text: v })),
                        }],
                    },
                }),
            }
        );

        return response.ok;
    } catch (error) {
        console.error('WhatsApp send error:', error);
        return false;
    }
}
```

### 14.3 Sistema de Descuento Early Bird

```typescript
// Archivo: src/lib/utils/discounts.ts (NUEVO)

/**
 * Calcula si el inscripto es elegible para descuento early bird
 * (dentro de las primeras 48 horas de preinscripción)
 */
export function isEligibleForEarlyBird(inscripcionDate: Date): boolean {
    const now = new Date();
    const hoursElapsed = (now.getTime() - inscripcionDate.getTime()) / (1000 * 60 * 60);
    return hoursElapsed <= 48;
}

/**
 * Calcula el precio con descuento
 */
export function calculateEarlyBirdPrice(
    originalPrice: number,
    discountPercent: number = 10
): { discounted: number; savings: number } {
    const savings = Math.round(originalPrice * (discountPercent / 100));
    return {
        discounted: originalPrice - savings,
        savings,
    };
}

/**
 * Genera el texto del descuento para mostrar
 */
export function getEarlyBirdText(inscripcionDate: Date, originalPrice: number): string | null {
    if (!isEligibleForEarlyBird(inscripcionDate)) return null;

    const { discounted, savings } = calculateEarlyBirdPrice(originalPrice);
    const now = new Date();
    const hoursRemaining = 48 - (now.getTime() - inscripcionDate.getTime()) / (1000 * 60 * 60);
    
    return `🎉 Promo Early Bird: Pagá en las próximas ${Math.floor(hoursRemaining)}h y ahorrá $${savings} (precio: $${discounted}/mes)`;
}
```

### 14.4 Opción "No estoy listo"

```tsx
// Archivo: src/components/NotReadyOptions.tsx (NUEVO)

'use client';

import { useState } from 'react';

interface Props {
    cursoNombre: string;
    onClose: () => void;
}

export function NotReadyOptions({ cursoNombre, onClose }: Props) {
    const [selected, setSelected] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    async function handleSubmit() {
        if (!selected) return;

        // Guardar la razón en la base de datos
        await fetch('/api/inscripcion/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ razon: selected, curso: cursoNombre }),
        });

        setSubmitted(true);
    }

    if (submitted) {
        return (
            <div className="p-6 text-center">
                <span className="text-4xl">✅</span>
                <p className="mt-4 text-walnut-800">
                    ¡Gracias por tu feedback! Te mantendremos informado.
                </p>
                <button
                    onClick={onClose}
                    className="mt-4 text-sage-600 hover:text-sage-700"
                >
                    Cerrar
                </button>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h3 className="text-lg font-medium text-walnut-800 mb-4">
                ¿No es el momento ideal?
            </h3>
            <p className="text-walnut-600 text-sm mb-4">
                No hay problema. Contanos qué te frena para poder ayudarte:
            </p>

            <div className="space-y-2">
                {[
                    { id: 'proximo_grupo', label: 'Avisame cuando empiece el próximo grupo' },
                    { id: 'mas_info', label: 'Quiero más información antes de decidir' },
                    { id: 'precio', label: 'El precio es un problema' },
                    { id: 'tiempo', label: 'No tengo tiempo ahora, pero me interesa' },
                    { id: 'otro', label: 'Otra razón' },
                ].map((option) => (
                    <label
                        key={option.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selected === option.id
                                ? 'bg-sage-50 border-sage-400'
                                : 'bg-white border-gray-200 hover:bg-cream-50'
                        }`}
                    >
                        <input
                            type="radio"
                            name="razon"
                            value={option.id}
                            checked={selected === option.id}
                            onChange={() => setSelected(option.id)}
                            className="accent-sage-600"
                        />
                        <span className="text-walnut-700">{option.label}</span>
                    </label>
                ))}
            </div>

            {selected === 'precio' && (
                <a
                    href="https://wa.me/59898843651?text=Hola!%20Me%20interesa%20el%20curso%20pero%20el%20precio%20es%20un%20problema.%20Tienen%20opciones%20de%20pago?"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-4 text-center bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm"
                >
                    💬 Consultar opciones de financiación
                </a>
            )}

            <button
                onClick={handleSubmit}
                disabled={!selected}
                className="w-full mt-4 bg-sage-600 hover:bg-sage-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Enviar
            </button>
        </div>
    );
}
```

---

## 15. Métricas y Dashboard

### 15.1 API para métricas

```typescript
// Archivo: src/app/api/admin/metrics/inscripciones/route.ts (NUEVO)

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
    const supabase = createAdminClient();

    // Total de preinscripciones
    const { count: totalPreinscripciones } = await supabase
        .from('inscriptos')
        .select('*', { count: 'exact', head: true });

    // Preinscripciones pendientes
    const { count: pendientes } = await supabase
        .from('inscriptos')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente');

    // Pagados
    const { count: pagados } = await supabase
        .from('inscriptos')
        .select('*', { count: 'exact', head: true })
        .in('estado', ['pagado', 'confirmado']);

    // Emails enviados
    const { count: emailsEnviados } = await supabase
        .from('email_logs')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'sent');

    // Tasa de conversión
    const tasaConversion = totalPreinscripciones && totalPreinscripciones > 0
        ? ((pagados || 0) / totalPreinscripciones * 100).toFixed(1)
        : 0;

    // Preinscripciones últimos 7 días
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const { count: ultimos7Dias } = await supabase
        .from('inscriptos')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', hace7Dias.toISOString());

    return NextResponse.json({
        totalPreinscripciones: totalPreinscripciones || 0,
        pendientes: pendientes || 0,
        pagados: pagados || 0,
        tasaConversion: `${tasaConversion}%`,
        emailsEnviados: emailsEnviados || 0,
        ultimos7Dias: ultimos7Dias || 0,
    });
}
```

---

## 16. Garantía con Seña de $500

### 16.1 Actualizar la página de inscripción

Esta funcionalidad ya está incluida en el componente `MiInscripcionClient` (Parte 3).
El flujo es:

1. El usuario ve la opción "¿Querés probar primero?"
2. Hace clic en "Consultar por seña"
3. Lo lleva a WhatsApp con un mensaje predefinido
4. Julia coordina el pago de $500
5. Si el usuario continúa, los $500 se descuentan de la primera cuota

### 16.2 Agregar tracking de señas

```sql
-- Agregar a la migración de inscriptos

ALTER TABLE inscriptos 
ADD COLUMN IF NOT EXISTS tipo_pago VARCHAR(20) DEFAULT 'completo',
ADD COLUMN IF NOT EXISTS monto_sena INTEGER;

COMMENT ON COLUMN inscriptos.tipo_pago IS 'completo, sena, pendiente';
COMMENT ON COLUMN inscriptos.monto_sena IS 'Monto de seña pagado (ej: 500)';
```

---

## 17. Checklist de Implementación

### Fase 1: Fundamentos (Semana 1)

- [ ] **Base de datos**
  - [ ] Ejecutar migración `20251218_add_token_system.sql`
  - [ ] Ejecutar migración `20251218_create_email_templates.sql`
  - [ ] Ejecutar migración `20251218_create_email_logs.sql`
  - [ ] Ejecutar migración `20251218_create_scheduled_emails.sql`
  - [ ] Insertar templates por defecto

- [ ] **Variables de entorno**
  - [ ] Configurar SMTP_HOST, SMTP_PORT
  - [ ] Configurar SMTP_USER (email de CEUTA)
  - [ ] Generar y configurar SMTP_PASSWORD (App Password de Gmail)
  - [ ] Configurar NEXT_PUBLIC_BASE_URL

- [ ] **Código base**
  - [ ] Crear `src/lib/utils/tokens.ts`
  - [ ] Crear `src/lib/utils/templateProcessor.ts`
  - [ ] Crear `src/lib/services/emailService.ts`
  - [ ] Modificar `src/app/api/inscripcion/route.ts`

### Fase 2: Frontend (Semana 1-2)

- [ ] **Página personal**
  - [ ] Crear `src/app/mi-inscripcion/[token]/page.tsx`
  - [ ] Crear `src/app/mi-inscripcion/[token]/MiInscripcionClient.tsx`
  - [ ] Crear API `src/app/api/mi-inscripcion/[token]/route.ts`

- [ ] **Sistema de cookies**
  - [ ] Crear `src/lib/hooks/useInscripcionCookie.ts`
  - [ ] Crear `src/components/InscripcionBanner.tsx`
  - [ ] Agregar banner al layout

### Fase 3: Automatización (Semana 2)

- [ ] **Emails automáticos**
  - [ ] Crear cron route `src/app/api/cron/send-scheduled-emails/route.ts`
  - [ ] Configurar `vercel.json` con el cron
  - [ ] Agregar CRON_SECRET a variables de entorno
  - [ ] Probar envío de emails

- [ ] **Admin**
  - [ ] Crear API `src/app/api/admin/email-templates/route.ts`
  - [ ] Crear página `src/app/admin/email-templates/page.tsx`
  - [ ] Agregar link al menú de admin

### Fase 4: Optimización (Semana 3+)

- [ ] **Marketing avanzado**
  - [ ] Implementar Exit Intent Popup
  - [ ] Implementar opción "No estoy listo"
  - [ ] Configurar métricas

- [ ] **WhatsApp (opcional)**
  - [ ] Evaluar WhatsApp Business API
  - [ ] Configurar si se decide usar

---

## 18. Variables de Entorno Completas

```bash
# .env.local

# ===== EMAIL (SMTP) =====
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=secretaria@ceuta.org.uy
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx  # App Password de Gmail

# ===== URLS =====
NEXT_PUBLIC_BASE_URL=https://ceuta.org.uy

# ===== TOKENS =====
TOKEN_EXPIRY_DAYS=30

# ===== CRON =====
CRON_SECRET=un-secreto-largo-y-seguro-aqui

# ===== WHATSAPP (Opcional) =====
NEXT_PUBLIC_WHATSAPP_JULIA=+59898843651
# WHATSAPP_BUSINESS_TOKEN=  # Solo si usas WhatsApp Business API
# WHATSAPP_PHONE_ID=        # Solo si usas WhatsApp Business API
```

---

## 19. Notas Finales

### Costos Estimados

| Servicio | Plan | Costo |
|----------|------|-------|
| Gmail SMTP | Gratis hasta 500 emails/día | $0 |
| Vercel Cron | Hobby (2 crons) | $0 |
| Supabase | Free tier | $0 |
| **Total** | | **$0/mes** |

### Escalabilidad

Si el volumen de emails crece:
- Gmail SMTP: 500/día → Migrar a SendGrid o Resend (~$20/mes para 50k emails)
- Cron más frecuente: Vercel Pro ($20/mes) permite más crons

### Seguridad

- Los tokens son de 64 caracteres (256 bits de entropía)
- Expiran después de 30 días
- Las páginas personales no están indexadas (noindex)
- Los emails programados se cancelan automáticamente si el usuario paga

---

## 20. Estructura de Archivos Final

```
src/
├── app/
│   ├── api/
│   │   ├── inscripcion/
│   │   │   └── route.ts              (MODIFICAR)
│   │   ├── mi-inscripcion/
│   │   │   └── [token]/
│   │   │       └── route.ts          (NUEVO)
│   │   ├── cron/
│   │   │   └── send-scheduled-emails/
│   │   │       └── route.ts          (NUEVO)
│   │   └── admin/
│   │       ├── email-templates/
│   │       │   └── route.ts          (NUEVO)
│   │       └── metrics/
│   │           └── inscripciones/
│   │               └── route.ts      (NUEVO)
│   │
│   ├── mi-inscripcion/
│   │   └── [token]/
│   │       ├── page.tsx              (NUEVO)
│   │       └── MiInscripcionClient.tsx (NUEVO)
│   │
│   └── admin/
│       └── email-templates/
│           └── page.tsx              (NUEVO)
│
├── components/
│   ├── InscripcionBanner.tsx         (NUEVO)
│   ├── ExitIntentPopup.tsx           (NUEVO)
│   └── NotReadyOptions.tsx           (NUEVO)
│
└── lib/
    ├── hooks/
    │   └── useInscripcionCookie.ts   (NUEVO)
    ├── services/
    │   ├── emailService.ts           (NUEVO)
    │   └── whatsappService.ts        (NUEVO)
    ├── utils/
    │   ├── tokens.ts                 (NUEVO)
    │   ├── templateProcessor.ts      (NUEVO)
    │   ├── discounts.ts              (NUEVO)
    │   └── notifications.ts          (EXISTENTE)
    └── data/
        └── defaultEmailTemplates.ts  (NUEVO)

supabase/
└── migrations/
    ├── 20251218_add_token_system.sql         (NUEVO)
    ├── 20251218_create_email_templates.sql   (NUEVO)
    ├── 20251218_create_email_logs.sql        (NUEVO)
    └── 20251218_create_scheduled_emails.sql  (NUEVO)

vercel.json                                    (CREAR/MODIFICAR)
```

---

**¡Documento completo!** Este plan cubre todo lo discutido y está listo para implementación por cualquier agente o desarrollador.
