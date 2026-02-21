# Sistema de Recordatorio - Parte 3: Frontend y Automatización

---

## 10. Página Personal del Usuario

### 10.1 Página `/mi-inscripcion/[token]`

```tsx
// Archivo: src/app/mi-inscripcion/[token]/page.tsx (NUEVO)

import { notFound } from 'next/navigation';
import { MiInscripcionClient } from './MiInscripcionClient';

interface PageProps {
    params: { token: string };
}

async function getInscripcion(token: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/mi-inscripcion/${token}`, {
        cache: 'no-store',
    });
    
    if (!res.ok) return null;
    return res.json();
}

export default async function MiInscripcionPage({ params }: PageProps) {
    const result = await getInscripcion(params.token);
    
    if (!result?.success) {
        notFound();
    }
    
    return <MiInscripcionClient data={result.data} token={params.token} />;
}

export async function generateMetadata({ params }: PageProps) {
    return {
        title: 'Mi Preinscripción - CEUTA',
        robots: 'noindex, nofollow', // No indexar páginas personales
    };
}
```

### 10.2 Componente Cliente

```tsx
// Archivo: src/app/mi-inscripcion/[token]/MiInscripcionClient.tsx (NUEVO)

'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface InscripcionData {
    id: number;
    nombre: string;
    email: string;
    estado: 'pendiente' | 'pagado' | 'confirmado' | 'cancelado';
    metodo_pago: string;
    fecha_inscripcion: string;
    curso: {
        id: number;
        nombre: string;
        precio: number;
        mercadopago_link?: string;
        fecha_inicio?: string;
        modalidad?: string;
        ubicacion?: string;
    };
}

interface Props {
    data: InscripcionData;
    token: string;
}

