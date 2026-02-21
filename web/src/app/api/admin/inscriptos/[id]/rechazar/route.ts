import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { sendPaymentStatusEmail } from '@/lib/services/emailService';

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const id = parseInt(params.id);
        const body = await request.json();
        const { motivo } = body;

        if (!motivo) {
            return NextResponse.json(
                { error: 'El motivo de rechazo es requerido' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // 1. Verify user exists
        const { data: inscripto, error: fetchError } = await supabase
            .from('inscriptos')
            .select('id')
            .eq('id', id)
            .single();

        if (fetchError || !inscripto) {
            return NextResponse.json(
                { error: 'Inscripto no encontrado' },
                { status: 404 }
            );
        }

        // 2. Get current admin user
        const supabaseAuth = await createClient();
        const { data: { user } } = await supabaseAuth.auth.getUser();

        // 3. Update status and reason
        const { error: updateError } = await supabase
            .from('inscriptos')
            .update({
                estado: 'rechazado',
                motivo_rechazo: motivo,
                revisado_at: new Date().toISOString(),
                revisado_por: user?.id
            })
            .eq('id', id);

        if (updateError) {
            return NextResponse.json(
                { error: 'Error al actualizar estado' },
                { status: 500 }
            );
        }

        // 3. Send rejection email
        await sendPaymentStatusEmail(id, 'rejected', motivo);

        return NextResponse.json({
            success: true,
            message: 'Pago rechazado exitosamente'
        });

    } catch (error) {
        console.error('Error rejecting payment:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
