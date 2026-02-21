import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/services/emailService';
import { generateEmailHtml } from '@/lib/utils/email-layout';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nombre, email, asunto, mensaje } = body;

        // 1. Basic Validation
        if (!nombre || !email || !mensaje) {
            return NextResponse.json(
                { error: 'Faltan campos obligatorios' },
                { status: 400 }
            );
        }

        // 2. Get Contact Email from Config
        const adminClient = createAdminClient();
        const { data: configData, error: configError } = await adminClient
            .from('configuracion')
            .select('valor')
            .eq('clave', 'email_contacto')
            .single();

        let destinationEmail = 'secretaria@ceuta.org.uy'; // Fallback

        if (!configError && configData?.valor) {
            destinationEmail = configData.valor;
        }

        // 3. Prepare Email Content with Standard Layout
        const html = generateEmailHtml({
            title: 'Nueva Consulta Web',
            content: `
                <div style="margin-bottom: 20px;">
                    <p style="font-size: 16px;"><strong>Tienes un nuevo mensaje del formulario de contacto:</strong></p>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                    <tr>
                        <td style="padding: 12px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; width: 120px; color: #6b7280;"><strong>De:</strong></td>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${nombre} (${email})</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Asunto:</strong></td>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${asunto || 'Nueva consulta'}</td>
                    </tr>
                </table>

                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; color: #374151; line-height: 1.6;">
                    ${mensaje.replace(/\n/g, '<br/>')}
                </div>
                
                <p style="margin-top: 24px; font-size: 12px; color: #9ca3af; text-align: center;">
                    Este mensaje fue enviado desde el sitio web oficial de CEUTA.
                </p>
            `,
            previewText: `Nuevo mensaje de ${nombre}: ${asunto || 'Consulta'}`,
            badgeText: '📬 Contacto',
            badgeColor: 'info'
        });

        // 4. Send Email via Service (Logs to DB & uses centralized config)
        const result = await sendEmail({
            to: destinationEmail,
            subject: `[Web] ${asunto || 'Nueva consulta'}`,
            html: html,
            text: `De: ${nombre} (${email})\nAsunto: ${asunto}\n\n${mensaje}`
        });

        if (!result.success) {
            console.error('Failed to send contact email:', result.error);
            return NextResponse.json(
                { error: 'Error al enviar el correo. Por favor, intente nuevamente más tarde.' },
                { status: 500 }
            );
        }

        console.log(`✅ Contact email sent to ${destinationEmail}`);
        return NextResponse.json({ success: true, message: 'Email enviado correctamente' });

    } catch (error) {
        console.error('Error handling contact form:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor al procesar su solicitud.' },
            { status: 500 }
        );
    }
}