export function MiInscripcionClient({ data, token }: Props) {
    // Guardar token en cookie para reconocimiento futuro
    useEffect(() => {
        document.cookie = `ceuta_inscripcion=${token}; max-age=${60 * 60 * 24 * 30}; path=/`;
        document.cookie = `ceuta_nombre=${encodeURIComponent(data.nombre.split(' ')[0])}; max-age=${60 * 60 * 24 * 30}; path=/`;
    }, [token, data.nombre]);

    const isPendiente = data.estado === 'pendiente';
    const isPagado = data.estado === 'pagado' || data.estado === 'confirmado';

    return (
        <main className="min-h-screen bg-gradient-to-b from-cream-50 to-white py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="text-sage-600 hover:text-sage-700">
                        ← Volver a CEUTA
                    </Link>
                    <h1 className="text-3xl font-serif text-walnut-800 mt-4">
                        Tu Preinscripción
                    </h1>
                </div>

                {/* Card principal */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Estado */}
                    <div className={`px-6 py-4 ${
                        isPagado 
                            ? 'bg-green-50 border-b border-green-100' 
                            : 'bg-amber-50 border-b border-amber-100'
                    }`}>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">
                                {isPagado ? '✅' : '⏳'}
                            </span>
                            <div>
                                <p className={`font-semibold ${
                                    isPagado ? 'text-green-800' : 'text-amber-800'
                                }`}>
                                    {isPagado 
                                        ? 'Inscripción Confirmada' 
                                        : 'Pendiente de Pago'
                                    }
                                </p>
                                <p className={`text-sm ${
                                    isPagado ? 'text-green-600' : 'text-amber-600'
                                }`}>
                                    {isPagado 
                                        ? '¡Ya estás inscripto! Te esperamos.' 
                                        : 'Completá el pago para confirmar tu lugar.'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Datos del curso */}
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-walnut-800 mb-4">
                            {data.curso.nombre}
                        </h2>
                        
                        <div className="grid gap-3 text-walnut-600">
                            <div className="flex justify-between">
                                <span>📅 Inicio:</span>
                                <span className="font-medium">
                                    {data.curso.fecha_inicio || 'A confirmar'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>📍 Modalidad:</span>
                                <span className="font-medium">
                                    {data.curso.modalidad || 'Presencial'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>💰 Inversión:</span>
                                <span className="font-medium">
                                    ${data.curso.precio?.toLocaleString('es-UY')}/mes
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Opciones de pago (solo si pendiente) */}
                    {isPendiente && (
                        <div className="p-6 bg-cream-50 border-t">
                            <h3 className="font-semibold text-walnut-800 mb-4">
                                💳 Opciones de Pago
                            </h3>
                            
                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Mercado Pago */}
                                {data.curso.mercadopago_link && (
                                    <a
                                        href={data.curso.mercadopago_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                                    >
                                        💳 Pagar con Mercado Pago
                                    </a>
                                )}
                                
                                {/* Transferencia */}
                                <button
                                    onClick={() => {
                                        // Mostrar modal con datos de transferencia
                                        alert(`Datos para transferencia:\n\nBanco: BROU\nTitular: CEUTA\n\nEnviá el comprobante por WhatsApp al 098 843 651`);
                                    }}
                                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                                >
                                    🏦 Transferencia Bancaria
                                </button>
                            </div>
                            
                            {/* Seña de prueba */}
                            <div className="mt-6 p-4 bg-white rounded-lg border border-sage-200">
                                <p className="text-sm text-walnut-600 mb-2">
                                    🎯 <strong>¿Querés probar primero?</strong>
                                </p>
                                <p className="text-sm text-walnut-500 mb-3">
                                    Pagá una seña de $500 para asistir a la primera clase. 
                                    Si te convence, se descuenta de la primera cuota.
                                </p>
                                <a
                                    href="https://wa.me/59898843651?text=Hola!%20Quiero%20pagar%20la%20seña%20de%20$500%20para%20probar%20el%20curso"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-sm text-sage-600 hover:text-sage-700 font-medium"
                                >
                                    💬 Consultar por seña →
                                </a>
                            </div>
                        </div>
                    )}

                    {/* WhatsApp */}
                    <div className="p-6 border-t text-center">
                        <p className="text-walnut-500 text-sm mb-3">
                            ¿Tenés dudas?
                        </p>
                        <a
                            href="https://wa.me/59898843651"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                        >
                            💬 Escribinos por WhatsApp
                        </a>
                    </div>
                </div>

                {/* Info personal */}
                <div className="mt-6 p-4 bg-cream-100 rounded-lg text-sm text-walnut-600">
                    <p><strong>Nombre:</strong> {data.nombre}</p>
                    <p><strong>Email:</strong> {data.email}</p>
                    <p><strong>Fecha de preinscripción:</strong> {
                        new Date(data.fecha_inscripcion).toLocaleDateString('es-UY')
                    }</p>
                </div>
            </div>
        </main>
    );
}
```

---

## 11. Sistema de Cookies y Banner de Reconocimiento

### 11.1 Hook para detectar inscripción

```typescript
// Archivo: src/lib/hooks/useInscripcionCookie.ts (NUEVO)

'use client';

import { useState, useEffect } from 'react';

interface InscripcionCookie {
    token: string | null;
    nombre: string | null;
    hasInscripcion: boolean;
}

export function useInscripcionCookie(): InscripcionCookie {
    const [cookie, setCookie] = useState<InscripcionCookie>({
        token: null,
        nombre: null,
        hasInscripcion: false,
    });

    useEffect(() => {
        const cookies = document.cookie.split(';').reduce((acc, curr) => {
            const [key, value] = curr.trim().split('=');
            acc[key] = value;
            return acc;
        }, {} as Record<string, string>);

        const token = cookies['ceuta_inscripcion'] || null;
        const nombre = cookies['ceuta_nombre'] 
            ? decodeURIComponent(cookies['ceuta_nombre']) 
            : null;

        setCookie({
            token,
            nombre,
            hasInscripcion: !!token,
        });
    }, []);

    return cookie;
}

export function clearInscripcionCookie(): void {
    document.cookie = 'ceuta_inscripcion=; max-age=0; path=/';
    document.cookie = 'ceuta_nombre=; max-age=0; path=/';
}
```

### 11.2 Banner de Reconocimiento

```tsx
// Archivo: src/components/InscripcionBanner.tsx (NUEVO)

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useInscripcionCookie, clearInscripcionCookie } from '@/lib/hooks/useInscripcionCookie';

