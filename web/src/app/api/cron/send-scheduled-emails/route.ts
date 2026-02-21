import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/services/emailService';
import { processTemplate } from '@/lib/utils/templateProcessor';

// Tipos para la respuesta de la base de datos
interface Inscripto {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    access_token: string | null;
    estado: string;
    cursos: {
        nombre: string;
        precio: number | null;
    } | null;
}

interface ScheduledEmail {
    id: number;
    inscripto_id: number;
    template_nombre: string;
    retry_count: number;
    inscriptos: Inscripto; // Supabase devuelve un objeto simple por relación 1:1 o M:1
}

// Verificar que viene del cron de Vercel
function isValidCronRequest(request: NextRequest): boolean {
    const authHeader = request.headers.get('authorization');
    return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: NextRequest) {
    // Verificar autorización en producción
    if (process.env.NODE_ENV === 'production' && !isValidCronRequest(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // Obtener emails pendientes O fallidos con menos de 3 intentos
    // Usamos .or() para combinar condiciones
    const { data: rawEmails, error } = await supabase
        .from('scheduled_emails')
        .select(`
            id,
            inscripto_id,
            template_nombre,
            retry_count,
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
        .lte('enviar_en', now)
        .or('estado.eq.pending,and(estado.eq.failed,retry_count.lt.3)')
        .limit(50);

    if (error) {
        console.error('Error fetching scheduled emails:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Casting seguro gracias a la validación de estructura de Supabase + Interfaces
    const pendingEmails = rawEmails as unknown as ScheduledEmail[] | null;

    if (!pendingEmails || pendingEmails.length === 0) {
        return NextResponse.json({ message: 'No pending emails', processed: 0 });
    }

    let processed = 0;
    let skipped = 0;
    let failed = 0;

    for (const scheduled of pendingEmails) {
        const inscripto = scheduled.inscriptos;

        if (!inscripto) {
            console.error(`Inscripto not found for scheduled email ${scheduled.id}`);
            // Marcar como cancelado para no reintentar infinitamente si se borró el usuario
            await supabase
                .from('scheduled_emails')
                .update({ estado: 'cancelled', last_error: 'Inscripto not found' })
                .eq('id', scheduled.id);
            skipped++;
            continue;
        }

        // Saltar si ya pagó (y no es un email de confirmación de pago, unque esos no suelen programarse así)
        if (inscripto.estado === 'pagado' || inscripto.estado === 'confirmado') {
            await supabase
                .from('scheduled_emails')
                .update({ estado: 'cancelled', last_error: 'Already paid or confirmed' })
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
            // Incrementar retry count para evitar loop infinito rápido, aunque es un error de config
            await supabase
                .from('scheduled_emails')
                .update({
                    estado: 'failed',
                    last_error: `Template ${scheduled.template_nombre} not found`,
                    retry_count: (scheduled.retry_count || 0) + 1
                })
                .eq('id', scheduled.id);
            failed++;
            continue;
        }

        // Preparar contexto
        const context = {
            inscripto: {
                id: inscripto.id,
                nombre: inscripto.nombre,
                email: inscripto.email,
                telefono: inscripto.telefono,
                access_token: inscripto.access_token || '',
            },
            curso: {
                nombre: inscripto.cursos?.nombre || 'Curso CEUTA',
                precio: inscripto.cursos?.precio ?? undefined,
            },
        };

        try {
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

            if (result.success) {
                // Marcar como enviado
                await supabase
                    .from('scheduled_emails')
                    .update({
                        estado: 'sent',
                        last_error: null
                    })
                    .eq('id', scheduled.id);
                processed++;
            } else {
                throw new Error(result.error ? JSON.stringify(result.error) : 'Send failed');
            }

        } catch (err) {
            console.error(`Failed to send email ${scheduled.id}:`, err);
            // Manejo de reintentos
            const newRetryCount = (scheduled.retry_count || 0) + 1;
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';

            await supabase
                .from('scheduled_emails')
                .update({
                    estado: 'failed',
                    retry_count: newRetryCount,
                    last_error: errorMessage
                })
                .eq('id', scheduled.id);
            failed++;
        }
    }

    console.log(`📧 Cron completed: ${processed} sent, ${skipped} skipped, ${failed} failed`);

    return NextResponse.json({
        message: 'Cron completed',
        processed,
        skipped,
        failed,
        total: pendingEmails.length,
    });
}

