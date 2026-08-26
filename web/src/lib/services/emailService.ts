import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { createAdminClient } from '@/lib/supabase/server';
import { generateEmailHtml } from '@/lib/utils/email-layout';
import {
    getEmailProviderStatus,
    getFromAddress,
    getSmtpPassword,
    resolveEmailTransport,
    type EmailTransportKind,
} from '@/lib/services/emailTransport';

export { getEmailProviderStatus, STOP_REMINDER_STATES } from '@/lib/services/emailTransport';

export interface EmailData {
    to: string;
    subject: string;
    html: string;
    text: string;
}

async function sendViaResend(data: EmailData, from: string): Promise<string> {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data: result, error } = await resend.emails.send({
        from,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
    });

    if (error) {
        throw new Error(error.message || 'Resend rejected the email');
    }

    return result?.id || 'resend';
}

async function sendViaSmtp(data: EmailData, from: string): Promise<string> {
    const port = Number(process.env.SMTP_PORT) || 587;
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port,
        secure: port === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: getSmtpPassword(),
        },
    });

    const info = await transporter.sendMail({
        from,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
    });

    return info.messageId || 'smtp';
}

async function deliverEmail(data: EmailData): Promise<{ messageId: string; provider: EmailTransportKind }> {
    const provider = resolveEmailTransport();

    if (provider === 'none') {
        throw new Error(
            'Email no configurado: falta RESEND_API_KEY (recomendado) o SMTP_USER + SMTP_PASSWORD'
        );
    }

    const from = getFromAddress(provider);

    if (provider === 'resend') {
        const messageId = await sendViaResend(data, from);
        return { messageId, provider };
    }

    const messageId = await sendViaSmtp(data, from);
    return { messageId, provider };
}

async function logEmailResult(params: {
    inscriptoId?: number;
    templateNombre?: string;
    to: string;
    subject: string;
    success: boolean;
    errorMessage?: string;
}): Promise<void> {
    if (!params.inscriptoId) return;

    const supabase = createAdminClient();

    try {
        await supabase.from('email_logs').insert({
            inscripto_id: params.inscriptoId,
            template_nombre: params.templateNombre,
            email_destino: params.to,
            asunto: params.subject,
            estado: params.success ? 'sent' : 'failed',
            error_mensaje: params.success ? null : params.errorMessage || 'Unknown error',
            enviado_at: params.success ? new Date().toISOString() : null,
        });

        if (params.success) {
            await supabase.rpc('increment_emails_enviados', {
                p_inscripto_id: params.inscriptoId,
            });
        }
    } catch (logError) {
        console.error('Failed to write email_logs:', logError);
    }
}

/**
 * Envía un email (Resend HTTP, o SMTP como fallback) y registra el resultado.
 */
export async function sendEmail(
    data: EmailData,
    inscriptoId?: number,
    templateNombre?: string
): Promise<{ success: boolean; error?: string; provider?: EmailTransportKind }> {
    console.log(`📧 Preparing to send email to: ${data.to}`);

    const status = getEmailProviderStatus();
    if (!status.configured) {
        const error = 'Configuration Error: falta RESEND_API_KEY o credenciales SMTP';
        console.error(`❌ ${error}`);
        await logEmailResult({
            inscriptoId,
            templateNombre,
            to: data.to,
            subject: data.subject,
            success: false,
            errorMessage: error,
        });
        return { success: false, error };
    }

    try {
        const { messageId, provider } = await deliverEmail(data);
        console.log(`✅ Email sent via ${provider}. MessageId: ${messageId}`);

        await logEmailResult({
            inscriptoId,
            templateNombre,
            to: data.to,
            subject: data.subject,
            success: true,
        });

        return { success: true, provider };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Email send error:', error);

        await logEmailResult({
            inscriptoId,
            templateNombre,
            to: data.to,
            subject: data.subject,
            success: false,
            errorMessage: message,
        });

        return { success: false, error: message };
    }
}

/**
 * Programa la secuencia de emails para un nuevo inscripto
 */
