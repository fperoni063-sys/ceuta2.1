import nodemailer from 'nodemailer';
import { createAdminClient } from '@/lib/supabase/server';
import { generateEmailHtml } from '@/lib/utils/email-layout';

// Inicializar Transporter de Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
});

export interface EmailData {
    to: string;
    subject: string;
    html: string;
    text: string;
}

/**
 * Envía un email usando Resend y registra en el log
 */
export async function sendEmail(
    data: EmailData,
    inscriptoId?: number,
    templateNombre?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createAdminClient();

    // Debug Logs para ayudar en Vercel
    console.log(`📧 Preparing to send email to: ${data.to}`);

    // Validar configuración
    // Validar configuración
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.error('❌ SMTP Credentials are missing via process.env');
        return { success: false, error: 'Configuration Error: SMTP Credentials missing' };
    }

    try {
        // Enviar email vía Nodemailer
        const info = await transporter.sendMail({
            from: `"CEUTA" <${process.env.SMTP_USER}>`, // Remitente
            to: data.to,
            subject: data.subject,
            html: data.html,
            text: data.text,
        });

        console.log(`✅ Email sent successfully via Nodemailer. MessageId: ${info.messageId}`);

        // Registrar éxito en log
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
                p_inscripto_id: inscriptoId
            });
        }

        return { success: true };

    } catch (error: any) {
        console.error('❌ Nodemailer Error:', error);

        // Registrar fallo en BD
        if (inscriptoId) {
            await supabase.from('email_logs').insert({
                inscripto_id: inscriptoId,
                template_nombre: templateNombre,
                email_destino: data.to,
                asunto: data.subject,
                estado: 'failed',
                error_mensaje: error.message || 'Unknown error',
            });
        }
        return { success: false, error: error.message };
    }

    // (Code removed)

    // (Code removed)
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

    console.log(`📧 Email sequence scheduled for inscripto ${inscriptoId}`);
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

    console.log(`🚫 Cancelled scheduled emails for inscripto ${inscriptoId}`);
}

/**
 * Envía email de estado de pago (Confirmado / Rechazado)
 * Busca el template correspondiente en la base de datos
 */
export async function sendPaymentStatusEmail(
    inscriptoId: number,
    status: 'approved' | 'rejected',
    rejectReason?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createAdminClient();

    // 1. Obtener datos del inscripto
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

    // 2. Determinar template
    const templateName = status === 'approved' ? 'pago_confirmado' : 'pago_rechazado';

    // 3. Obtener template
    const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('nombre', templateName)
        .eq('activo', true)
        .single();

    if (templateError || !template) {
        return { success: false, error: `Template ${templateName} no encontrado` };
    }

    // 4. Reemplazar variables
    let subject = template.asunto;
    let html = template.contenido_html;
    let text = template.contenido_texto;

    const nombreCorto = inscripto.nombre.split(' ')[0];
    const linkInscripcion = `${process.env.NEXT_PUBLIC_APP_URL}/mi-inscripcion/${inscripto.access_token}`;


    // Type casting for relationship
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

    // Aplicar reemplazos
    Object.entries(replacements).forEach(([key, value]) => {
        subject = subject.replace(new RegExp(key, 'g'), value);
        html = html.replace(new RegExp(key, 'g'), value);
        text = text.replace(new RegExp(key, 'g'), value);
    });

    // 5. Enviar email
    return sendEmail({
        to: inscripto.email,
        subject: subject,
        html: html,
        text: text
    }, inscriptoId, templateName);
}

/**
 * Envía email confirmando la recepción del comprobante
 */
export async function sendPaymentProofReceivedEmail(
    inscriptoId: number
): Promise<{ success: boolean; error?: string }> {
    const supabase = createAdminClient();

    // 1. Obtener datos del inscripto
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

    // 2. Definir contenido (Hardcoded por ahora para asegurar funcionalidad, idealmente mover a DB)
    const cursoNombre = Array.isArray(inscripto.cursos)
        ? inscripto.cursos[0]?.nombre
        : (inscripto.cursos as unknown as { nombre: string })?.nombre || 'Curso';

    const nombreCorto = inscripto.nombre.split(' ')[0];
    const subject = `Recibimos tu comprobante - CEUTA`;

    // Contenido específico del correo
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

    // 3. Enviar email
    return sendEmail({
        to: inscripto.email,
        subject: subject,
        html: html,
        text: text
    }, inscriptoId, 'comprobante_recibido');
}
