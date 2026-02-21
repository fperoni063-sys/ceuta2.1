import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/inscripcion/cancelar
 * 
 * Cancela una preinscripción:
 * 1. Actualiza estado a 'cancelado' en tabla inscriptos
 * 2. Cancela todos los emails programados pendientes
 * 
 * Body: { token: string } o { inscripcion_id: number }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, inscripcion_id } = body;

        if (!token && !inscripcion_id) {
            return NextResponse.json(
                { success: false, message: 'Se requiere token o inscripcion_id' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Buscar la inscripción
        let query = supabase.from('inscriptos').select('id, estado');

        if (token) {
            query = query.eq('access_token', token);
        } else {
            query = query.eq('id', inscripcion_id);
        }

        const { data: inscripcion, error: findError } = await query.single();

        if (findError || !inscripcion) {
            return NextResponse.json(
                { success: false, message: 'Inscripción no encontrada' },
                { status: 404 }
            );
        }

        // No cancelar si ya está verificado
        if (inscripcion.estado === 'verificado') {
            return NextResponse.json(
                { success: false, message: 'No se puede cancelar una inscripción ya verificada' },
                { status: 400 }
            );
        }

        // 1. Actualizar estado a 'cancelado'
        const { error: updateError } = await supabase
            .from('inscriptos')
            .update({
                estado: 'cancelado',
                updated_at: new Date().toISOString(),
            })
            .eq('id', inscripcion.id);

        if (updateError) {
            console.error('Error updating inscripcion:', updateError);
            return NextResponse.json(
                { success: false, message: 'Error al cancelar inscripción' },
                { status: 500 }
            );
        }

        // 2. Cancelar todos los emails programados pendientes
        const { error: cancelEmailsError } = await supabase
            .from('scheduled_emails')
            .update({ estado: 'cancelled' })
            .eq('inscripto_id', inscripcion.id)
            .eq('estado', 'pending');

        if (cancelEmailsError) {
            console.error('Error cancelling emails:', cancelEmailsError);
            // No fallar, solo loguear - la cancelación principal ya se hizo
        }

        console.log(`🚫 Inscripción ${inscripcion.id} cancelada y emails programados cancelados`);

        return NextResponse.json({
            success: true,
            message: 'Inscripción cancelada correctamente',
            id: inscripcion.id,
        });

    } catch (error) {
        console.error('Error in cancelar endpoint:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}
