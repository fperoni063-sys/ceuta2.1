import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    if (!token || token.length < 32) {
        return NextResponse.json(
            { success: false, message: 'Token inválido' },
            { status: 400 }
        );
    }

    const supabase = createAdminClient();

    // Buscar inscripción por token
    const { data: inscripcion, error } = await supabase
        .from('inscriptos')
        .select(`
            id,
            nombre,
            email,
            telefono,
            cedula,
            estado,
            metodo_pago,
            created_at,
            veces_visitado,
            token_expires_at,
            precio_pagado,
            descuento_aplicado,
            cursos:curso_id (
                id,
                nombre,
                slug,
                precio,
                descripcion,
                imagen_portada,
                link_mercado_pago,
                fecha_inicio,
                modalidad,
                lugar,
                duracion,
                cantidad_cuotas,
                categoria,
                nivel,
                transformacion_hook,
                fecha_a_confirmar,
                lugar_a_confirmar,
                es_inscripcion_anticipada,
                descuento_porcentaje,
                descuento_cupos_totales,
                descuento_cupos_usados,
                descuento_etiqueta,
                descuento_online_porcentaje,
                descuento_online_etiqueta,
                descuento_fecha_fin,
                precio_online
            )
        `)
        .eq('access_token', token)
        .single();

    if (error || !inscripcion) {
        return NextResponse.json(
            { success: false, message: 'Preinscripción no encontrada' },
            { status: 404 }
        );
    }

    // Verificar si el token expiró
    if (inscripcion.token_expires_at) {
        const expiry = new Date(inscripcion.token_expires_at);
        if (expiry < new Date()) {
            // Ocultar parcialmente el email para privacidad
            const emailParts = inscripcion.email.split('@');
            const hiddenEmail = emailParts[0].substring(0, 2) + '***@' + emailParts[1];

            return NextResponse.json({
                success: false,
                expired: true,
                message: 'Este enlace ha expirado',
                emailHint: hiddenEmail,
                cursoId: (inscripcion.cursos as { id?: number } | null)?.id,
                cursoNombre: (inscripcion.cursos as { nombre?: string } | null)?.nombre,
            }, { status: 410 });
        }
    }

    // Actualizar contador de visitas
    await supabase
        .from('inscriptos')
        .update({
            veces_visitado: (inscripcion.veces_visitado || 0) + 1,
            ultima_visita: new Date().toISOString()
        })
        .eq('id', inscripcion.id);

    return NextResponse.json({
        success: true,
        data: {
            id: inscripcion.id,
            nombre: inscripcion.nombre,
            email: inscripcion.email,
            cedula: inscripcion.cedula,
            estado: inscripcion.estado,
            metodo_pago: inscripcion.metodo_pago,
            fecha_inscripcion: inscripcion.created_at,
            curso: inscripcion.cursos,
        }
    });
}