export async function scheduleEmailSequence(inscriptoId: number): Promise<void> {
    const supabase = createAdminClient();

    const { data: templates } = await supabase
        .from('email_templates')
        .select('nombre, horas_despues')
        .not('orden_secuencia', 'is', null)
        .eq('activo', true)
        .order('orden_secuencia', { ascending: true });

    if (!templates) return;

    const now = new Date();

    for (const template of templates) {
        if (template.horas_despues === 0) {
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

    console.log(`📧 Email sequence scheduled for inscripto ${inscriptoId}`);
}

/**
 * Cancela emails programados (cuando el usuario ya pagó o subió comprobante)
 */
export async function cancelScheduledEmails(inscriptoId: number): Promise<void> {
    const supabase = createAdminClient();

    await supabase
        .from('scheduled_emails')
        .update({ estado: 'cancelled' })
        .eq('inscripto_id', inscriptoId)
        .eq('estado', 'pending');

    console.log(`🚫 Cancelled scheduled emails for inscripto ${inscriptoId}`);
}

/**
 * Envía email de estado de pago (Confirmado / Rechazado)
 */
export async function sendPaymentStatusEmail(
    inscriptoId: number,
    status: 'approved' | 'rejected',
    rejectReason?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createAdminClient();

    const { data: inscripto, error: inscriptoError } = await supabase
        .from('inscriptos')
        .select(`
            id, nombre, email, access_token, 
            cursos (nombre, slug)
        `)
        .eq('id', inscriptoId)
        .single();

    if (inscriptoError || !inscripto) {
        return { success: false, error: 'Inscripto no encontrado' };
    }

    const templateName = status === 'approved' ? 'pago_confirmado' : 'pago_rechazado';

    const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('nombre', templateName)
        .eq('activo', true)
        .single();

    if (templateError || !template) {
        return { success: false, error: `Template ${templateName} no encontrado` };
    }

    let subject = template.asunto;
    let html = template.contenido_html;
    let text = template.contenido_texto;

    const nombreCorto = inscripto.nombre.split(' ')[0];
    const linkInscripcion = `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL}/mi-inscripcion/${inscripto.access_token}`;

    const cursoNombre = Array.isArray(inscripto.cursos)
        ? inscripto.cursos[0]?.nombre
        : (inscripto.cursos as unknown as { nombre: string })?.nombre || 'Curso';

    const replacements: Record<string, string> = {
        '{{nombre}}': inscripto.nombre,
        '{{nombre_corto}}': nombreCorto,
        '{{curso_nombre}}': cursoNombre,
        '{{link_inscripcion}}': linkInscripcion,
    };

    if (status === 'rejected' && rejectReason) {
        replacements['{{motivo_rechazo}}'] = rejectReason;
    }

    Object.entries(replacements).forEach(([key, value]) => {
        subject = subject.replace(new RegExp(key, 'g'), value);
        html = html.replace(new RegExp(key, 'g'), value);
        text = text.replace(new RegExp(key, 'g'), value);
    });

    return sendEmail({
        to: inscripto.email,
        subject,
        html,
        text,
    }, inscriptoId, templateName);
}

/**
 * Envía email confirmando la recepción del comprobante
 */
export async function sendPaymentProofReceivedEmail(
    inscriptoId: number
): Promise<{ success: boolean; error?: string }> {
    const supabase = createAdminClient();

    const { data: inscripto, error: inscriptoError } = await supabase
        .from('inscriptos')
        .select(`
            id, nombre, email, 
            cursos (nombre)
        `)
        .eq('id', inscriptoId)
        .single();

    if (inscriptoError || !inscripto) {
        return { success: false, error: 'Inscripto no encontrado' };
    }

    const cursoNombre = Array.isArray(inscripto.cursos)
        ? inscripto.cursos[0]?.nombre
        : (inscripto.cursos as unknown as { nombre: string })?.nombre || 'Curso';

    const nombreCorto = inscripto.nombre.split(' ')[0];
    const subject = `Recibimos tu comprobante - CEUTA`;

    const content = `
        <h2 style="color: #111827; margin-top: 0; text-align: center;">¡Hola ${nombreCorto}!</h2>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6; text-align: center;">
            Hemos recibido tu comprobante de pago para el curso <strong>${cursoNombre}</strong>.
        </p>
        
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="margin: 0; color: #4b5563; font-size: 14px; text-align: center;">
                Nuestro equipo administrativo lo verificará a la brevedad.<br>
                Una vez verificado, recibirás un correo de confirmación final con todos los detalles para comenzar.
            </p>
        </div>
    `;

    const html = generateEmailHtml({
        title: 'Comprobante Recibido',
        content,
        previewText: 'Recibimos tu comprobante, lo estamos verificando.',
        badgeText: '⏳ Procesando Pago',
        badgeColor: 'warning'
    });

    const text = `Hola ${nombreCorto}, hemos recibido tu comprobante de pago para el curso ${cursoNombre}. Lo verificaremos a la brevedad y te avisaremos.`;

    return sendEmail({
        to: inscripto.email,
        subject,
        html,
        text,
    }, inscriptoId, 'comprobante_recibido');
}