export function InscripcionBanner() {
    const { hasInscripcion, nombre, token } = useInscripcionCookie();
    const [dismissed, setDismissed] = useState(false);

    if (!hasInscripcion || dismissed) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50">
            <div className="bg-white rounded-xl shadow-xl border border-sage-200 p-4 animate-slide-up">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">👋</span>
                    <div className="flex-1">
                        <p className="font-medium text-walnut-800">
                            ¡Hola de nuevo{nombre ? `, ${nombre}` : ''}!
                        </p>
                        <p className="text-sm text-walnut-600 mt-1">
                            Tu preinscripción está pendiente de pago.
                        </p>
                        <div className="flex gap-2 mt-3">
                            <Link
                                href={`/mi-inscripcion/${token}`}
                                className="bg-sage-600 hover:bg-sage-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Ver mi inscripción
                            </Link>
                            <button
                                onClick={() => setDismissed(true)}
                                className="text-walnut-400 hover:text-walnut-600 px-2 text-sm"
                            >
                                Ahora no
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            clearInscripcionCookie();
                            setDismissed(true);
                        }}
                        className="text-walnut-400 hover:text-walnut-600"
                        title="No mostrar más"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}
```

### 11.3 Agregar el banner al layout

```tsx
// Archivo: src/app/layout.tsx (MODIFICAR)

// Agregar al final del body, antes del cierre:
import { InscripcionBanner } from '@/components/InscripcionBanner';

// Dentro del return, antes de </body>:
<InscripcionBanner />
```

---

## 12. Cron Job para Emails Programados

### 12.1 API Route para el Cron

```typescript
// Archivo: src/app/api/cron/send-scheduled-emails/route.ts (NUEVO)

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/services/emailService';
import { processTemplate } from '@/lib/utils/templateProcessor';

