import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendEmail, cancelScheduledEmails } from '@/lib/services/emailService';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const adminClient = createAdminClient();

        // Obtener el estado anterior para detectar cambio a "verificado"
        const { data: previousData } = await adminClient
            .from('inscriptos')
            .select('estado, nombre, email, cursos(nombre)')
            .eq('id', id)
            .single();

        const wasVerified = previousData?.estado === 'verificado';
        const willBeVerified = body.estado === 'verificado';

        // Actualizar inscripción
        const { data, error } = await adminClient
            .from('inscriptos')
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        // Si cambió a "verificado" y no estaba verificado antes
        if (!wasVerified && willBeVerified && previousData) {
            // 1. Cancelar emails programados pendientes
            await cancelScheduledEmails(parseInt(id));

            // 2. Enviar email de confirmación de verificación
            const nombreCorto = previousData.nombre?.split(' ')[0] || 'Usuario';
            const cursoNombre = (previousData.cursos as { nombre?: string } | null)?.nombre || 'tu curso';

            await sendEmail({
                to: previousData.email,
                subject: `✅ ¡Tu inscripción a ${cursoNombre} está confirmada! - CEUTA`,
                html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2d6a4f; margin: 0;">CEUTA</h1>
            <p style="color: #6b7280; margin: 5px 0;">Centro Uruguayo de Tecnologías Apropiadas</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="background-color: #10b981; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 30px;">✓</span>
            </div>
        </div>
        
        <h2 style="color: #3d2914; text-align: center;">¡Felicidades ${nombreCorto}! 🎉</h2>
        
        <p style="font-size: 16px; color: #374151; text-align: center;">
            Tu inscripción al curso <strong>${cursoNombre}</strong> ha sido <strong style="color: #10b981;">confirmada</strong>.
        </p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #166534; margin-top: 0;">¿Qué sigue?</h3>
            <ul style="color: #374151; list-style: none; padding: 0; margin: 0;">
                <li style="padding: 8px 0;">📚 Te enviaremos más información sobre el inicio del curso</li>
                <li style="padding: 8px 0;">📧 Recibirás los materiales y accesos necesarios</li>
                <li style="padding: 8px 0;">💬 Ante cualquier duda, escribinos por WhatsApp</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://wa.me/59898843651" 
               style="display: inline-block; background-color: #25D366; color: white; 
                      padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                💬 Contactar por WhatsApp
            </a>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px;">
                ¡Nos vemos en el curso!
            </p>
            <p style="color: #9ca3af; font-size: 12px;">CEUTA - Canelones 1198, Montevideo</p>
        </div>
    </div>
</body>
</html>`,
                text: `¡Felicidades ${nombreCorto}!\n\nTu inscripción al curso "${cursoNombre}" ha sido CONFIRMADA.\n\n¿Qué sigue?\n- Te enviaremos más información sobre el inicio del curso\n- Recibirás los materiales y accesos necesarios\n- Ante cualquier duda, escribinos por WhatsApp: 098 843 651\n\n¡Nos vemos en el curso!\n\nCEUTA - Canelones 1198, Montevideo`,
            }, parseInt(id), 'verificacion_confirmada');

            console.log(`✅ Inscripción ${id} verificada - email de confirmación enviado a ${previousData.email}`);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating inscripto:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
