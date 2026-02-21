import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generateAccessToken, getTokenExpiry, generateMagicLink } from '@/lib/utils/tokens';
import { sendEmail } from '@/lib/services/emailService';

/**
 * POST /api/inscripcion/recuperar
 * 
 * Recupera acceso a una inscripción existente:
 * 1. Busca inscripciones pendientes por email
 * 2. Genera nuevo token
 * 3. Envía email con nuevo link
 * 
 * Body: { email: string, curso_id?: number }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, curso_id } = body;

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email requerido' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Buscar inscripciones activas (no canceladas ni verificadas)
        let query = supabase
            .from('inscriptos')
            .select(`
                id,
                nombre,
                email,
                estado,
                cursos (
                    id,
                    nombre
                )
            `)
            .eq('email', email.toLowerCase().trim())
            .in('estado', ['contacto', 'pago_pendiente', 'pago_a_verificar', 'primer_contacto', 'segundo_contacto']);

        if (curso_id) {
            query = query.eq('curso_id', curso_id);
        }

        const { data: inscripciones, error: findError } = await query;

        if (findError) {
            console.error('Error buscando inscripciones:', findError);
            return NextResponse.json(
                { success: false, message: 'Error buscando inscripciones' },
                { status: 500 }
            );
        }

        if (!inscripciones || inscripciones.length === 0) {
            // Responder genéricamente para evitar enumerar emails
            return NextResponse.json({
                success: true,
                message: 'Si existe una inscripción con ese email, recibirás un enlace de recuperación.',
            });
        }

        // Generar nuevos tokens y enviar emails
        let emailsSent = 0;

        for (const inscripcion of inscripciones) {
            const newToken = generateAccessToken();
            const newExpiry = getTokenExpiry(8); // 8 días
            const magicLink = generateMagicLink(newToken);
            // cursos viene como objeto (relación 1:1 por curso_id)
            const curso = inscripcion.cursos as { id?: number; nombre?: string } | null;
            const nombreCorto = inscripcion.nombre?.split(' ')[0] || 'Usuario';

            // Actualizar token en BD
            const { error: updateError } = await supabase
                .from('inscriptos')
                .update({
                    access_token: newToken,
                    token_expires_at: newExpiry.toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', inscripcion.id);

            if (updateError) {
                console.error('Error actualizando token:', updateError);
                continue;
            }

            // Enviar email de recuperación
            const emailResult = await sendEmail({
                to: inscripcion.email,
                subject: `Recuperá tu inscripción a ${curso?.nombre || 'tu curso'} - CEUTA`,
                html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 16px;">
        <h2 style="color: #3d2914;">¡Hola ${nombreCorto}!</h2>
        <p style="color: #374151; font-size: 16px;">
            Recibimos tu solicitud para acceder a tu inscripción a 
            <strong>${curso?.nombre || 'tu curso'}</strong>.
        </p>
        <p style="color: #374151; font-size: 16px;">
            Hacé click en el botón de abajo para continuar con tu inscripción:
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" 
               style="display: inline-block; background-color: #2d6a4f; color: white; 
                      padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                CONTINUAR MI INSCRIPCIÓN
            </a>
        </div>
        <p style="color: #9ca3af; font-size: 14px; text-align: center;">
            Este enlace es válido por 8 días.
        </p>
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Si no solicitaste este email, podés ignorarlo.
        </p>
    </div>
</body>
</html>`,
                text: `¡Hola ${nombreCorto}!\n\nRecibimos tu solicitud para acceder a tu inscripción a ${curso?.nombre || 'tu curso'}.\n\nAccedé desde acá: ${magicLink}\n\nEste enlace es válido por 8 días.\n\nCEUTA`,
            }, inscripcion.id, 'recuperacion');

            if (emailResult.success) {
                emailsSent++;
            }
        }

        console.log(`🔄 Recuperación: ${emailsSent} emails enviados para ${email}`);

        return NextResponse.json({
            success: true,
            message: 'Si existe una inscripción con ese email, recibirás un enlace de recuperación.',
        });

    } catch (error) {
        console.error('Error en endpoint de recuperación:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}
