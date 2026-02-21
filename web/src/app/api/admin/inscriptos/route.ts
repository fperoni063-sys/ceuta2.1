import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/inscriptos
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const estadoFilter = searchParams.get('estado');

        const adminClient = createAdminClient();
        let query = adminClient
            .from('inscriptos')
            // Need to join with cursos to get names
            // Note: RLS on cursos allows read so this join should benefit from standard access or service role
            .select(`
                id,
                nombre,
                email,
                telefono,
                cedula,
                estado,
                metodo_pago,
                codigo_descuento,
                monto_pagado,
                monto_pago,
                comprobante_url,
                notas,
                created_at,
                cursos (nombre, precio)
            `)
            .order('created_at', { ascending: false });

        if (estadoFilter) {
            // Support multiple states via comma separation if needed, but for now exact match per existing code
            // The existing code uses .in('estado', [...]) for pagos page and .eq for inscriptos page
            if (estadoFilter.includes(',')) {
                query = query.in('estado', estadoFilter.split(','));
            } else {
                query = query.eq('estado', estadoFilter);
            }
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
