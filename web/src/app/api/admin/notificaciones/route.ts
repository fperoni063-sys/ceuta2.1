import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/notificaciones
 * Fetch recent pending payment verifications for the notification dropdown
 * Returns the 5 most recent and a count of total pending
 */
export async function GET() {
    try {
        const supabase = createAdminClient();

        // Get total count of pending verifications
        const { count } = await supabase
            .from('inscriptos')
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'pago_a_verificar');

        // Get the 5 most recent pending
        const { data, error } = await supabase
            .from('inscriptos')
            .select(`
                id,
                nombre,
                email,
                comprobante_url,
                metodo_pago,
                monto_pagado,
                updated_at,
                cursos:curso_id (
                    nombre,
                    precio
                )
            `)
            .eq('estado', 'pago_a_verificar')
            .not('comprobante_url', 'is', null)
            .order('updated_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Error fetching notificaciones:', error);
            return NextResponse.json(
                { error: 'Error al obtener notificaciones' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            notifications: data || [],
            pendingCount: count || 0
        });

    } catch (error) {
        console.error('Error in notificaciones API:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
