import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { sendPaymentStatusEmail, cancelScheduledEmails } from '@/lib/services/emailService';

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const id = parseInt(params.id);
        const supabase = createAdminClient();

        // 1. Verify user exists
        const { data: inscripto, error: fetchError } = await supabase
            .from('inscriptos')
            .select('id, nombre, email')
            .eq('id', id)
            .single();

        if (fetchError || !inscripto) {
            return NextResponse.json(
                { error: 'Inscripto no encontrado' },
                { status: 404 }
            );
        }

        // 2. Get current admin user
        console.log('Verifying admin session...');
        const supabaseAuth = await createClient();
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

        if (authError || !user) {
            console.error('Auth error or no session found:', authError);
            return NextResponse.json(
                { error: 'No autorizado. Debes iniciar sesión nuevamente.' },
                { status: 401 }
            );
        }

        console.log(`Updating status for inscripto ${id} by user ${user.id}...`);
        // 3. Update status
        const { error: updateError } = await supabase
            .from('inscriptos')
            .update({
                estado: 'verificado',
                revisado_at: new Date().toISOString(),
                revisado_por: user.id
            })
            .eq('id', id);

        if (updateError) {
            console.error('Error updating status in DB:', updateError);
            return NextResponse.json(
                { error: 'Error al actualizar estado en la base de datos' },
                { status: 500 }
            );
        }

        console.log('Cancelling scheduled reminders...');
        // 3. Cancel scheduled emails (payment reminders)
        try {
            await cancelScheduledEmails(id);
        } catch (e) {
            console.error('Non-blocking error cancelling emails:', e);
        }

        console.log('Sending confirmation email...');
        // 4. Send confirmation email
        const emailResult = await sendPaymentStatusEmail(id, 'approved');

        if (!emailResult.success) {
            console.warn('Email could not be sent, but enrollment was verified:', emailResult.error);
        }

        return NextResponse.json({
            success: true,
            message: 'Pago verificado exitosamente',
            emailSent: emailResult.success
        });

    } catch (error) {
        console.error('CRITICAL: Error verifying payment:', error);
        return NextResponse.json(
            {
                error: 'Error interno del servidor',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