// Verificar que viene del cron de Vercel
function isValidCronRequest(request: NextRequest): boolean {
    const authHeader = request.headers.get('authorization');
    return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: NextRequest) {
    // Verificar autorización
    if (process.env.NODE_ENV === 'production' && !isValidCronRequest(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // Obtener emails pendientes que ya deben enviarse
    const { data: pendingEmails, error } = await supabase
        .from('scheduled_emails')
        .select(`
            id,
            inscripto_id,
            template_nombre,
            inscriptos (
                id,
                nombre,
                email,
                telefono,
                access_token,
                estado,
                cursos (
                    nombre,
                    precio
                )
            )
        `)
        .eq('estado', 'pending')
        .lte('enviar_en', now)
        .limit(50); // Procesar en lotes

    if (error) {
        console.error('Error fetching scheduled emails:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!pendingEmails || pendingEmails.length === 0) {
        return NextResponse.json({ message: 'No pending emails', processed: 0 });
    }

    let processed = 0;
    let skipped = 0;

    for (const scheduled of pendingEmails) {
        const inscripto = scheduled.inscriptos as any;
        
        // Saltar si ya pagó
        if (inscripto.estado === 'pagado' || inscripto.estado === 'confirmado') {
            await supabase
                .from('scheduled_emails')
                .update({ estado: 'cancelled' })
                .eq('id', scheduled.id);
            skipped++;
            continue;
        }

        // Obtener template
        const { data: template } = await supabase
            .from('email_templates')
            .select('*')
            .eq('nombre', scheduled.template_nombre)
            .single();

        if (!template) {
            console.error(`Template not found: ${scheduled.template_nombre}`);
            continue;
        }

        // Preparar contexto
        const context = {
            inscripto: {
                id: inscripto.id,
                nombre: inscripto.nombre,
                email: inscripto.email,
                telefono: inscripto.telefono,
                access_token: inscripto.access_token,
            },
            curso: {
                nombre: inscripto.cursos?.nombre || 'Curso CEUTA',
                precio: inscripto.cursos?.precio,
            },
        };

        // Procesar template
        const emailHtml = processTemplate(template.contenido_html, context);
        const emailText = processTemplate(template.contenido_texto, context);
        const emailSubject = processTemplate(template.asunto, context);

        // Enviar email
        const result = await sendEmail({
            to: inscripto.email,
            subject: emailSubject,
            html: emailHtml,
            text: emailText,
        }, inscripto.id, scheduled.template_nombre);

        // Marcar como enviado
        await supabase
            .from('scheduled_emails')
            .update({ estado: result.success ? 'sent' : 'failed' })
            .eq('id', scheduled.id);

        if (result.success) processed++;
    }

    return NextResponse.json({
        message: 'Cron completed',
        processed,
        skipped,
        total: pendingEmails.length,
    });
}
```

### 12.2 Configuración de Vercel Cron

```json
// Archivo: vercel.json (CREAR O MODIFICAR)

{
    "crons": [
        {
            "path": "/api/cron/send-scheduled-emails",
            "schedule": "0 * * * *"
        }
    ]
}
```

> [!NOTE]
> El cron se ejecuta cada hora (minuto 0). Vercel Hobby permite 2 crons.
> Agregar `CRON_SECRET` a las variables de entorno de Vercel.

---

## 13. Admin: Editor de Templates

### 13.1 API para gestionar templates

```typescript
// Archivo: src/app/api/admin/email-templates/route.ts (NUEVO)

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET: Listar todos los templates
export async function GET() {
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('orden_secuencia', { ascending: true, nullsFirst: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ templates: data });
}

// PUT: Actualizar un template
export async function PUT(request: NextRequest) {
    const body = await request.json();
    const { id, asunto, contenido_html, contenido_texto, activo } = body;

    if (!id) {
        return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
        .from('email_templates')
        .update({
            asunto,
            contenido_html,
            contenido_texto,
            activo,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
```

### 13.2 Página de admin para editar templates

```tsx
// Archivo: src/app/admin/email-templates/page.tsx (NUEVO)

'use client';

import { useState, useEffect } from 'react';

interface EmailTemplate {
    id: number;
    nombre: string;
    asunto: string;
    contenido_html: string;
    contenido_texto: string;
    descripcion: string;
    variables_disponibles: string[];
    activo: boolean;
    orden_secuencia: number | null;
    horas_despues: number | null;
}

export default function EmailTemplatesPage() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [selected, setSelected] = useState<EmailTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    async function fetchTemplates() {
        const res = await fetch('/api/admin/email-templates');
        const data = await res.json();
        setTemplates(data.templates || []);
        setLoading(false);
    }

    async function saveTemplate() {
        if (!selected) return;
        setSaving(true);

        await fetch('/api/admin/email-templates', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selected),
        });

        setSaving(false);
        fetchTemplates();
    }

    if (loading) {
        return <div className="p-8">Cargando...</div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">📧 Templates de Email</h1>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Lista de templates */}
                <div className="lg:col-span-1 space-y-2">
                    {templates.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setSelected(t)}
                            className={`w-full text-left p-4 rounded-lg border transition-colors ${
                                selected?.id === t.id
                                    ? 'bg-sage-100 border-sage-400'
                                    : 'bg-white hover:bg-cream-50 border-gray-200'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{t.nombre}</span>
                                {t.orden_secuencia && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {t.horas_despues}h
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{t.descripcion}</p>
                        </button>
                    ))}
                </div>

                {/* Editor */}
                {selected && (
                    <div className="lg:col-span-2 bg-white rounded-lg border p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                Editando: {selected.nombre}
                            </h2>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selected.activo}
                                    onChange={(e) => 
                                        setSelected({ ...selected, activo: e.target.checked })
                                    }
                                />
                                <span className="text-sm">Activo</span>
                            </label>
                        </div>

                        {/* Variables disponibles */}
                        <div className="mb-4 p-3 bg-cream-50 rounded-lg">
                            <p className="text-sm font-medium mb-2">Variables disponibles:</p>
                            <div className="flex flex-wrap gap-2">
                                {selected.variables_disponibles?.map((v) => (
                                    <code key={v} className="text-xs bg-white px-2 py-1 rounded border">
                                        {v}
                                    </code>
                                ))}
                            </div>
                        </div>

                        {/* Asunto */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Asunto</label>
                            <input
                                type="text"
                                value={selected.asunto}
                                onChange={(e) => 
                                    setSelected({ ...selected, asunto: e.target.value })
                                }
                                className="w-full p-3 border rounded-lg"
                            />
                        </div>

                        {/* Contenido HTML */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">
                                Contenido HTML
                            </label>
                            <textarea
                                value={selected.contenido_html}
                                onChange={(e) => 
                                    setSelected({ ...selected, contenido_html: e.target.value })
                                }
                                rows={15}
                                className="w-full p-3 border rounded-lg font-mono text-sm"
                            />
                        </div>

                        {/* Contenido Texto */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">
                                Contenido Texto (fallback)
                            </label>
                            <textarea
                                value={selected.contenido_texto}
                                onChange={(e) => 
                                    setSelected({ ...selected, contenido_texto: e.target.value })
                                }
                                rows={8}
                                className="w-full p-3 border rounded-lg font-mono text-sm"
                            />
                        </div>

                        <button
                            onClick={saveTemplate}
                            disabled={saving}
                            className="w-full bg-sage-600 hover:bg-sage-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
```

---

Continúa en Parte 4...
